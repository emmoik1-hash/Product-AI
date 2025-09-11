import { createClient } from '@supabase/supabase-js';

// These variables should be set in your environment variables.
// Fallback to placeholder values to prevent the app from crashing during startup
// if the environment variables are not injected into the client-side code.
// Authentication will not work with these placeholder values.
const supabaseUrl = process.env.SUPABASE_URL || "https://dummy-project-url.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "dummy-anon-key";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn(
        "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set. " +
        "The application will use placeholder values, and authentication will not function correctly. " +
        "Please configure these environment variables for full functionality."
    );
}

// Create and export the Supabase client.
// The createClient function requires non-empty strings, even if they are placeholders.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
