import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';
import { insertOne, selectOne, deleteById } from '../../lib/supabase-helpers.js';

const router = Router();

// --- Subscribers ---

// POST /api/audience/subscribers - Public endpoint for new subscriptions
router.post('/subscribers', async (req, res, next) => {
    try {
        const { email } = req.body;
        const existing = await selectOne(req.db, 'subscribers', 'email', email);
        if (existing) {
            return res.status(409).json({ message: 'This email is already subscribed.' });
        }
        const id = uuidv4();
        const newSubscriber = await insertOne(req.db, 'subscribers', {
            id,
            email,
            subscription_date: new Date().toISOString()
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'New Subscriber',
            details: `New subscriber: ${email}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json(newSubscriber);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/audience/subscribers - Admin-only endpoint for deleting a subscriber
router.delete('/subscribers', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'subscribers', deleteId);
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Subscriber Deleted',
            details: `Subscriber with id ${deleteId} deleted.`,
            timestamp: new Date().toISOString()
        });
        
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// --- Contacts ---

// POST /api/audience/contacts - Public endpoint for new submissions
router.post('/contacts', async (req, res, next) => {
    try {
        const submissionData = req.body;
        const id = uuidv4();
        const newContact = await insertOne(req.db, 'contact_submissions', {
            id,
            name: submissionData.name,
            email: submissionData.email,
            message: submissionData.message || submissionData.subject,
            submitted_at: new Date().toISOString()
        });
        
        res.status(201).json(newContact);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/audience/contacts - Admin-only endpoint for deleting submissions
router.delete('/contacts', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'contact_submissions', deleteId);
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Contact Deleted',
            details: `Contact message with id ${deleteId} deleted.`,
            timestamp: new Date().toISOString()
        });
        
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
