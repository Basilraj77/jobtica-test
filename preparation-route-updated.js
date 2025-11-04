import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { insertOne, updateById, deleteById, selectAll } from '../../lib/supabase-helpers.js';

const router = Router();

// GET /api/preparation/books - Fetch all preparation books
router.get('/books', async (req, res, next) => {
    try {
        const books = await selectAll(req.db, 'preparation_books', 'title', true);
        
        // Map to frontend format
        const formattedBooks = books.map(book => ({
            id: book.id,
            title: book.title,
            description: book.description,
            author: book.description, // Using description as author for backward compatibility
            url: book.url,
            imageUrl: book.image_url,
            price: book.price,
            createdAt: book.created_at,
            updatedAt: book.updated_at
        }));
        
        res.status(200).json(formattedBooks);
    } catch (error) {
        next(error);
    }
});

// POST /api/preparation/books - Create new preparation book
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
        
        res.status(201).json({
            id: newBook.id,
            title: newBook.title,
            description: newBook.description,
            author: newBook.description,
            url: newBook.url,
            imageUrl: newBook.image_url,
            price: newBook.price,
            createdAt: newBook.created_at,
            updatedAt: newBook.updated_at
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/preparation/books - Update preparation book
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
        
        res.status(200).json({
            id: updatedBook.id,
            title: updatedBook.title,
            description: updatedBook.description,
            author: updatedBook.description,
            url: updatedBook.url,
            imageUrl: updatedBook.image_url,
            price: updatedBook.price,
            createdAt: updatedBook.created_at,
            updatedAt: updatedBook.updated_at
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/preparation/books - Delete preparation book
router.delete('/books', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'preparation_books', deleteId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// GET /api/preparation/courses - Fetch all preparation courses
router.get('/courses', async (req, res, next) => {
    try {
        const courses = await selectAll(req.db, 'preparation_courses', 'title', true);
        
        // Map to frontend format
        const formattedCourses = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            platform: course.description, // Using description as platform for backward compatibility
            url: course.url,
            price: course.price,
            createdAt: course.created_at,
            updatedAt: course.updated_at
        }));
        
        res.status(200).json(formattedCourses);
    } catch (error) {
        next(error);
    }
});

// POST /api/preparation/courses - Create new preparation course
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
        
        res.status(201).json({
            id: newCourse.id,
            title: newCourse.title,
            description: newCourse.description,
            platform: newCourse.description,
            url: newCourse.url,
            price: newCourse.price,
            createdAt: newCourse.created_at,
            updatedAt: newCourse.updated_at
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/preparation/courses - Update preparation course
router.put('/courses', async (req, res, next) => {
    try {
        const { id: courseId, ...updateData } = req.body;
        const updatedCourse = await updateById(req.db, 'preparation_courses', courseId, {
            title: updateData.title,
            description: updateData.platform || updateData.description,
            url: updateData.url,
            price: updateData.price
        });
        
        res.status(200).json({
            id: updatedCourse.id,
            title: updatedCourse.title,
            description: updatedCourse.description,
            platform: updatedCourse.description,
            url: updatedCourse.url,
            price: updatedCourse.price,
            createdAt: updatedCourse.created_at,
            updatedAt: updatedCourse.updated_at
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/preparation/courses - Delete preparation course
router.delete('/courses', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        await deleteById(req.db, 'preparation_courses', deleteId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// GET /api/preparation - Fetch all preparation data (courses and books)
router.get('/', async (req, res, next) => {
    try {
        const [books, courses] = await Promise.all([
            selectAll(req.db, 'preparation_books', 'title', true),
            selectAll(req.db, 'preparation_courses', 'title', true)
        ]);
        
        const formattedBooks = books.map(book => ({
            id: book.id,
            title: book.title,
            description: book.description,
            author: book.description,
            url: book.url,
            imageUrl: book.image_url,
            price: book.price,
            createdAt: book.created_at,
            updatedAt: book.updated_at
        }));
        
        const formattedCourses = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            platform: course.description,
            url: course.url,
            price: course.price,
            createdAt: course.created_at,
            updatedAt: course.updated_at
        }));
        
        res.status(200).json({
            books: formattedBooks,
            courses: formattedCourses
        });
    } catch (error) {
        next(error);
    }
});

export default router;