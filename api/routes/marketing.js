import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';
import { insertOne, updateById, deleteById, increment } from '../../lib/supabase-helpers.js';

const router = Router();

// --- Sponsored Ads ---

// Handles both public click tracking and admin updates
router.put('/sponsored-ads', async (req, res, next) => {
    try {
        if (req.body.trackClick) {
            // Public action: track a click
            const { id } = req.body;
            const updatedAd = await increment(req.db, 'sponsored_ads', id, 'clicks', 1);
            return res.status(200).json({ message: 'Click tracked' });
        } else {
            // Admin action: update an ad
            if (!req.session.isAdmin) return res.status(401).json({ message: 'Unauthorized' });
            
            const { id: adId, clicks, ...updateData } = req.body;
            const updatedAd = await updateById(req.db, 'sponsored_ads', adId, {
                title: updateData.title,
                url: updateData.url || updateData.destinationUrl,
                image_url: updateData.imageUrl
            });
            
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Sponsored Ad Updated',
                details: `Ad updated for ${updatedAd.url}`,
                timestamp: new Date().toISOString()
            });
            
            return res.status(200).json(updatedAd);
        }
    } catch (error) {
        next(error);
    }
});

router.post('/sponsored-ads', requireAdmin, async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        const newAd = await insertOne(req.db, 'sponsored_ads', {
            id,
            title: newItemData.title,
            url: newItemData.url || newItemData.destinationUrl,
            image_url: newItemData.imageUrl,
            clicks: 0
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Sponsored Ad Added',
            details: `Ad added for ${newAd.url}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json(newAd);
    } catch (error) {
        next(error);
    }
});

router.delete('/sponsored-ads', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'sponsored_ads', deleteId);
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Sponsored Ad Deleted',
            details: `Ad with id ${deleteId} deleted.`,
            timestamp: new Date().toISOString()
        });
        
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// --- Custom Emails & Templates (all admin) ---
router.post('/custom-emails', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });
        
        const { subject, body } = req.body;
        const id = uuidv4();
        const newEmail = await insertOne(req.db, 'custom_emails', {
            id,
            recipient: 'subscribers',
            subject,
            body,
            sent_at: new Date().toISOString()
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Email Campaign Sent',
            details: `Campaign sent: ${subject}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json(newEmail);
    } catch (error) {
        next(error);
    }
});

router.delete('/custom-emails', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'custom_emails', deleteId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post('/email-templates', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });
        
        const newItemData = req.body;
        const id = uuidv4();
        const newTemplate = await insertOne(req.db, 'email_templates', {
            id,
            name: newItemData.name,
            subject: newItemData.subject,
            body: newItemData.body
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Email Template Created',
            details: `Template created: ${newItemData.name}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json(newTemplate);
    } catch (error) {
        next(error);
    }
});

router.put('/email-templates', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });

        const { id: templateId, ...updateData } = req.body;
        const updatedTemplate = await updateById(req.db, 'email_templates', templateId, {
            name: updateData.name,
            subject: updateData.subject,
            body: updateData.body
        });

        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Email Template Updated',
            details: `Template updated: ${updateData.name}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json(updatedTemplate);
    } catch (error) {
        next(error);
    }
});

router.delete('/email-templates', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });

        const { id: deleteId } = req.body;
        await deleteById(req.db, 'email_templates', deleteId);

        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Email Template Deleted',
            details: `Template with id ${deleteId} deleted.`,
            timestamp: new Date().toISOString()
        });
        
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
