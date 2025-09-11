import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
// FIX: The type for a session in Supabase v2 is `Session`, not `AuthSession` (which is from v1).
// Using the incorrect type from a previous version can cause type resolution issues for the entire auth client.
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface AuthContextType {
  // FIX: Use the correct `Session` type from Supabase v2.
  session: Session | null;
  profile: Profile | null;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  incrementUsage: () => void;
  loading: boolean;
  authError: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // FIX: Use the correct `Session` type from Supabase v2 for the state.
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      setAuthError(null);
      try {
        // FIX: This is the correct v2 API call. The error was likely due to a type mismatch caused by importing `AuthSession`.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setSession(session);

        if (session?.user) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'not found'
            throw profileError;
          }
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Authentication Error:', error);
        if (error instanceof Error && error.message.toLowerCase().includes('fetch')) {
            setAuthError('Failed to connect to authentication service. Please check your internet connection.');
        } else {
            setAuthError('An unexpected error occurred during authentication.');
        }
        setSession(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndProfile();

    // FIX: This is the correct v2 API call. The error was likely due to a type mismatch.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if profile exists
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Create profile for new user
            const { data: newProfile, error } = await supabase
              .from('profiles')
              .insert({ id: session.user.id, email: session.user.email, usage_count: 0 })
              .select()
              .single();
            
            if (error) {
              console.error('Error creating profile for new user:', error);
            } else {
              setProfile(newProfile);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    // FIX: This is the correct v2 API call for magic links. The error was likely due to a type mismatch.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Redirect URL should be the URL of your deployed application
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    // FIX: This is the correct v2 API call. The error was likely due to a type mismatch.
    await supabase.auth.signOut();
  }, []);

  const incrementUsage = useCallback(async () => {
    if (!profile) return;
    
    const newCount = profile.usage_count + 1;
    setProfile({ ...profile, usage_count: newCount }); // Optimistic update

    const { error } = await supabase
      .from('profiles')
      .update({ usage_count: newCount })
      .eq('id', profile.id);

    if (error) {
      console.error("Error updating usage count:", error);
      // Revert if DB update fails
      setProfile(profile); 
    }
  }, [profile]);
  
  const value = { session, profile, signInWithMagicLink, signOut, incrementUsage, loading, authError };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};