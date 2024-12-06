import { z } from 'zod';

const envSchema = z.object({
  supabaseUrl: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  supabaseAnonKey: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
  siteUrl: z.string().url().default('https://www.smvbenchmark.dk'),
  encryptionKey: z.string().min(32, 'VITE_ENCRYPTION_KEY must be at least 32 characters'),
  isDevelopment: z.boolean().default(false)
});

type EnvConfig = z.infer<typeof envSchema>;

function loadEnvConfig(): EnvConfig {
  const isDevelopment = import.meta.env.DEV;
  
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    siteUrl: isDevelopment ? 'http://localhost:5173' : 'https://www.smvbenchmark.dk',
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY,
    isDevelopment
  };
}

export function validateEnv(): EnvConfig {
  const config = loadEnvConfig();

  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `- ${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${messages}`);
    }
    throw error;
  }
}

export const env = validateEnv();