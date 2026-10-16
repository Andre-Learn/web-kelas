import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseEnv'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
