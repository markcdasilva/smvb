import { Database } from '../types/database.types';

export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'smvb-auth-token'
  },
  global: {
    headers: {
      'x-application-name': 'smv-benchmark'
    }
  }
} as const;

export type SupabaseDatabase = Database;