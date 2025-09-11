
import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials to resolve the initialization error.
// The application was unable to find these values in the environment variables.
// NOTE: For a production deployment (like on Vercel), it is recommended to
// switch back to using environment variables for better security.
const supabaseUrl = 'https://cfzllqaoykjxvwxexuje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmemxscWFveWtqeHZ3eGV4dWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTQzNDEsImV4cCI6MjA3MjczMDM0MX0.sh5vRczPxc2WSrz83VWcQTZ6JNEPA_3qFwbrUu_gPCg';


// This flag helps the AuthContext provide a user-friendly error.
// With hardcoded values, this should be false unless they are deleted.
export const isSupabaseMisconfigured = !supabaseUrl || !supabaseAnonKey;

// Create and export the Supabase client.
// This will now work because supabaseUrl and supabaseAnonKey are provided.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
