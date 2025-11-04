/**
 * Supabase Helper Utilities
 * Common query patterns for Supabase operations
 */

/**
 * Insert a single record
 */
export async function insertOne(supabase, table, data) {
    const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return result;
}

/**
 * Insert multiple records
 */
export async function insertMany(supabase, table, dataArray) {
    const { data: result, error } = await supabase
        .from(table)
        .insert(dataArray)
        .select();
    
    if (error) throw new Error(error.message);
    return result;
}

/**
 * Update a record by ID
 */
export async function updateById(supabase, table, id, data) {
    const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return result;
}

/**
 * Delete a record by ID
 */
export async function deleteById(supabase, table, id) {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
}

/**
 * Delete multiple records by IDs
 */
export async function deleteMany(supabase, table, ids) {
    const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids);
    
    if (error) throw new Error(error.message);
}

/**
 * Select all records from a table with optional ordering
 */
export async function selectAll(supabase, table, orderBy = null, ascending = false) {
    let query = supabase.from(table).select('*');
    
    if (orderBy) {
        query = query.order(orderBy, { ascending });
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data || [];
}

/**
 * Select a single record by field
 */
export async function selectOne(supabase, table, field, value) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(field, value)
        .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
}

/**
 * Select records by field with optional ordering
 */
export async function selectWhere(supabase, table, field, value, orderBy = null) {
    let query = supabase.from(table).select('*').eq(field, value);
    
    if (orderBy) {
        query = query.order(orderBy);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data || [];
}

/**
 * Count records in a table
 */
export async function count(supabase, table, field = null, value = null) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    
    if (field && value !== null) {
        query = query.eq(field, value);
    }
    
    const { count: result, error } = await query;
    
    if (error) throw new Error(error.message);
    return result || 0;
}

/**
 * Increment a numeric field
 */
export async function increment(supabase, table, id, field, amount = 1) {
    // First get the current value
    const { data: current, error: selectError } = await supabase
        .from(table)
        .select(field)
        .eq('id', id)
        .single();
    
    if (selectError) throw new Error(selectError.message);
    
    const newValue = (current[field] || 0) + amount;
    
    const { data: result, error: updateError } = await supabase
        .from(table)
        .update({ [field]: newValue })
        .eq('id', id)
        .select()
        .single();
    
    if (updateError) throw new Error(updateError.message);
    return result;
}

/**
 * Get or create a setting
 */
export async function getSetting(supabase, key, defaultValue = null) {
    const { data, error } = await supabase
        .from('key_value_store')
        .select('value')
        .eq('key_name', key)
        .single();
    
    if (error && error.code === 'PGRST116') {
        // Not found, return default
        return defaultValue;
    }
    
    if (error) throw new Error(error.message);
    return data?.value || defaultValue;
}

/**
 * Upsert a setting
 */
export async function upsertSetting(supabase, key, value) {
    const { error } = await supabase
        .from('key_value_store')
        .upsert({ 
            key_name: key, 
            value: value,
            updated_at: new Date().toISOString()
        }, { 
            onConflict: 'key_name' 
        });
    
    if (error) throw new Error(error.message);
}
