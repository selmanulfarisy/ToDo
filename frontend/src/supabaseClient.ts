import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * 
 * This file configures and initializes the connection to your Supabase project.
 * It reads the project URL and Anon Key from Vite's environment variables.
 * 
 * Vite exposes environment variables on the special 'import.meta.env' object.
 * To use these, create a '.env' file in the root of your frontend directory:
 * VITE_SUPABASE_URL=your-supabase-project-url
 * VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide a helpful warning if the environment variables are not configured.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables are missing! ' +
    'Please verify that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Initialize and export the client instance
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-anon-key'
);
