

/**
 * Middleware to ensure the user is an authenticated admin.
 * If not, it sends a 401 Unauthorized response.
 */
export const requireAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
