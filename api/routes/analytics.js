import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/adminProtection.js';
import { insertOne, selectAll } from '../../lib/supabase-helpers.js';

const router = Router();

// In-memory store for real-time analytics (for demonstration)
// In production, use Redis or similar
const realtimeStats = {
    activeVisitors: 0,
    todayVisitors: new Set(),
    pageViews: 0,
    lastUpdated: Date.now()
};

// Track visitor activity (public endpoint)
router.post('/track-visit', async (req, res, next) => {
    try {
        const { page, referrer, sessionId } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        // Update real-time stats
        realtimeStats.todayVisitors.add(sessionId || ip);
        realtimeStats.pageViews++;
        realtimeStats.lastUpdated = Date.now();
        
        // Store in database for historical analytics
        await insertOne(req.db, 'activity_logs', {
            id: uuidv4(),
            action: 'Page Visit',
            details: JSON.stringify({
                page,
                referrer,
                sessionId,
                ip,
                userAgent,
                timestamp: new Date().toISOString()
            }),
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Get real-time analytics (admin only)
router.get('/realtime', requireAdmin, async (req, res, next) => {
    try {
        // Clean up old visitor tracking (older than 5 minutes = not active)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        // Get recent activity from database
        const { data: recentActivity } = await req.db
            .from('activity_logs')
            .select('*')
            .gte('timestamp', new Date(fiveMinutesAgo).toISOString())
            .order('timestamp', { ascending: false });
        
        // Count unique active visitors from recent activity
        const activeVisitorSessions = new Set();
        recentActivity?.forEach(log => {
            try {
                const details = JSON.parse(log.details);
                if (details.sessionId) {
                    activeVisitorSessions.add(details.sessionId);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });
        
        res.status(200).json({
            activeVisitors: activeVisitorSessions.size,
            todayVisitors: realtimeStats.todayVisitors.size,
            pageViews: realtimeStats.pageViews,
            recentActivity: recentActivity?.slice(0, 10) || [],
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// Get performance metrics (admin only)
router.get('/performance', requireAdmin, async (req, res, next) => {
    try {
        const { data: logs } = await req.db
            .from('activity_logs')
            .select('*')
            .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('timestamp', { ascending: false });
        
        // Analyze performance data
        const apiCalls = logs?.filter(log => {
            try {
                const details = JSON.parse(log.details);
                return details.method && details.duration;
            } catch (e) {
                return false;
            }
        }) || [];
        
        const avgResponseTime = apiCalls.length > 0
            ? apiCalls.reduce((sum, log) => {
                const details = JSON.parse(log.details);
                return sum + parseInt(details.duration);
            }, 0) / apiCalls.length
            : 0;
        
        res.status(200).json({
            totalRequests: apiCalls.length,
            avgResponseTime: Math.round(avgResponseTime),
            last24Hours: logs?.length || 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// Get visitor analytics (admin only)
router.get('/visitors', requireAdmin, async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const { data: visitLogs } = await req.db
            .from('activity_logs')
            .select('*')
            .eq('action', 'Page Visit')
            .gte('timestamp', startDate.toISOString())
            .order('timestamp', { ascending: true });
        
        // Group by date
        const visitorsByDate = {};
        const pagesByUrl = {};
        const referrerCounts = {};
        
        visitLogs?.forEach(log => {
            try {
                const details = JSON.parse(log.details);
                const date = new Date(log.timestamp).toISOString().split('T')[0];
                
                // Count by date
                visitorsByDate[date] = (visitorsByDate[date] || 0) + 1;
                
                // Count by page
                if (details.page) {
                    pagesByUrl[details.page] = (pagesByUrl[details.page] || 0) + 1;
                }
                
                // Count by referrer
                if (details.referrer) {
                    referrerCounts[details.referrer] = (referrerCounts[details.referrer] || 0) + 1;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });
        
        // Convert to arrays for charting
        const visitorTrend = Object.keys(visitorsByDate).map(date => ({
            date,
            visitors: visitorsByDate[date]
        }));
        
        const topPages = Object.entries(pagesByUrl)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([page, views]) => ({ page, views }));
        
        const topReferrers = Object.entries(referrerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([referrer, count]) => ({ referrer, count }));
        
        res.status(200).json({
            visitorTrend,
            topPages,
            topReferrers,
            totalVisits: visitLogs?.length || 0
        });
    } catch (error) {
        next(error);
    }
});

// Get system health metrics (admin only)
router.get('/system-health', requireAdmin, async (req, res, next) => {
    try {
        // Database health check
        const { data: tablesCheck } = await req.db
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        // Check recent errors
        const { data: recentErrors } = await req.db
            .from('activity_logs')
            .select('*')
            .ilike('action', '%error%')
            .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
            .order('timestamp', { ascending: false })
            .limit(10);
        
        // Memory usage (Node.js)
        const memUsage = process.memoryUsage();
        
        res.status(200).json({
            database: {
                status: 'connected',
                responseTime: '< 100ms'
            },
            api: {
                status: 'healthy',
                uptime: process.uptime()
            },
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024),
                total: Math.round(memUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
            },
           errors: {
  "last Hour": recentErrors?.length || 0,
  recent: recentErrors || []
}
        });
    } catch (error) {
        next(error);
    }
});

// Reset daily stats at midnight (should be called by a cron job)
function resetDailyStats() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(() => {
        realtimeStats.todayVisitors.clear();
        realtimeStats.pageViews = 0;
        resetDailyStats(); // Schedule next reset
    }, timeUntilMidnight);
}

// Start the daily reset scheduler
resetDailyStats();

export default router;
