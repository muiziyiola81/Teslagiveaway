import { getSupabaseAdmin } from '../db/supabase';

export interface AuditLogParams {
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
}

export async function recordAuditEvent(params: AuditLogParams): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // If database not configured, log to server console
    console.log(`[AUDIT EVENT] [${params.action}] User: ${params.userId || 'anonymous'} Resource: ${params.resourceType}:${params.resourceId || 'N/A'}`);
    return;
  }

  try {
    await supabase.from('audit_events').insert({
      user_id: params.userId || null,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      payload: params.payload || null,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('[AUDIT] Failed to persist audit record to database:', err);
  }
}
