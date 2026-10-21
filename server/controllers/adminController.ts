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

    const { status, paymentStatus, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('claims')
      .select(`
        *,
        delivery_addresses (*),
        vehicles (*),
        profiles:user_id (id, full_name, email, phone),
        payments (*)
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && typeof status === 'string' && status !== 'all') {
      const s = status.toLowerCase();
      if (s === 'approved') {
        query = query.eq('status', 'verified');
      } else {
        query = query.eq('status', s);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch administrative claims: ${error.message}`);
    }

    // Process and enrich claim rows with parsed notes and delivery status
    let processedClaims = (data || []).map((claim: any) => {
      let notesData: Record<string, unknown> = {};
      try {
        if (claim.notes && typeof claim.notes === 'string' && claim.notes.trim().startsWith('{')) {
          notesData = JSON.parse(claim.notes);
        } else if (claim.notes) {
          notesData = { adminNotes: claim.notes };
        }
      } catch {
        notesData = { adminNotes: claim.notes || '' };
      }

      // Check payments array
      const payments = claim.payments || [];
      const primaryPayment = payments[0] || null;

      // Extract delivery status
      let deliveryStatus = notesData.deliveryStatus || 'not_scheduled';
      if (claim.status === 'delivered') deliveryStatus = 'delivered';
      else if (claim.status === 'dispatched') deliveryStatus = 'dispatched';

      return {
        ...claim,
        delivery_status: deliveryStatus,
        parsed_notes: notesData,
        primary_payment: primaryPayment
      };
    });

    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
      processedClaims = processedClaims.filter(c => {
        const pStatus = c.primary_payment?.status || 'pending';
        const vStatus = c.primary_payment?.metadata?.verificationStatus || 'none';
        if (paymentStatus === 'evidence_submitted') {
          return pStatus === 'pending' && vStatus === 'pending_review';
        }
        if (paymentStatus === 'verified') {
          return pStatus === 'succeeded';
        }
        if (paymentStatus === 'pending') {
          return pStatus === 'pending';
        }
        return pStatus === paymentStatus;
      });
    }

    res.json({
      success: true,
      data: processedClaims,
      count: count || processedClaims.length
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
    const { status, deliveryStatus, reason } = req.body as {
      status?: ClaimStatus;
      deliveryStatus?: string;
      reason: string;
    };

    const updated = await updateClaimStatus(
      id,
      { status, deliveryStatus, reason },
      undefined,
      req.user
    );

    res.json({
      success: true,
      data: updated,
      message: `Claim status successfully updated.`
    });
  } catch (err) {
    next(err);
  }
}

export async function adminVerifyPayment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: 'Unauthorized' } });
      return;
    }

    const { id } = req.params; // payment id
    const { notes, updateClaimStatusToApproved = true } = req.body as {
      notes?: string;
      updateClaimStatusToApproved?: boolean;
    };

    const result = await (await import('../services/claimService')).verifyPayment(
      id,
      req.user,
      notes,
      updateClaimStatusToApproved,
      {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.json({
      success: true,
      data: result.payment,
      claim: result.claim,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

export async function adminRejectPayment(
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
    const { reason } = req.body as { reason: string };

    const result = await (await import('../services/claimService')).rejectPaymentEvidence(
      id,
      req.user,
      reason,
      {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.json({
      success: true,
      data: result.payment,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllPayments(
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

    const { status, limit = 100 } = req.query;

    let query = supabase
      .from('payments')
      .select(`
        *,
        claims (*, vehicles (*), delivery_addresses (*)),
        profiles:user_id (id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (status && typeof status === 'string' && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load administrative payments: ${error.message}`);
    }

    res.json({
      success: true,
      data: data || []
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
