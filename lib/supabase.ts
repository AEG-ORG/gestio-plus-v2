import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Création sécurisée pour empêcher tout plantage du build Vercel
let supabaseClient: any

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
} catch (e) {
  // Client de secours neutre en cas d'erreur de format pendant le build
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export const supabase = supabaseClient