import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://hiytvjbzfpqtekutleom.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpeXR2amJ6ZnBxdGVrdXRsZW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDY2NzAsImV4cCI6MjEwODIyMjY3MH0.tA8CuRZoi6AF9JEBCJRDJzf0iUoCauJJUxHMVyLLkZU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
