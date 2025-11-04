import session from 'express-session';

// Session configuration for Express
const sessionPassword = process.env.SESSION_SECRET;
if (!sessionPassword && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is not set for production. It must be at least 32 characters long.');
}

export const sessionMiddleware = session({
    secret: sessionPassword || 'a-very-long-secret-for-dev-at-least-32-chars',
    name: 'jobtica-session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
});
