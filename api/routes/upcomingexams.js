import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { insertOne, updateById, deleteById } from '../../lib/supabase-helpers.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        const newItem = await insertOne(req.db, 'upcoming_exams', {
            id,
            title: newItemData.name || newItemData.title,
            description: newItemData.description || null,
            deadline: newItemData.deadline ? new Date(newItemData.deadline).toISOString() : null
        });
        
        res.status(201).json(newItem);
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: examId, ...updateData } = req.body;
        const updatedItem = await updateById(req.db, 'upcoming_exams', examId, {
            title: updateData.name || updateData.title,
            description: updateData.description || null,
            deadline: updateData.deadline ? new Date(updateData.deadline).toISOString() : null
        });
        
        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'upcoming_exams', deleteId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
