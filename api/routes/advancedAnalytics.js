import { Router } from 'express';
import { requireAdmin } from '../middleware/adminProtection.js';

const router = Router();

// Real Revenue Analytics Endpoints

// Get revenue data for specified time period
router.get('/revenue', requireAdmin, async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Query revenue data from database
        // This assumes you have a 'revenue_transactions' or similar table
        const { data: transactions, error } = await req.db
            .from('revenue_transactions')
            .select('*')
            .gte('transaction_date', startDate.toISOString())
            .order('transaction_date', { ascending: true });
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
            throw error;
        }
        
        // If table doesn't exist or no data, return simulated data with note
        if (!transactions || transactions.length === 0) {
            // Generate sample data structure for the specified days
            const revenueData = [];
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                revenueData.push({
                    date: date.toISOString().split('T')[0],
                    revenue: Math.floor(Math.random() * 5000) + 1000,
                    transactions: Math.floor(Math.random() * 100) + 10,
                    isSimulated: true
                });
            }
            
            return res.status(200).json({
                data: revenueData,
                isSimulated: true,
                message: 'Using simulated data. Create revenue_transactions table for real data.'
            });
        }
        
        // Group transactions by date
        const revenueByDate = {};
        transactions.forEach(tx => {
            const date = new Date(tx.transaction_date).toISOString().split('T')[0];
            if (!revenueByDate[date]) {
                revenueByDate[date] = { revenue: 0, transactions: 0 };
            }
            revenueByDate[date].revenue += parseFloat(tx.amount) || 0;
            revenueByDate[date].transactions += 1;
        });
        
        // Convert to array format
        const revenueData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: Math.round(revenueByDate[date].revenue),
            transactions: revenueByDate[date].transactions,
            isSimulated: false
        }));
        
        res.status(200).json({
            data: revenueData,
            isSimulated: false
        });
    } catch (error) {
        next(error);
    }
});

// Get revenue summary statistics
router.get('/revenue/summary', requireAdmin, async (req, res, next) => {
    try {
        const { data: transactions, error } = await req.db
            .from('revenue_transactions')
            .select('amount, transaction_date')
            .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        if (!transactions || transactions.length === 0) {
            return res.status(200).json({
                totalRevenue: 45000,
                averageTransaction: 150,
                totalTransactions: 300,
                growthRate: 12.5,
                isSimulated: true
            });
        }
        
        const totalRevenue = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        const totalTransactions = transactions.length;
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        // Calculate growth rate (compare last 15 days vs previous 15 days)
        const midpoint = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        const recent = transactions.filter(tx => new Date(tx.transaction_date) >= midpoint);
        const previous = transactions.filter(tx => new Date(tx.transaction_date) < midpoint);
        
        const recentRevenue = recent.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        const previousRevenue = previous.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        
        const growthRate = previousRevenue > 0 
            ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
            : 0;
        
        res.status(200).json({
            totalRevenue: Math.round(totalRevenue),
            averageTransaction: Math.round(averageTransaction),
            totalTransactions,
            growthRate: Math.round(growthRate * 10) / 10,
            isSimulated: false
        });
    } catch (error) {
        next(error);
    }
});

// Advanced User Analytics Endpoints

// Get user behavior analytics
router.get('/users/behavior', requireAdmin, async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Query user activity logs
        const { data: activities, error } = await req.db
            .from('activity_logs')
            .select('*')
            .gte('timestamp', startDate.toISOString())
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        // Analyze user behavior patterns
        const behaviorMetrics = {
            totalActions: activities?.length || 0,
            uniqueUsers: new Set(activities?.map(a => {
                try {
                    const details = JSON.parse(a.details);
                    return details.sessionId || details.ip;
                } catch { return null; }
            }).filter(Boolean)).size,
            topActions: {},
            peakHours: Array(24).fill(0),
            deviceTypes: { desktop: 0, mobile: 0, tablet: 0 },
            avgSessionDuration: 0
        };
        
        // Calculate metrics
        activities?.forEach(activity => {
            // Count actions
            behaviorMetrics.topActions[activity.action] = 
                (behaviorMetrics.topActions[activity.action] || 0) + 1;
            
            // Peak hours
            const hour = new Date(activity.timestamp).getHours();
            behaviorMetrics.peakHours[hour]++;
            
            // Device types (if available in details)
            try {
                const details = JSON.parse(activity.details);
                if (details.userAgent) {
                    if (/mobile/i.test(details.userAgent)) {
                        behaviorMetrics.deviceTypes.mobile++;
                    } else if (/tablet/i.test(details.userAgent)) {
                        behaviorMetrics.deviceTypes.tablet++;
                    } else {
                        behaviorMetrics.deviceTypes.desktop++;
                    }
                }
            } catch {}
        });
        
        // Get top 10 actions
        behaviorMetrics.topActions = Object.entries(behaviorMetrics.topActions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
        
        res.status(200).json(behaviorMetrics);
    } catch (error) {
        next(error);
    }
});

