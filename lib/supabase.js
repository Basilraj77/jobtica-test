import { createClient } from '@supabase/supabase-js';
import process from 'process';

let supabaseClient = null;

/**
 * Returns a Supabase client instance.
 * Uses service role key on server-side for full access.
 */
export function getSupabaseClient() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set.');
        }

        supabaseClient = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }

    return supabaseClient;
}

/**
 * Create a Supabase client for frontend use (with anon key)
 */
export function getSupabaseAnonClient() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and ANON KEY must be set.');
    }

    return createClient(supabaseUrl, supabaseKey);
}
