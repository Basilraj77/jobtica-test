import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { insertOne, updateById, deleteById, deleteMany } from '../../lib/supabase-helpers.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const postData = req.body;
        const id = uuidv4();
        const newPost = await insertOne(req.db, 'content_posts', {
            id,
            title: postData.title,
            content: postData.content || '',
            slug: postData.slug,
            type: postData.type || 'posts',
            status: postData.status || 'published'
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Post Created',
            details: `Post created: ${postData.title}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json(newPost);
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: postId, createdAt, ...updateData } = req.body;
        const updatedPost = await updateById(req.db, 'content_posts', postId, {
            title: updateData.title,
            content: updateData.content,
            slug: updateData.slug,
            type: updateData.type,
            status: updateData.status
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Post Updated',
            details: `Post updated: ${updatedPost.title}`,
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json(updatedPost);
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { ids, id } = req.body;
        if (ids) { // Bulk delete
            await deleteMany(req.db, 'content_posts', ids);
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Bulk Post Deletion',
                details: `${ids.length} posts deleted.`,
                timestamp: new Date().toISOString()
            });
        } else { // Single delete
            await deleteById(req.db, 'content_posts', id);
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Post Deleted',
                details: `Post with id ${id} deleted.`,
                timestamp: new Date().toISOString()
            });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
