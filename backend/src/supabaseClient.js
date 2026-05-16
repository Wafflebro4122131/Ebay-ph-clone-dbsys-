import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let supabaseReady = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    supabaseReady = true;
  } catch (error) {
    console.warn('Supabase client not initialized:', error.message);
  }
} else {
  console.warn('Supabase URL or anon key not provided; running in fallback mode.');
}

export { supabase, supabaseReady };
