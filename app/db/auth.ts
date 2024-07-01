import { createClient } from "@supabase/supabase-js";

/**
 * Retrieves Supabase credentials from environment variables
 * and creates a Supabase client instance.
 *
 * @throws {Error} If Supabase credentials are not found in environment variables.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials not found in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
