import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cwrijysuvpvugaexzugd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cmlqeXN1dnB2dWdhZXh6dWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTA2NTksImV4cCI6MjA3NDUyNjY1OX0.p-kTx1fB-1KkcUqS8jJ3pGuTH8mfAmVUWyVVaQ7rOPE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized:', supabase);