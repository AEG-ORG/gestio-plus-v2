import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Sécurisation pour éviter l'erreur "malformed URL" pendant le build Vercel
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = (rawKey && rawKey.length > 0) ? rawKey : 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)