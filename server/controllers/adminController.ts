import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ClaimStatus } from '../types';
import { getSupabaseAdmin } from '../db/supabase';
import { updateClaimStatus } from '../services/claimService';
import { seedVehiclesIfEmpty } from '../services/vehicleService';

export async function getAllClaims(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(503).json({ error: { message: 'Database client unavailable' } });
      return;
    }

    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('claims')
      .select(`
        *,
        delivery_addresses (*),
        vehicles (*),
        profiles:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch administrative claims: ${error.message}`);
    }

    res.json({
      success: true,
      data: data || [],
      count: count || data?.length || 0
    });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateClaimStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: 'Unauthorized' } });
      return;
    }

    const { id } = req.params;
    const { status, reason } = req.body as { status: ClaimStatus; reason: string };

    const updated = await updateClaimStatus(id, status, reason, req.user);

    res.json({
      success: true,
      data: updated,
      message: `Claim status successfully changed to '${status}'.`
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(503).json({ error: { message: 'Database client unavailable' } });
      return;
    }

    const { limit = 100 } = req.query;

    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) {
      throw new Error(`Failed to load audit events: ${error.message}`);
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (err) {
    next(err);
  }
}

export async function syncInventory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await seedVehiclesIfEmpty();
    res.json({
      success: true,
      message: result.message,
      seeded: result.seeded
    });
  } catch (err) {
    next(err);
  }
}
