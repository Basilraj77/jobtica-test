import { Router } from 'express';
import { requireAdmin } from '../middleware/adminProtection.js';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images, PDFs, and documents
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
        }
    }
});

// Initialize Supabase client
const getSupabaseClient = (req) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return createClient(supabaseUrl, supabaseKey);
};

// Upload file to Supabase Storage
router.post('/upload', requireAdmin, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const supabase = getSupabaseClient(req);
        const file = req.file;
        const folder = req.body.folder || 'general';
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const extension = file.originalname.split('.').pop();
        const filename = `${timestamp}-${randomStr}.${extension}`;
        const filepath = `${folder}/${filename}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('media')
            .upload(filepath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ error: 'Failed to upload file', details: error.message });
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(filepath);
        
        // Store metadata in database
        const { data: mediaRecord, error: dbError } = await req.db
            .from('media_files')
            .insert({
                filename: file.originalname,
                filepath: filepath,
                url: urlData.publicUrl,
                mimetype: file.mimetype,
                size: file.size,
                folder: folder,
                uploaded_by: req.session.userId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (dbError) {
            console.error('Database insert error:', dbError);
            // File uploaded but metadata save failed - not critical
        }
        
        res.status(200).json({
            success: true,
            file: {
                id: mediaRecord?.id,
                filename: file.originalname,
                url: urlData.publicUrl,
                size: file.size,
                mimetype: file.mimetype,
                folder: folder
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        next(error);
    }
});

// Get list of uploaded files
router.get('/files', requireAdmin, async (req, res, next) => {
    try {
        const folder = req.query.folder || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        
        let query = req.db
            .from('media_files')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (folder) {
            query = query.eq('folder', folder);
        }
        
        const { data: files, error, count } = await query;
        
        if (error) {
            // If table doesn't exist, return empty array
            if (error.code === 'PGRST116') {
                return res.status(200).json({
                    files: [],
                    total: 0,
                    page,
                    limit,
                    totalPages: 0
                });
            }
            throw error;
        }
        
        res.status(200).json({
            files: files || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        });
    } catch (error) {
        next(error);
    }
});

// Delete file from Supabase Storage
router.delete('/files/:id', requireAdmin, async (req, res, next) => {
    try {
        const fileId = req.params.id;
        
        // Get file metadata
        const { data: file, error: fetchError } = await req.db
            .from('media_files')
            .select('*')
            .eq('id', fileId)
            .single();
        
        if (fetchError || !file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Delete from Supabase Storage
        const supabase = getSupabaseClient(req);
        const { error: storageError } = await supabase.storage
            .from('media')
            .remove([file.filepath]);
        
        if (storageError) {
            console.error('Supabase delete error:', storageError);
        }
        
        // Delete metadata from database
        const { error: dbError } = await req.db
            .from('media_files')
            .delete()
            .eq('id', fileId);
        
        if (dbError) {
            throw dbError;
        }
        
        res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Get file details
router.get('/files/:id', requireAdmin, async (req, res, next) => {
    try {
        const fileId = req.params.id;
        
        const { data: file, error } = await req.db
            .from('media_files')
            .select('*')
            .eq('id', fileId)
            .single();
        
        if (error || !file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        res.status(200).json({ file });
    } catch (error) {
        next(error);
    }
});

// Get folders list
router.get('/folders', requireAdmin, async (req, res, next) => {
    try {
        const { data: files, error } = await req.db
            .from('media_files')
            .select('folder');
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        // Get unique folders
        const folders = [...new Set((files || []).map(f => f.folder).filter(Boolean))];
        
        res.status(200).json({ folders: folders.sort() });
    } catch (error) {
        next(error);
    }
});

// Bulk delete files
router.post('/files/bulk-delete', requireAdmin, async (req, res, next) => {
    try {
        const { fileIds } = req.body;
        
        if (!Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ error: 'Invalid file IDs' });
        }
        
        // Get file metadata
        const { data: files, error: fetchError } = await req.db
            .from('media_files')
            .select('*')
            .in('id', fileIds);
        
        if (fetchError) {
            throw fetchError;
        }
        
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No files found' });
        }
        
        // Delete from Supabase Storage
        const supabase = getSupabaseClient(req);
        const filepaths = files.map(f => f.filepath);
        const { error: storageError } = await supabase.storage
            .from('media')
            .remove(filepaths);
        
        if (storageError) {
            console.error('Supabase bulk delete error:', storageError);
        }
        
        // Delete metadata from database
        const { error: dbError } = await req.db
            .from('media_files')
            .delete()
            .in('id', fileIds);
        
        if (dbError) {
            throw dbError;
        }
        
        res.status(200).json({ 
            success: true, 
            message: `${files.length} file(s) deleted successfully`,
            deletedCount: files.length
        });
    } catch (error) {
        next(error);
    }
});

export default router;
