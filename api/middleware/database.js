import { getSupabaseClient } from '../../lib/supabase.js';

/**
 * Middleware to attach Supabase client to the request object.
 */
export const attachDb = async (req, res, next) => {
    try {
        // Attach the Supabase client to the request object
        req.db = getSupabaseClient();
        next();
    } catch (error) {
        // Pass database connection errors to the central error handler
        next(error);
    }
};
