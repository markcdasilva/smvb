import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from './config/env.config';
import { supabaseConfig, type SupabaseDatabase } from './config/supabase.config';

validateEnv();

export const supabase = createClient<SupabaseDatabase>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  supabaseConfig
);