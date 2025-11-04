import rateLimit from 'express-rate-limit';

// Rate limiting for admin endpoints
export const adminRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: {
        error: 'Too many admin login attempts. Please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use IP address as the key
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    handler: (req, res) => {
        console.warn(`Rate limit exceeded for admin access from IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many admin login attempts. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// IP whitelist for admin access (optional)
const ALLOWED_IPS = process.env.ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

export const adminIPProtection = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    // Skip IP check in development if no IPs are specified
    if (process.env.NODE_ENV === 'development' && ALLOWED_IPS.length === 0) {
        return next();
    }
    
    // Check if IP is whitelisted
    if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIP)) {
        console.warn(`Admin access attempt from unauthorized IP: ${clientIP}`);
        return res.status(403).json({ 
            error: 'Admin access restricted to authorized IPs only.',
            allowedIPs: ALLOWED_IPS.length
        });
    }
    
    next();
};

// Session security middleware
export const sessionSecurity = (req, res, next) => {
    // Ensure session exists for admin routes
    if (!req.session) {
        return res.status(401).json({ error: 'Session required for admin access' });
    }
    
    // Set secure session options
    if (req.session) {
        req.session.lastActivity = Date.now();
    }
    
    next();
};

// Admin audit logging
export const adminAuditLog = (action) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        
        res.json = function(data) {
            // Log admin actions
            if (req.session?.isAdmin) {
                console.log(`[ADMIN AUDIT] ${action} - IP: ${req.ip} - User: ${req.session.userId} - Status: ${res.statusCode}`);
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
};

// Backwards-compatible exports expected by other modules
export const requireAdmin = sessionSecurity;
export const rateLimiter = adminRateLimit;
export const ipWhitelist = adminIPProtection;