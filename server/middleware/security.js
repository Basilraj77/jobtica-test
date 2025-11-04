import { v4 as uuidv4 } from 'uuid';
import { insertOne } from '../../lib/supabase-helpers.js';

/**
 * IP Whitelisting Middleware
 * Checks if the requesting IP is in the allowed list
 */
const WHITELIST_ENABLED = process.env.IP_WHITELIST_ENABLED === 'true';
const WHITELISTED_IPS = (process.env.WHITELISTED_IPS || '').split(',').filter(ip => ip.trim());

export const checkIPWhitelist = (req, res, next) => {
    if (!WHITELIST_ENABLED || WHITELISTED_IPS.length === 0) {
        return next(); // Whitelist disabled or not configured
    }

    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    if (WHITELISTED_IPS.includes(clientIP) || WHITELISTED_IPS.includes('*')) {
        return next();
    }

    console.warn(`Blocked access from non-whitelisted IP: ${clientIP}`);
    return res.status(403).json({
        message: 'Access denied. Your IP address is not authorized.'
    });
};

/**
 * Audit Logging Middleware
 * Logs all admin actions to the database
 */
export const auditLog = (action) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        const startTime = Date.now();

        // Capture response for logging
        res.send = function(data) {
            res.send = originalSend;
            
            // Log the action after response is sent
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode;
            
            // Only log if database client is available
            if (req.db && (req.session?.isAdmin || req.session?.userId)) {
                const logData = {
                    id: uuidv4(),
                    action: action || req.method + ' ' + req.path,
                    details: JSON.stringify({
                        method: req.method,
                        path: req.path,
                        statusCode,
                        duration: `${duration}ms`,
                        ip: req.ip || req.connection.remoteAddress,
                        userAgent: req.headers['user-agent'],
                        userId: req.session.userId,
                        body: sanitizeLogData(req.body)
                    }),
                    timestamp: new Date().toISOString()
                };

                // Insert asynchronously, don't block response
                insertOne(req.db, 'activity_logs', logData).catch(err => {
                    console.error('Failed to write audit log:', err);
                });
            }

            return originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Sanitize sensitive data from logs
 */
function sanitizeLogData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'passwordHash', 'token', 'secret'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    
    return sanitized;
}

/**
 * Session Security Enhancement
 * Adds security headers and session validation
 */
export const enhanceSessionSecurity = (req, res, next) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Check session validity
    if (req.session && req.session.userId) {
        // Add session metadata
        req.session.lastActivity = Date.now();
        
        // Regenerate session ID periodically (every hour)
        const sessionAge = Date.now() - (req.session.createdAt || 0);
        if (sessionAge > 60 * 60 * 1000) {
            const oldSessionData = { ...req.session };
            req.session.regenerate((err) => {
                if (err) {
                    console.error('Session regeneration error:', err);
                } else {
                    // Restore session data
                    Object.assign(req.session, oldSessionData);
                    req.session.createdAt = Date.now();
                }
            });
        }
    }
    
    next();
};

/**
 * Detect suspicious activity patterns
 */
export const detectSuspiciousActivity = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Check for common attack patterns
    const suspiciousPatterns = [
        /(\.{2}|\/\/)/,  // Path traversal attempts
        /<script/i,      // XSS attempts
        /union.*select/i, // SQL injection attempts
        /exec\s*\(/i     // Command injection attempts
    ];
    
    const requestData = JSON.stringify(req.body) + JSON.stringify(req.query);
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            console.warn(`Suspicious activity detected from ${ip}: ${pattern}`);
            
            // Log to database
            if (req.db) {
                await insertOne(req.db, 'activity_logs', {
                    id: uuidv4(),
                    action: 'Security Alert',
                    details: `Suspicious pattern detected: ${pattern} from IP: ${ip}`,
                    timestamp: new Date().toISOString()
                }).catch(err => console.error('Failed to log security alert:', err));
            }
            
            return res.status(400).json({
                message: 'Invalid request detected.'
            });
        }
    }
    
    next();
};
