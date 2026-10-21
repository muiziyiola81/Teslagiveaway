import { getSupabaseAdmin } from '../db/supabase';
import { getVehicleById } from './vehicleService';
import { recordAuditEvent } from './auditService';
import {
  DatabaseClaim,
  DatabaseClaimStatusHistory,
  DatabasePayment,
  ClaimStatus,
  AuthenticatedUser
} from '../types';

export interface CreateClaimInput {
  vehicleId: string;
  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    streetAddress: string;
    apartmentOrSuite?: string | null;
    city: string;
    stateOrRegion: string;
    postalCode: string;
    country: string;
  };
}

export async function createVerifiedClaim(
  input: CreateClaimInput,
  user: AuthenticatedUser,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<{ claim: DatabaseClaim; message: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Database connection is not configured on the server. Please verify SUPABASE credentials.');
  }

  // 1. Authoritative Vehicle Verification (Server-Side)
  const vehicle = await getVehicleById(input.vehicleId);
  if (!vehicle) {
    throw new Error(`Requested vehicle with ID '${input.vehicleId}' does not exist in inventory.`);
  }

  if (vehicle.availability_status === 'claimed' || vehicle.availability_status === 'discontinued') {
    throw new Error(`Vehicle ${vehicle.year} ${vehicle.model} ${vehicle.trim} is no longer available for allocation.`);
  }

  // 2. Duplicate submission protection: Check if user already has an active claim for this vehicle
  const { data: existingClaims, error: checkError } = await supabase
    .from('claims')
    .select('id, status, created_at')
    .eq('user_id', user.id)
    .eq('vehicle_id', vehicle.id)
    .not('status', 'in', '("cancelled","rejected")');

  if (!checkError && existingClaims && existingClaims.length > 0) {
    throw new Error(
      'An active claim allocation for this vehicle model is already registered under your account. Please check your existing claim status in My Claims.'
    );
  }

  // 3. Persist or link delivery address
  const { data: addressData, error: addressError } = await supabase
    .from('delivery_addresses')
    .insert({
      user_id: user.id,
      full_name: input.deliveryAddress.fullName,
      email: input.deliveryAddress.email,
      phone: input.deliveryAddress.phone,
      street_address: input.deliveryAddress.streetAddress,
      apartment_or_suite: input.deliveryAddress.apartmentOrSuite || null,
      city: input.deliveryAddress.city,
      state_or_region: input.deliveryAddress.stateOrRegion,
      postal_code: input.deliveryAddress.postalCode,
      country: input.deliveryAddress.country,
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (addressError || !addressData) {
    throw new Error(`Failed to store delivery address record: ${addressError?.message || 'Unknown database error'}`);
  }

  // 4. Generate legitimate intake reference code (clearly distinguished from active commercial carrier bills of lading)
  const intakeCode = `TSLA-INTAKE-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 5. Calculate authoritative fees from server database record (Never from client parameters!)
  const vehiclePriceUSD = vehicle.price_usd;
  const deliveryFeeUSD = vehicle.delivery_fee_usd;
  const documentationFeeUSD = vehicle.documentation_fee_usd;
  const totalFeeUSD = vehiclePriceUSD + deliveryFeeUSD + documentationFeeUSD;

  // 6. Insert new claim with 'submitted' status
  const newClaimRecord = {
    tracking_number: intakeCode,
    user_id: user.id,
    vehicle_id: vehicle.id,
    delivery_address_id: addressData.id,
    status: 'submitted' as ClaimStatus,
    vehicle_price_usd: vehiclePriceUSD,
    delivery_fee_usd: deliveryFeeUSD,
    documentation_fee_usd: documentationFeeUSD,
    total_fee_usd: totalFeeUSD,
    is_simulation: false,
    notes: 'Allocation intake submitted. Pending operator eligibility and address verification.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: claimData, error: claimError } = await supabase
    .from('claims')
    .insert(newClaimRecord)
    .select('*')
    .single();

  if (claimError || !claimData) {
    throw new Error(`Failed to create claim record: ${claimError?.message || 'Database insert failed'}`);
  }

  // 7. Insert initial status history record
  await supabase.from('claim_status_history').insert({
    claim_id: claimData.id,
    old_status: null,
    new_status: 'submitted',
    changed_by: user.id,
    reason: 'Initial digital allocation submission by applicant.',
    created_at: new Date().toISOString()
  });

  // 8. Record audit log
  await recordAuditEvent({
    userId: user.id,
    action: 'CLAIM_SUBMITTED',
    resourceType: 'claim',
    resourceId: claimData.id,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    payload: {
      vehicleId: vehicle.id,
      trackingNumber: intakeCode,
      totalFeeUSD
    }
  });

  return {
    claim: claimData as DatabaseClaim,
    message: 'Claim allocation submitted successfully to operator intake queue.'
  };
}

export async function getUserClaims(userId: string): Promise<DatabaseClaim[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      delivery_addresses (*),
      vehicles (*),
      payments (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as DatabaseClaim[];
}

export async function getClaimById(claimId: string, user: AuthenticatedUser): Promise<{
  claim: DatabaseClaim;
  history: DatabaseClaimStatusHistory[];
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  const { data: claim, error } = await supabase
    .from('claims')
    .select(`
      *,
      delivery_addresses (*),
      vehicles (*),
      payments (*)
    `)
    .eq('id', claimId)
    .single();

  if (error || !claim) {
    throw new Error('Claim record not found');
  }

  // Enforce claim ownership check: User can only see their own claim unless they are admin
  if (user.role !== 'admin' && user.role !== 'superadmin' && claim.user_id !== user.id) {
    const forbiddenErr = new Error('Access denied: You do not have permission to view this claim.') as any;
    forbiddenErr.statusCode = 403;
    forbiddenErr.code = 'FORBIDDEN';
    throw forbiddenErr;
  }

  // Fetch status history
  const { data: history } = await supabase
    .from('claim_status_history')
    .select('*')
    .eq('claim_id', claimId)
    .order('created_at', { ascending: true });

  return {
    claim: claim as DatabaseClaim,
    history: (history || []) as DatabaseClaimStatusHistory[]
  };
}

export interface UpdateClaimStatusOptions {
  status?: string;
  deliveryStatus?: string;
  reason: string;
}

export async function updateClaimStatus(
  claimId: string,
  options: UpdateClaimStatusOptions | string,
  legacyReason?: string,
  legacyAdminUser?: AuthenticatedUser
): Promise<DatabaseClaim> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  // Support both new options object and legacy (claimId, newStatus, reason, adminUser) signature
  let targetStatus: string | undefined;
  let targetDeliveryStatus: string | undefined;
  let reason: string;
  let adminUser: AuthenticatedUser;

  if (typeof options === 'object') {
    targetStatus = options.status;
    targetDeliveryStatus = options.deliveryStatus;
    reason = options.reason;
    adminUser = legacyAdminUser || (legacyReason as unknown as AuthenticatedUser);
  } else {
    targetStatus = options;
    reason = legacyReason || 'Administrative update';
    adminUser = legacyAdminUser!;
  }

  const { data: existing, error: findError } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .single();

  if (findError || !existing) {
    throw new Error('Claim record not found');
  }

  const oldStatus = existing.status as ClaimStatus;

  // Map user-friendly or workflow status names to DB enum values
  let newDbStatus: ClaimStatus = oldStatus;
  if (targetStatus) {
    const s = targetStatus.toLowerCase();
    if (s === 'approved') {
      newDbStatus = 'verified' as ClaimStatus;
    } else if (s === 'processing' || s === 'ready_for_delivery') {
      // If delivery status is passed as status, map deliveryStatus and ensure claim is verified/approved
      targetDeliveryStatus = targetDeliveryStatus || (s === 'processing' ? 'processing' : 'ready_for_delivery');
      if (oldStatus === 'submitted' || oldStatus === 'under_review') {
        newDbStatus = 'verified' as ClaimStatus;
      }
    } else if (['submitted', 'under_review', 'verified', 'dispatched', 'delivered', 'rejected', 'cancelled'].includes(s)) {
      newDbStatus = s as ClaimStatus;
    }
  }

  if (targetDeliveryStatus === 'delivered' || targetDeliveryStatus === 'dispatched') {
    newDbStatus = targetDeliveryStatus as ClaimStatus;
  }

  // Parse existing notes or initialize notes JSON metadata
  let notesObj: Record<string, unknown> = {};
  try {
    if (existing.notes && typeof existing.notes === 'string' && existing.notes.trim().startsWith('{')) {
      notesObj = JSON.parse(existing.notes);
    } else if (existing.notes) {
      notesObj = { adminNotes: existing.notes };
    }
  } catch {
    notesObj = { adminNotes: existing.notes || '' };
  }

  if (targetDeliveryStatus) {
    notesObj.deliveryStatus = targetDeliveryStatus;
  }
  if (newDbStatus === 'delivered') {
    notesObj.deliveryStatus = 'delivered';
  }
  notesObj.lastStatusUpdateReason = reason;
  notesObj.lastUpdatedBy = adminUser.email || adminUser.id;
  notesObj.lastUpdatedAt = new Date().toISOString();

  const serializedNotes = JSON.stringify(notesObj);

  const { data: updated, error: updateError } = await supabase
    .from('claims')
    .update({
      status: newDbStatus,
      notes: serializedNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', claimId)
    .select('*')
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update claim status: ${updateError?.message}`);
  }

  // Insert status history record
  const historyReason = targetDeliveryStatus
    ? `${reason} (Delivery: ${targetDeliveryStatus})`
    : reason;

  await supabase.from('claim_status_history').insert({
    claim_id: claimId,
    old_status: oldStatus,
    new_status: newDbStatus,
    changed_by: adminUser.id,
    reason: historyReason,
    created_at: new Date().toISOString()
  });

  // Record security audit event
  await recordAuditEvent({
    userId: adminUser.id,
    action: 'CLAIM_STATUS_UPDATED',
    resourceType: 'claim',
    resourceId: claimId,
    payload: {
      oldStatus,
      newStatus: newDbStatus,
      deliveryStatus: targetDeliveryStatus,
      reason,
      adminEmail: adminUser.email
    }
  });

  return updated as DatabaseClaim;
}

