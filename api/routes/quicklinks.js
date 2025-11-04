import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { insertOne, updateById, deleteById } from '../../lib/supabase-helpers.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const linkData = req.body;
        const id = uuidv4();
        const newLink = await insertOne(req.db, 'quick_links', {
            id,
            title: linkData.title,
            url: linkData.url,
            description: linkData.description || null
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Quick Link Created',
            details: `Link added: ${linkData.title}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json(newLink);
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: linkId, ...updateData } = req.body;
        const updatedLink = await updateById(req.db, 'quick_links', linkId, {
            title: updateData.title,
            url: updateData.url,
            description: updateData.description || null
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Quick Link Updated',
            details: `Link updated: ${updatedLink.title}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json(updatedLink);
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'quick_links', deleteId);
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Quick Link Deleted',
            details: `Link with id ${deleteId} deleted.`,
            timestamp: new Date().toISOString()
        });
        
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
