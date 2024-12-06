import { createClient } from '@supabase/supabase-js';
import { env } from './config/env.config';
import { supabaseConfig, type SupabaseDatabase } from './config/supabase.config';
import { withRetry } from './utils/retry';
import { formatDatabaseError } from './utils/error-formatter';

class SupabaseClient {
  private client;
  private connectionStatus: 'connecting' | 'connected' | 'error' = 'connecting';
  
  constructor() {
    this.client = createClient<SupabaseDatabase>(
      env.supabaseUrl,
      env.supabaseAnonKey,
      supabaseConfig
    );

    this.testConnection();
  }

  private async testConnection() {
    try {
      const { error } = await this.client.from('companies')
        .select('id', { count: 'exact', head: true });
      
      if (error) throw error;
      this.connectionStatus = 'connected';
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Supabase connection test failed:', formatDatabaseError(error));
    }
  }

  async query<T>(operation: () => Promise<T>): Promise<T> {
    if (this.connectionStatus === 'error') {
      throw new Error('Database connection is not available. Please check your configuration.');
    }

    return withRetry(
      operation,
      0,
      (error, attempt) => {
        console.warn(`Attempt ${attempt} failed, retrying:`, formatDatabaseError(error));
      }
    ).catch(error => {
      throw formatDatabaseError(error);
    });
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

  getConnectionStatus() {
    return this.connectionStatus;
  }
}

export const supabase = new SupabaseClient();