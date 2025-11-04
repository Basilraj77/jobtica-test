/**
 * Rate Limiting Middleware for Admin Panel Protection
 * Implements sliding window rate limiting per IP address
 */

const rateLimitStore = new Map();
const WINDOW_SIZE_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 login attempts per window

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.windowStart > WINDOW_SIZE_MS) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 1000); // Cleanup every minute

export const rateLimitLogin = (req, res, next) => {
    // Only apply rate limiting to login attempts
    if (req.body.action !== 'login') {
        return next();
    }

    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    let rateLimitData = rateLimitStore.get(identifier);

    if (!rateLimitData) {
        rateLimitData = {
            count: 1,
            windowStart: now,
            attempts: [now]
        };
        rateLimitStore.set(identifier, rateLimitData);
        return next();
    }

    // Check if window has expired
    if (now - rateLimitData.windowStart > WINDOW_SIZE_MS) {
        // Reset window
        rateLimitData.count = 1;
        rateLimitData.windowStart = now;
        rateLimitData.attempts = [now];
        return next();
    }

    // Increment counter
    rateLimitData.count++;
    rateLimitData.attempts.push(now);

    if (rateLimitData.count > MAX_REQUESTS) {
        const timeRemaining = Math.ceil((WINDOW_SIZE_MS - (now - rateLimitData.windowStart)) / 1000 / 60);
        return res.status(429).json({
            message: `Too many login attempts. Please try again in ${timeRemaining} minutes.`,
            retryAfter: timeRemaining
        });
    }

    next();
};

/**
 * General rate limiter for admin API endpoints
 */
export const rateLimitAdmin = (maxRequests = 100, windowMs = 60 * 1000) => {
    const store = new Map();

    // Cleanup old entries
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of store.entries()) {
            if (now - data.windowStart > windowMs) {
                store.delete(key);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        let data = store.get(identifier);

        if (!data) {
            data = { count: 1, windowStart: now };
            store.set(identifier, data);
            return next();
        }

        if (now - data.windowStart > windowMs) {
            data.count = 1;
            data.windowStart = now;
            return next();
        }

        data.count++;

        if (data.count > maxRequests) {
            return res.status(429).json({
                message: 'Too many requests. Please try again later.'
            });
        }

        next();
    };
};
