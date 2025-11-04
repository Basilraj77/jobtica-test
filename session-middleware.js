/**
 * Session middleware for handling user sessions
 * This file was missing from the deployment package
 */

import expressSession from 'express-session';

// Session configuration
const sessionMiddleware = expressSession({
  secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'jobtica.sid'
});

export { sessionMiddleware };

// Helper functions for session management
export const getSession = (req) => {
  return req.session || {};
};

export const setSession = (req, key, value) => {
  if (!req.session) {
    req.session = {};
  }
  req.session[key] = value;
};

export const destroySession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export default sessionMiddleware;