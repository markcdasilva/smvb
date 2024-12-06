export const env = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY
  } as const;
  
  export function validateEnv() {
    const required = ['supabaseUrl', 'supabaseAnonKey', 'encryptionKey'] as const;
    
    for (const key of required) {
      if (!env[key]) {
        throw new Error(`Missing required environment variable: VITE_${key.toUpperCase()}`);
      }
    }
  }