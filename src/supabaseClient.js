import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bvxccwndrkvnwmfbfhql.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2eGNjd25kcmt2bndtZmJmaHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjE0NjAsImV4cCI6MjA4NTc5NzQ2MH0.hGWnNGkhg1htJTMtGd74y_hTJX6zMcPhQqd6ZVQO7UA' // вставьте тот же ключ что использовали для импорта

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
