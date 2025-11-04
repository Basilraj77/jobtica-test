

import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

// Import individual content routers
import jobsRouter from './jobs.js';
import postsRouter from './posts.js';
import breakingNewsRouter from './breakingnews.js';
import quickLinksRouter from './quicklinks.js';
import upcomingExamsRouter from './upcomingexams.js';

const router = Router();

// All routes for content management require admin privileges.
router.use(requireAdmin);

// Mount the individual content routers at their respective paths
router.use('/jobs', jobsRouter);
router.use('/posts', postsRouter);
router.use('/breaking-news', breakingNewsRouter);
router.use('/quick-links', quickLinksRouter);
router.use('/upcoming-exams', upcomingExamsRouter);

export default router;
