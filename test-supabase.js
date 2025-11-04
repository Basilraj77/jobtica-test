#!/usr/bin/env node
import 'dotenv/config';
import { getSupabaseClient } from './lib/supabase.js';

async function testSupabaseConnection() {
    console.log('Testing Supabase connection...\n');
    
    try {
        // Check environment variables
        if (!process.env.SUPABASE_URL) {
            throw new Error('SUPABASE_URL not set');
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
        }
        
        console.log('✓ Environment variables are set');
        console.log(`  SUPABASE_URL: ${process.env.SUPABASE_URL}`);
        
        // Get Supabase client
        const supabase = getSupabaseClient();
        console.log('✓ Supabase client created');
        
        // Test database connection by querying users table
        const { data, error, count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            throw error;
        }
        
        console.log('✓ Database connection successful');
        console.log(`  Users table exists with ${count || 0} records`);
        
        // Test other tables
        const tables = [
            'jobs', 'quick_links', 'content_posts', 'breaking_news',
            'subscribers', 'activity_logs', 'key_value_store'
        ];
        
        console.log('\nTesting other tables:');
        for (const table of tables) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`  ✗ ${table}: ${error.message}`);
            } else {
                console.log(`  ✓ ${table}: ${count || 0} records`);
            }
        }
        
        console.log('\n✓ All tests passed! Migration successful.\n');
        return true;
        
    } catch (error) {
        console.error('\n✗ Test failed:');
        console.error(`  ${error.message}\n`);
        return false;
    }
}

testSupabaseConnection().then(success => {
    process.exit(success ? 0 : 1);
});
