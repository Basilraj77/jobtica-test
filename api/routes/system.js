import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';
import { getSupabaseClient } from '../../lib/supabase.js';
import { insertOne, upsertSetting, deleteById } from '../../lib/supabase-helpers.js';

const router = Router();
router.use(requireAdmin);

// GET /api/system/db-status - Check database connection
router.get('/db-status', async (req, res, next) => {
    try {
        const supabase = getSupabaseClient();
        // Simple query to ensure the connection is working
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
        
        res.status(200).json({ status: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'An unknown database error occurred.' });
    }
});

// --- Settings ---
router.post('/settings', async (req, res, next) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ message: 'Bad Request: key and value are required.' });
        }
        
        await upsertSetting(req.db, key, value);
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Settings Updated',
            details: `${key} settings updated.`,
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({ message: 'Settings updated' });
    } catch (error) {
        next(error);
    }
});

// --- Activity Logs ---
router.post('/activity-logs', async (req, res, next) => {
    try {
        const { action, details } = req.body;
        const id = uuidv4();
        const newLog = await insertOne(req.db, 'activity_logs', {
            id,
            action,
            details,
            timestamp: new Date().toISOString()
        });
        res.status(201).json(newLog);
    } catch (error) {
        next(error);
    }
});

router.delete('/activity-logs', async (req, res, next) => {
    try {
        if (req.body.clearAll) {
            const { error } = await req.db
                .from('activity_logs')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            
            if (error) throw new Error(error.message);
            
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Logs Cleared',
                details: 'All activity logs were cleared.',
                timestamp: new Date().toISOString()
            });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// --- Email Notifications History ---
router.delete('/email-notifications', async (req, res, next) => {
    try {
        if (req.body.clearAll) {
            const { error } = await req.db
                .from('email_notifications')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            
            if (error) throw new Error(error.message);
            
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Email Notifications Cleared',
                details: 'All email notification records were cleared.',
                timestamp: new Date().toISOString()
            });
        } else if (req.body.id) {
            const { id } = req.body;
            await deleteById(req.db, 'email_notifications', id);
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Email Notification Deleted',
                details: `Email notification record with id ${id} deleted.`,
                timestamp: new Date().toISOString()
            });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
