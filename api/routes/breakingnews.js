import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { insertOne, updateById, deleteById } from '../../lib/supabase-helpers.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        const newItem = await insertOne(req.db, 'breaking_news', {
            id,
            title: newItemData.text || newItemData.title,
            link: newItemData.link || null
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Breaking News Added',
            details: `News added: ${newItem.title}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json(newItem);
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: itemId, ...updateData } = req.body;
        const updatedItem = await updateById(req.db, 'breaking_news', itemId, {
            title: updateData.text || updateData.title,
            link: updateData.link || null
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Breaking News Updated',
            details: `News updated: ${updatedItem.title}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'breaking_news', deleteId);
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Breaking News Deleted',
            details: `News item with id ${deleteId} deleted.`,
            timestamp: new Date().toISOString()
        });
        
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
