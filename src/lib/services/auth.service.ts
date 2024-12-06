import { supabase } from '../supabase-client';
import type { Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  session: Session | null;
  error: AuthError | null;
}

export class AuthService {
  static async signIn(email: string, password: string): Promise<AuthResponse> {
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

  static async signOut(): Promise<{ error: AuthError | null }> {
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

  static async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Session retrieval error:', error);
      return null;
    }
  }

  static onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}