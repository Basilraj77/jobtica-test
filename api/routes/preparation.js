import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { insertOne, updateById, deleteById } from '../../lib/supabase-helpers.js';

const router = Router();

// --- Preparation Books ---
router.post('/books', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        const newBook = await insertOne(req.db, 'preparation_books', {
            id,
            title: newItemData.title,
            description: newItemData.author || newItemData.description,
            url: newItemData.url,
            image_url: newItemData.imageUrl,
            price: newItemData.price
        });
        
        res.status(201).json(newBook);
    } catch (error) {
        next(error);
    }
});

router.put('/books', async (req, res, next) => {
    try {
        const { id: bookId, ...updateData } = req.body;
        const updatedBook = await updateById(req.db, 'preparation_books', bookId, {
            title: updateData.title,
            description: updateData.author || updateData.description,
            url: updateData.url,
            image_url: updateData.imageUrl,
            price: updateData.price
        });
        
        res.status(200).json(updatedBook);
    } catch (error) {
        next(error);
    }
});

router.delete('/books', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'preparation_books', deleteId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// --- Preparation Courses ---
router.post('/courses', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        const newCourse = await insertOne(req.db, 'preparation_courses', {
            id,
            title: newItemData.title,
            description: newItemData.platform || newItemData.description,
            url: newItemData.url,
            price: newItemData.price
        });
        
        res.status(201).json(newCourse);
    } catch (error) {
        next(error);
    }
});

router.put('/courses', async (req, res, next) => {
    try {
        const { id: courseId, ...updateData } = req.body;
        const updatedCourse = await updateById(req.db, 'preparation_courses', courseId, {
            title: updateData.title,
            description: updateData.platform || updateData.description,
            url: updateData.url,
            price: updateData.price
        });
        
        res.status(200).json(updatedCourse);
    } catch (error) {
        next(error);
    }
});

router.delete('/courses', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'preparation_courses', deleteId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
