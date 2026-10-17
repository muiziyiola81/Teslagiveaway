import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

if (config.supabase.isConfigured) {
  try {
    // Client for public/anon requests
    if (config.supabase.url && config.supabase.anonKey) {
      supabaseClient = createClient(config.supabase.url, config.supabase.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }

    // Service Role Client for backend administrative operations and verified database operations
    const keyForAdmin = config.supabase.serviceRoleKey || config.supabase.anonKey;
    if (config.supabase.url && keyForAdmin) {
      supabaseAdminClient = createClient(config.supabase.url, keyForAdmin, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err);
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  return supabaseAdminClient;
}

/**
 * Checks if the database connection and client are operational
 */
export async function testDatabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabaseAdminClient && !supabaseClient) {
    return {
      ok: false,
      message: 'Supabase credentials are not configured in environment variables (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY missing).'
    };
  }

  try {
    const client = supabaseAdminClient || supabaseClient;
    if (!client) {
      return { ok: false, message: 'Supabase client instance not available.' };
    }

    // Ping the vehicles or health query
    const { error } = await client.from('vehicles').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, migrations need to be applied
      if (error.code === '42P01') {
        return {
          ok: false,
          message: 'Connected to Supabase, but initial migrations have not been applied yet (tables missing).'
        };
      }
      return { ok: false, message: `Database query check failed: ${error.message}` };
    }

    return { ok: true, message: 'Database connection verified.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Database connection error: ${msg}` };
  }
}
