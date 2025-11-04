/**
 * Supabase Database Helper Functions
 * This file was missing from the deployment package
 */

import { createClient } from '@supabase/supabase-js';

// Database connection helper
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Generic database helpers
export const selectAll = async (db, tableName, orderBy = 'created_at', ascending = false) => {
  try {
    let query = db.from(tableName).select('*');
    
    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error selecting from ${tableName}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Failed to select from ${tableName}:`, error);
    throw error;
  }
};

export const selectById = async (db, tableName, id) => {
  try {
    const { data, error } = await db
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error selecting ${tableName} by id:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to select ${tableName} by id:`, error);
    throw error;
  }
};

export const insertOne = async (db, tableName, data) => {
  try {
    const { data: result, error } = await db
      .from(tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to insert into ${tableName}:`, error);
    throw error;
  }
};

export const updateById = async (db, tableName, id, data) => {
  try {
    const { data: result, error } = await db
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to update ${tableName}:`, error);
    throw error;
  }
};

export const deleteById = async (db, tableName, id) => {
  try {
    const { error } = await db
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete from ${tableName}:`, error);
    throw error;
  }
};

export const getSetting = async (db, key) => {
  try {
    const { data, error } = await db
      .from('key_value_store')
      .select('value')
      .eq('key_name', key)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error(`Error getting setting ${key}:`, error);
      throw error;
    }
    
    return data ? data.value : null;
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    throw error;
  }
};

export const setSetting = async (db, key, value) => {
  try {
    const { data: result, error } = await db
      .from('key_value_store')
      .upsert({ key_name: key, value })
      .select()
      .single();
    
    if (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to set setting ${key}:`, error);
    throw error;
  }
};

export default {
  getSupabaseClient,
  selectAll,
  selectById,
  insertOne,
  updateById,
  deleteById,
  getSetting,
  setSetting
};