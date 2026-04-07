import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Detect if we're in a browser or serverless environment
const isBrowser = typeof window !== 'undefined';

// Use process.env in serverless functions, import.meta.env in the browser
const supabaseUrl = isBrowser 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process.env.VITE_SUPABASE_URL;
  
const supabaseAnonKey = isBrowser 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars:', { 
    VITE_SUPABASE_URL: supabaseUrl, 
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'set' : 'missing' 
  });
}

export const supabase = createClient<Database>(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      ...(isBrowser ? { storage: window.localStorage } : {}),
    }
  }
)