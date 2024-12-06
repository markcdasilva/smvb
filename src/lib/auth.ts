import { supabase } from './supabase-client';
import type { AuthError, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  session: Session | null;
  error: AuthError | null;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return {
      session: data?.session || null,
      error: error
    };
  } catch (error: any) {
    return {
      session: null,
      error: {
        name: 'AuthError',
        message: error.message || 'An error occurred during sign in',
        status: error.status || 500
      }
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error: any) {
    return {
      error: {
        name: 'AuthError',
        message: error.message || 'An error occurred during sign out',
        status: error.status || 500
      }
    };
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return subscription;
}