import { Router } from 'express';
import { requireAdmin } from '../middleware/adminProtection.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a new version when content is updated
router.post('/versions', requireAdmin, async (req, res, next) => {
    try {
        const { contentId, contentType, title, content, metadata } = req.body;
        
        if (!contentId || !contentType || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Get current version number
        const { data: existingVersions, error: fetchError } = await req.db
            .from('content_versions')
            .select('version_number')
            .eq('content_id', contentId)
            .order('version_number', { ascending: false })
            .limit(1);
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }
        
        const versionNumber = existingVersions && existingVersions.length > 0 
            ? existingVersions[0].version_number + 1 
            : 1;
        
        // Create new version
        const { data: newVersion, error: insertError } = await req.db
            .from('content_versions')
            .insert({
                id: uuidv4(),
                content_id: contentId,
                content_type: contentType,
                version_number: versionNumber,
                title: title,
                content: content,
                metadata: metadata || {},
                created_by: req.session.userId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (insertError) {
            throw insertError;
        }
        
        res.status(201).json({
            success: true,
            version: newVersion
        });
    } catch (error) {
        next(error);
    }
});

// Get version history for a content item
router.get('/versions/:contentId', requireAdmin, async (req, res, next) => {
    try {
        const contentId = req.params.contentId;
        const limit = parseInt(req.query.limit) || 50;
        
        const { data: versions, error } = await req.db
            .from('content_versions')
            .select('*')
            .eq('content_id', contentId)
            .order('version_number', { ascending: false })
            .limit(limit);
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        res.status(200).json({
            versions: versions || [],
            total: versions?.length || 0
        });
    } catch (error) {
        next(error);
    }
});

// Get a specific version
router.get('/versions/:contentId/:versionNumber', requireAdmin, async (req, res, next) => {
    try {
        const { contentId, versionNumber } = req.params;
        
        const { data: version, error } = await req.db
            .from('content_versions')
            .select('*')
            .eq('content_id', contentId)
            .eq('version_number', parseInt(versionNumber))
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Version not found' });
            }
            throw error;
        }
        
        res.status(200).json({ version });
    } catch (error) {
        next(error);
    }
});

// Restore a specific version (create new version with old content)
router.post('/versions/:contentId/:versionNumber/restore', requireAdmin, async (req, res, next) => {
    try {
        const { contentId, versionNumber } = req.params;
        
        // Get the version to restore
        const { data: versionToRestore, error: fetchError } = await req.db
            .from('content_versions')
            .select('*')
            .eq('content_id', contentId)
            .eq('version_number', parseInt(versionNumber))
            .single();
        
        if (fetchError || !versionToRestore) {
            return res.status(404).json({ error: 'Version not found' });
        }
        
        // Get current latest version number
        const { data: latestVersion } = await req.db
            .from('content_versions')
            .select('version_number')
            .eq('content_id', contentId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();
        
        const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
        
        // Create new version with restored content
        const { data: restoredVersion, error: insertError } = await req.db
            .from('content_versions')
            .insert({
                id: uuidv4(),
                content_id: contentId,
                content_type: versionToRestore.content_type,
                version_number: newVersionNumber,
                title: versionToRestore.title,
                content: versionToRestore.content,
                metadata: {
                    ...versionToRestore.metadata,
                    restored_from_version: parseInt(versionNumber),
                    restored_at: new Date().toISOString()
                },
                created_by: req.session.userId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (insertError) {
            throw insertError;
        }
        
        // Update the actual content (posts, jobs, etc.)
        const contentTable = versionToRestore.content_type === 'job' ? 'jobs' : 'content_posts';
        
        const { error: updateError } = await req.db
            .from(contentTable)
            .update({
                title: versionToRestore.title,
                content: versionToRestore.content,
                description: versionToRestore.content,
                updated_at: new Date().toISOString()
            })
            .eq('id', contentId);
        
        if (updateError) {
            console.error('Failed to update content:', updateError);
        }
        
        res.status(200).json({
            success: true,
            message: `Restored to version ${versionNumber}`,
            newVersion: restoredVersion
        });
    } catch (error) {
        next(error);
    }
});

// Delete a specific version
router.delete('/versions/:contentId/:versionNumber', requireAdmin, async (req, res, next) => {
    try {
        const { contentId, versionNumber } = req.params;
        
        // Don't allow deletion of the latest version
        const { data: latestVersion } = await req.db
            .from('content_versions')
            .select('version_number')
            .eq('content_id', contentId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();
        
        if (latestVersion && latestVersion.version_number === parseInt(versionNumber)) {
            return res.status(400).json({ error: 'Cannot delete the latest version' });
        }
        
        const { error } = await req.db
            .from('content_versions')
            .delete()
            .eq('content_id', contentId)
            .eq('version_number', parseInt(versionNumber));
        
        if (error) {
            throw error;
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Version deleted successfully' 
        });
    } catch (error) {
        next(error);
    }
});

// Compare two versions
router.get('/versions/:contentId/compare/:version1/:version2', requireAdmin, async (req, res, next) => {
    try {
        const { contentId, version1, version2 } = req.params;
        
        const { data: versions, error } = await req.db
            .from('content_versions')
            .select('*')
            .eq('content_id', contentId)
            .in('version_number', [parseInt(version1), parseInt(version2)])
            .order('version_number', { ascending: true });
        
        if (error || !versions || versions.length !== 2) {
            return res.status(404).json({ error: 'Versions not found' });
        }
        
        // Calculate differences
        const [older, newer] = versions;
        const differences = {
            title: {
                changed: older.title !== newer.title,
                old: older.title,
                new: newer.title
            },
            content: {
                changed: older.content !== newer.content,
                oldLength: older.content?.length || 0,
                newLength: newer.content?.length || 0
            },
            metadata: {
                changed: JSON.stringify(older.metadata) !== JSON.stringify(newer.metadata),
                old: older.metadata,
                new: newer.metadata
            }
        };
        
        res.status(200).json({
            version1: older,
            version2: newer,
            differences
        });
    } catch (error) {
        next(error);
    }
});

export default router;