// Get user segmentation data
router.get('/users/segments', requireAdmin, async (req, res, next) => {
    try {
        const { data: users, error } = await req.db
            .from('users')
            .select('*');
        
        if (error) throw error;
        
        // Segment users by various criteria
        const segments = {
            byRole: {},
            byActivity: { active: 0, inactive: 0 },
            byRegistrationDate: { 
                lastWeek: 0, 
                lastMonth: 0, 
                last3Months: 0, 
                older: 0 
            },
            total: users?.length || 0
        };
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        
        users?.forEach(user => {
            // By role
            const role = user.role || 'user';
            segments.byRole[role] = (segments.byRole[role] || 0) + 1;
            
            // By activity (last login within 30 days)
            const lastActive = user.last_login ? new Date(user.last_login) : new Date(user.created_at);
            if (now.getTime() - lastActive.getTime() < 30 * 24 * 60 * 60 * 1000) {
                segments.byActivity.active++;
            } else {
                segments.byActivity.inactive++;
            }
            
            // By registration date
            const registered = new Date(user.created_at);
            if (registered >= weekAgo) {
                segments.byRegistrationDate.lastWeek++;
            } else if (registered >= monthAgo) {
                segments.byRegistrationDate.lastMonth++;
            } else if (registered >= threeMonthsAgo) {
                segments.byRegistrationDate.last3Months++;
            } else {
                segments.byRegistrationDate.older++;
            }
        });
        
        res.status(200).json(segments);
    } catch (error) {
        next(error);
    }
});

// Get conversion tracking data
router.get('/conversions', requireAdmin, async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Query conversion events (sign-ups, applications, etc.)
        const { data: conversions, error } = await req.db
            .from('activity_logs')
            .select('*')
            .in('action', ['User Registration', 'Job Application', 'Subscription'])
            .gte('timestamp', startDate.toISOString());
        
        if (error) throw error;
        
        const conversionMetrics = {
            totalConversions: conversions?.length || 0,
            byType: {
                registrations: 0,
                applications: 0,
                subscriptions: 0
            },
            byDay: {},
            conversionRate: 0
        };
        
        conversions?.forEach(conv => {
            // Count by type
            if (conv.action === 'User Registration') {
                conversionMetrics.byType.registrations++;
            } else if (conv.action === 'Job Application') {
                conversionMetrics.byType.applications++;
            } else if (conv.action === 'Subscription') {
                conversionMetrics.byType.subscriptions++;
            }
            
            // Count by day
            const day = new Date(conv.timestamp).toISOString().split('T')[0];
            conversionMetrics.byDay[day] = (conversionMetrics.byDay[day] || 0) + 1;
        });
        
        // Calculate conversion rate (conversions / total visitors)
        const { data: visitors } = await req.db
            .from('activity_logs')
            .select('details')
            .eq('action', 'Page Visit')
            .gte('timestamp', startDate.toISOString());
        
        const uniqueVisitors = new Set(visitors?.map(v => {
            try {
                const details = JSON.parse(v.details);
                return details.sessionId || details.ip;
            } catch { return null; }
        }).filter(Boolean)).size;
        
        conversionMetrics.conversionRate = uniqueVisitors > 0 
            ? (conversionMetrics.totalConversions / uniqueVisitors) * 100 
            : 0;
        
        res.status(200).json(conversionMetrics);
    } catch (error) {
        next(error);
    }
});

export default router;