export interface PaymentEvidenceInput {
  transferReference: string;
  senderName: string;
  bankName: string;
  receiptUrl?: string | null;
  notes?: string | null;
}

export async function recordPaymentEvidence(
  claimId: string,
  input: PaymentEvidenceInput,
  user: AuthenticatedUser,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<{ success: boolean; message: string; payment: DatabasePayment }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  // Verify claim belongs to this applicant
  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .single();

  if (claimErr || !claim) {
    throw new Error('Claim record not found');
  }

  if (claim.user_id !== user.id && user.role !== 'admin' && user.role !== 'superadmin') {
    const forbiddenErr = new Error('Access denied: You do not own this claim allocation.') as any;
    forbiddenErr.statusCode = 403;
    forbiddenErr.code = 'FORBIDDEN';
    throw forbiddenErr;
  }

  // Check if a payment record already exists for this claim
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('claim_id', claimId)
    .maybeSingle();

  const paymentMetadata = {
    method: 'bank_transfer',
    transferReference: input.transferReference,
    senderName: input.senderName,
    bankName: input.bankName,
    receiptUrl: input.receiptUrl || null,
    applicantNotes: input.notes || null,
    submittedAt: new Date().toISOString(),
    verificationStatus: 'pending_review' // Never automatically verified!
  };

  let savedPayment: DatabasePayment;

  if (existingPayment) {
    const { data: updatedPay, error: updateErr } = await supabase
      .from('payments')
      .update({
        // Status remains 'pending' - uploading receipt does NOT automatically verify payment!
        status: 'pending',
        provider: 'manual',
        provider_payment_id: input.transferReference,
        metadata: paymentMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPayment.id)
      .select('*')
      .single();

    if (updateErr || !updatedPay) {
      throw new Error(`Failed to update payment evidence: ${updateErr?.message}`);
    }
    savedPayment = updatedPay as DatabasePayment;
  } else {
    const amountCents = Math.round((Number(claim.total_fee_usd) || 1390) * 100);
    const idempotencyKey = `wire-evidence-${claim.id}-${Date.now()}`;

    const { data: insertedPay, error: insertErr } = await supabase
      .from('payments')
      .insert({
        claim_id: claim.id,
        user_id: user.id,
        amount_cents: amountCents,
        currency: 'USD',
        provider: 'manual',
        provider_payment_id: input.transferReference,
        status: 'pending', // Strictly pending until admin confirms receipt of funds
        idempotency_key: idempotencyKey,
        metadata: paymentMetadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertErr || !insertedPay) {
      throw new Error(`Failed to record payment evidence: ${insertErr?.message}`);
    }
    savedPayment = insertedPay as DatabasePayment;
  }

  // Record audit log
  await recordAuditEvent({
    userId: user.id,
    action: 'PAYMENT_EVIDENCE_SUBMITTED',
    resourceType: 'payment',
    resourceId: savedPayment.id,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    payload: {
      claimId: claim.id,
      transferReference: input.transferReference,
      bankName: input.bankName,
      senderName: input.senderName,
      status: 'pending'
    }
  });

  return {
    success: true,
    message: 'Wire payment evidence submitted successfully. Awaiting administrator funds confirmation.',
    payment: savedPayment
  };
}

export async function verifyPayment(
  paymentId: string,
  adminUser: AuthenticatedUser,
  notes?: string,
  updateClaimToApproved: boolean = true,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<{ success: boolean; message: string; payment: DatabasePayment; claim?: DatabaseClaim }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('*, claims (*)')
    .eq('id', paymentId)
    .single();

  if (payErr || !payment) {
    throw new Error('Payment record not found');
  }

  const existingMeta = (payment.metadata as Record<string, unknown>) || {};
  const updatedMeta = {
    ...existingMeta,
    verified: true,
    verificationStatus: 'verified',
    verifiedBy: adminUser.id,
    verifiedByEmail: adminUser.email,
    verifiedAt: new Date().toISOString(),
    verificationNotes: notes || 'Receipt of funds verified by authorized administrator'
  };

  const { data: updatedPay, error: updateErr } = await supabase
    .from('payments')
    .update({
      status: 'succeeded', // Confirmed received
      metadata: updatedMeta,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)
    .select('*')
    .single();

  if (updateErr || !updatedPay) {
    throw new Error(`Failed to verify payment: ${updateErr?.message}`);
  }

  // Log audit event
  await recordAuditEvent({
    userId: adminUser.id,
    action: 'PAYMENT_VERIFIED',
    resourceType: 'payment',
    resourceId: paymentId,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    payload: {
      claimId: payment.claim_id,
      verifiedBy: adminUser.email,
      amountCents: payment.amount_cents,
      verificationNotes: notes
    }
  });

  let updatedClaim: DatabaseClaim | undefined;

  // Optionally update claim status to verified ('Approved')
  if (updateClaimToApproved && payment.claim_id) {
    try {
      updatedClaim = await updateClaimStatus(
        payment.claim_id,
        {
          status: 'verified',
          deliveryStatus: 'processing',
          reason: `Automatic promotion to Approved upon administrator verification of payment (${notes || 'Funds confirmed'}).`
        },
        undefined,
        adminUser
      );
    } catch (claimErr) {
      console.warn('[Admin] Could not automatically update claim status on payment verification:', claimErr);
    }
  }

  return {
    success: true,
    message: 'Payment has been successfully verified and marked as received.',
    payment: updatedPay as DatabasePayment,
    claim: updatedClaim
  };
}

export async function rejectPaymentEvidence(
  paymentId: string,
  adminUser: AuthenticatedUser,
  reason: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<{ success: boolean; message: string; payment: DatabasePayment }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (payErr || !payment) {
    throw new Error('Payment record not found');
  }

  const existingMeta = (payment.metadata as Record<string, unknown>) || {};
  const updatedMeta = {
    ...existingMeta,
    verified: false,
    verificationStatus: 'rejected',
    rejectedBy: adminUser.id,
    rejectedByEmail: adminUser.email,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason
  };

  const { data: updatedPay, error: updateErr } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      metadata: updatedMeta,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)
    .select('*')
    .single();

  if (updateErr || !updatedPay) {
    throw new Error(`Failed to reject payment evidence: ${updateErr?.message}`);
  }

  await recordAuditEvent({
    userId: adminUser.id,
    action: 'PAYMENT_REJECTED',
    resourceType: 'payment',
    resourceId: paymentId,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    payload: {
      claimId: payment.claim_id,
      rejectedBy: adminUser.email,
      reason
    }
  });

  return {
    success: true,
    message: 'Payment evidence has been rejected.',
    payment: updatedPay as DatabasePayment
  };
}
