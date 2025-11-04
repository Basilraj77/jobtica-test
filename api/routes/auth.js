import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { selectOne, insertOne, updateById, count } from '../../lib/supabase-helpers.js';
import { rateLimitLogin } from '../middleware/rateLimiter.js';
import { auditLog, detectSuspiciousActivity } from '../middleware/security.js';

const router = Router();
const SALT_ROUNDS = 10;

// Apply security middleware to all auth routes
router.use(detectSuspiciousActivity);
router.use(rateLimitLogin);

// GET /api/auth/status - Check authentication status
router.get('/status', async (req, res, next) => {
    try {
        if (req.session.isAdmin && req.session.userId) {
            const user = await selectOne(req.db, 'users', 'id', req.session.userId);
            if (user) {
                return res.status(200).json({
                    isLoggedIn: true,
                    user: {
                        username: user.username,
                        email: user.email,
                        isDemo: !!req.session.isDemo
                    }
                });
            }
        }
        const adminCount = await count(req.db, 'users');
        res.status(200).json({ isLoggedIn: false, adminExists: adminCount > 0 });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth - Handle signup, login, logout, and password reset requests
router.post('/', async (req, res, next) => {
    try {
        const { action, username, password, email, isDemo } = req.body;

        switch (action) {
            case 'signup': {
                const adminCount = await count(req.db, 'users');
                if (adminCount > 0) {
                    return res.status(403).json({ message: 'Admin account already exists.' });
                }
                const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
                const id = uuidv4();
                await insertOne(req.db, 'users', {
                    id,
                    username,
                    email,
                    password_hash: passwordHash
                });
                return res.status(201).json({ message: 'Admin created.' });
            }
            case 'login': {
                if (isDemo) {
                    req.session.isAdmin = true;
                    req.session.isDemo = true;
                    req.session.userId = 'demo-user';
                    await insertOne(req.db, 'activity_logs', {
                        id: uuidv4(),
                        action: 'Demo Login',
                        details: 'Demo user logged in.',
                        timestamp: new Date().toISOString()
                    });
                    return res.status(200).json({ user: { username: 'Demo User', email: 'demo@example.com', isDemo: true } });
                }
                const user = await selectOne(req.db, 'users', 'username', username);
                if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                    return res.status(401).json({ message: 'Invalid credentials.' });
                }
                req.session.userId = user.id;
                req.session.isAdmin = true;
                req.session.isDemo = false;
                await insertOne(req.db, 'activity_logs', {
                    id: uuidv4(),
                    action: 'Admin Login',
                    details: `User ${user.username} logged in.`,
                    timestamp: new Date().toISOString()
                });
                return res.status(200).json({ user: { username: user.username, email: user.email, isDemo: false } });
            }
            case 'logout': {
                await insertOne(req.db, 'activity_logs', {
                    id: uuidv4(),
                    action: 'Admin Logout',
                    details: 'User logged out.',
                    timestamp: new Date().toISOString()
                });
                req.session.destroy();
                return res.status(200).json({ message: 'Logged out.' });
            }
            case 'request_password_reset': {
                const user = await selectOne(req.db, 'users', 'email', email);
                if (user) {
                    req.session.resetUserId = user.id;
                    return res.status(200).json({ message: 'Proceed to reset.' });
                }
                return res.status(404).json({ message: 'Email not found.' });
            }
            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        next(error);
    }
});

// PUT /api/auth - Handle credential updates and password resets
router.put('/', async (req, res, next) => {
    try {
        const { action, currentPassword, newUsername, newPassword } = req.body;

        switch (action) {
            case 'update_credentials': {
                if (!req.session.isAdmin || !req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

                const user = await selectOne(req.db, 'users', 'id', req.session.userId);
                if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
                    return res.status(401).json({ message: 'Incorrect current password.' });
                }
                const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
                const updatedUser = await updateById(req.db, 'users', req.session.userId, {
                    username: newUsername,
                    password_hash: newPasswordHash
                });
                await insertOne(req.db, 'activity_logs', {
                    id: uuidv4(),
                    action: 'Credentials Updated',
                    details: `Admin credentials updated for ${updatedUser.username}.`,
                    timestamp: new Date().toISOString()
                });
                return res.status(200).json({ user: { username: updatedUser.username, email: updatedUser.email } });
            }
            case 'reset_password': {
                if (!req.session.resetUserId) {
                    return res.status(401).json({ message: 'Invalid reset request.' });
                }
                const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
                await updateById(req.db, 'users', req.session.resetUserId, {
                    password_hash: newPasswordHash
                });
                req.session.destroy();
                return res.status(200).json({ message: 'Password has been reset. Please log in again.' });
            }
            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
