import 'dotenv/config';
import express from 'express';
import { sessionMiddleware } from '../lib/session.js';
import { attachDb } from './middleware/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { enhanceSessionSecurity } from './middleware/security.js';
import { rateLimitAdmin } from './middleware/rateLimiter.js';
import { requireAdmin, rateLimiter, ipWhitelist } from './middleware/adminProtection.js';

// Import all routers
import authRouter from './routes/auth.js';
import coreRouter from './routes/core.js';
import audienceRouter from './routes/audience.js';
import marketingRouter from './routes/marketing.js';
import preparationRouter from './routes/preparation.js';
import systemRouter from './routes/system.js';
import contentRouter from './routes/content.js';
import analyticsRouter from './routes/analytics.js';
import advancedAnalyticsRouter from './routes/advancedAnalytics.js';
import mediaRouter from './routes/media.js';
import contentVersionsRouter from './routes/contentVersions.js';

const app = express();
const apiRouter = express.Router(); // Create the master API router

// --- Global Middleware ---
// These apply to all requests that reach the server.
app.use(express.json({ limit: '10mb' }));
app.use(sessionMiddleware);
app.use(enhanceSessionSecurity); // Add security headers
app.use(attachDb); // This will attach the DB pool to every request

// --- API Route Definitions on the Master Router ---
// Mount the most specific routers first to ensure they are matched correctly.
apiRouter.use('/auth', authRouter);

// Enhanced analytics routes with rate limiting and IP whitelisting
apiRouter.use('/analytics', rateLimiter, ipWhitelist, analyticsRouter);
apiRouter.use('/advanced-analytics', rateLimiter, ipWhitelist, advancedAnalyticsRouter);
apiRouter.use('/audience', audienceRouter);

// Enhanced admin routes with rate limiting and IP whitelisting
apiRouter.use('/marketing', rateLimitAdmin(50, 60000), rateLimiter, ipWhitelist, marketingRouter);
apiRouter.use('/preparation', rateLimiter, ipWhitelist, preparationRouter);
apiRouter.use('/system', rateLimiter, ipWhitelist, systemRouter);
apiRouter.use('/content', rateLimitAdmin(100, 60000), rateLimiter, ipWhitelist, contentRouter);

// Media management routes with rate limiting
apiRouter.use('/media', rateLimitAdmin(100, 60000), rateLimiter, ipWhitelist, mediaRouter);

// Content versioning routes (mounted under /api/content/:contentId/versions in contentVersionsRouter)
// Mount under /content so the admin rate limiter only applies to content-related endpoints
apiRouter.use('/content', rateLimitAdmin(100, 60000), rateLimiter, ipWhitelist, contentVersionsRouter);

// The core router handles general routes like /data, /health, etc.
// It is mounted last so that it doesn't accidentally intercept more specific paths.
apiRouter.use(coreRouter);

// --- Mount Master Router ---
// Mount the master router at the /api path on the main app.
app.use('/api', apiRouter);

// --- Centralized Error Handler ---
// This must be the LAST middleware added to catch any errors from `next(error)`.
app.use(errorHandler);

export default app;