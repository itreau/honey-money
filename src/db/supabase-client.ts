import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Frontend Supabase client - uses VITE_ prefixed env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars:', { 
    VITE_SUPABASE_URL: supabaseUrl, 
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'set' : 'missing' 
  });
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '')