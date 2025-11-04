import { Router } from 'express';
import { getSetting, setSetting } from '../../lib/supabase-helpers.js';

const router = Router();

// GET /api/settings - Fetch all settings
router.get('/', async (req, res, next) => {
    try {
        const supabase = req.db;
        
        // Get all settings from key_value_store
        const { data: settingsRows } = await supabase
            .from('key_value_store')
            .select('key_name, value');
        
        const settingsObject = (settingsRows || []).reduce((acc, row) => {
            try {
                // Try to parse JSON values, fall back to raw string
                acc[row.key_name] = JSON.parse(row.value);
            } catch {
                acc[row.key_name] = row.value;
            }
            return acc;
        }, {});
        
        res.status(200).json(settingsObject);
    } catch (error) {
        next(error);
    }
});

// GET /api/settings/:key - Fetch specific setting
router.get('/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const value = await getSetting(req.db, key);
        
        if (value === null) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        
        // Try to parse JSON values, fall back to raw string
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        } catch {
            parsedValue = value;
        }
        
        res.status(200).json({ key, value: parsedValue });
    } catch (error) {
        next(error);
    }
});

// PUT /api/settings/:key - Update specific setting
router.put('/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        if (value === undefined) {
            return res.status(400).json({ error: 'Value is required' });
        }
        
        // Convert value to string, JSON.stringify for objects/arrays
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        await setSetting(req.db, key, stringValue);
        
        res.status(200).json({ key, value });
    } catch (error) {
        next(error);
    }
});

// PUT /api/settings - Update multiple settings at once
router.put('/', async (req, res, next) => {
    try {
        const settings = req.body;
        
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Settings object is required' });
        }
        
        const results = [];
        
        for (const [key, value] of Object.entries(settings)) {
            try {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                await setSetting(req.db, key, stringValue);
                results.push({ key, value, status: 'success' });
            } catch (error) {
                results.push({ key, value, status: 'error', error: error.message });
            }
        }
        
        res.status(200).json({ 
            message: 'Settings updated',
            results 
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/settings/:key - Delete specific setting
router.delete('/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        
        const { error } = await req.db
            .from('key_value_store')
            .delete()
            .eq('key_name', key);
        
        if (error) {
            console.error(`Error deleting setting ${key}:`, error);
            throw error;
        }
        
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;