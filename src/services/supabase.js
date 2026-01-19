import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const options = {
  auth: {
    persistSession: true,
    storageKey: 'construcom-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options)