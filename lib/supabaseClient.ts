
import { createClient } from '@supabase/supabase-js';

// NOTE: Vercel injects environment variables during the build process.
// These variables must be configured in the Vercel project settings.
// We use NEXT_PUBLIC_ prefix by convention.
// Ensure these are set in your Vercel dashboard.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This flag helps the AuthContext provide a user-friendly error
// if the environment variables are not configured in Vercel.
export const isSupabaseMisconfigured = !supabaseUrl || !supabaseAnonKey;

if (isSupabaseMisconfigured) {
    // This warning is for the developer console.
    console.warn(
        "Supabase credentials are not configured in your environment variables. " +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings. " +
        "Authentication will not function correctly."
    );
}

// Create and export the Supabase client.
// The createClient function requires non-empty strings, so we provide fallbacks.
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
