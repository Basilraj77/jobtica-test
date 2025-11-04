import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';
import { insertOne, insertMany, updateById, deleteById, deleteMany, selectOne } from '../../lib/supabase-helpers.js';

const router = Router();
router.use(requireAdmin);

router.post('/', async (req, res, next) => {
    try {
        if (Array.isArray(req.body)) { // Bulk creation
            const jobsData = req.body.map(job => ({
                id: uuidv4(),
                title: job.title,
                department: job.department,
                category: job.category,
                description: job.description,
                qualification: job.qualification,
                vacancies: job.vacancies,
                posted_date: new Date(job.postedDate).toISOString(),
                last_date: new Date(job.lastDate).toISOString(),
                apply_link: job.applyLink,
                status: 'active',
                affiliate_courses: job.affiliateCourses || [],
                affiliate_books: job.affiliateBooks || []
            }));
            
            if (jobsData.length === 0) return res.status(201).json([]);
            
            const newJobs = await insertMany(req.db, 'jobs', jobsData);
            
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Bulk Job Upload',
                details: `${newJobs.length} jobs added.`,
                timestamp: new Date().toISOString()
            });

            // Map back to frontend format
            const parsedNewJobs = newJobs.map(job => ({
                id: job.id,
                title: job.title,
                department: job.department,
                category: job.category,
                description: job.description,
                qualification: job.qualification,
                vacancies: job.vacancies,
                postedDate: job.posted_date,
                lastDate: job.last_date,
                applyLink: job.apply_link,
                status: job.status,
                createdAt: job.created_at,
                updatedAt: job.updated_at,
                affiliateCourses: job.affiliate_courses || [],
                affiliateBooks: job.affiliate_books || []
            }));
            
            return res.status(201).json(parsedNewJobs);
        } else { // Single creation
            const { affiliateCourses, affiliateBooks, ...jobData } = req.body;
            const id = uuidv4();
            
            const newJob = await insertOne(req.db, 'jobs', {
                id,
                title: jobData.title,
                department: jobData.department,
                category: jobData.category,
                description: jobData.description,
                qualification: jobData.qualification,
                vacancies: jobData.vacancies,
                posted_date: new Date(jobData.postedDate).toISOString(),
                last_date: new Date(jobData.lastDate).toISOString(),
                apply_link: jobData.applyLink,
                status: jobData.status,
                affiliate_courses: affiliateCourses || [],
                affiliate_books: affiliateBooks || []
            });
            
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Job Created',
                details: `New job added: ${newJob.title}`,
                timestamp: new Date().toISOString()
            });
            
            // Map to frontend format
            const mappedJob = {
                id: newJob.id,
                title: newJob.title,
                department: newJob.department,
                category: newJob.category,
                description: newJob.description,
                qualification: newJob.qualification,
                vacancies: newJob.vacancies,
                postedDate: newJob.posted_date,
                lastDate: newJob.last_date,
                applyLink: newJob.apply_link,
                status: newJob.status,
                createdAt: newJob.created_at,
                updatedAt: newJob.updated_at,
                affiliateCourses: newJob.affiliate_courses || [],
                affiliateBooks: newJob.affiliate_books || []
            };
            
            return res.status(201).json(mappedJob);
        }
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id, affiliateCourses, affiliateBooks, createdAt, ...updateData } = req.body;
        
        const updatedJob = await updateById(req.db, 'jobs', id, {
            title: updateData.title,
            department: updateData.department,
            category: updateData.category,
            description: updateData.description,
            qualification: updateData.qualification,
            vacancies: updateData.vacancies,
            posted_date: new Date(updateData.postedDate).toISOString(),
            last_date: new Date(updateData.lastDate).toISOString(),
            apply_link: updateData.applyLink,
            status: updateData.status,
            affiliate_courses: affiliateCourses || [],
            affiliate_books: affiliateBooks || []
        });
        
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Job Updated',
            details: `Job updated: ${updatedJob.title}`,
            timestamp: new Date().toISOString()
        });
        
        // Map to frontend format
        const mappedJob = {
            id: updatedJob.id,
            title: updatedJob.title,
            department: updatedJob.department,
            category: updatedJob.category,
            description: updatedJob.description,
            qualification: updatedJob.qualification,
            vacancies: updatedJob.vacancies,
            postedDate: updatedJob.posted_date,
            lastDate: updatedJob.last_date,
            applyLink: updatedJob.apply_link,
            status: updatedJob.status,
            createdAt: updatedJob.created_at,
            updatedAt: updatedJob.updated_at,
            affiliateCourses: updatedJob.affiliate_courses || [],
            affiliateBooks: updatedJob.affiliate_books || []
        };
        
        res.status(200).json(mappedJob);
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { ids, id } = req.body;
        if (ids) { // Bulk delete
            await deleteMany(req.db, 'jobs', ids);
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Bulk Job Deletion',
                details: `${ids.length} jobs deleted.`,
                timestamp: new Date().toISOString()
            });
        } else { // Single delete
            await deleteById(req.db, 'jobs', id);
            await insertOne(req.db, 'activity_logs', {
                id: uuidv4(),
                action: 'Job Deleted',
                details: `Job with id ${id} deleted.`,
                timestamp: new Date().toISOString()
            });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
