import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from './config/env.config';
import { supabaseConfig, type SupabaseDatabase } from './config/supabase.config';

validateEnv();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class SupabaseClient {
  private client;
  
  constructor() {
    this.client = createClient<SupabaseDatabase>(
      env.supabaseUrl,
      env.supabaseAnonKey,
      {
        ...supabaseConfig,
        auth: {
          ...supabaseConfig.auth,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        global: {
          ...supabaseConfig.global,
          headers: {
            ...supabaseConfig.global.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      }
    );
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${i + 1} failed:`, error);
        
        if (i < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  async query<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await this.retryOperation(operation);
    } catch (error: any) {
      // Handle specific error types
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      if (error.status === 403) {
        throw new Error('Access denied. Please check your permissions.');
      }
      
      if (error.status === 404) {
        throw new Error('Resource not found.');
      }
      
      // Re-throw unknown errors
      throw error;
    }
  }

  get auth() {
    return this.client.auth;
  }

  get storage() {
    return this.client.storage;
  }

  from(table: string) {
    return this.client.from(table);
  }
}

export const supabase = new SupabaseClient();