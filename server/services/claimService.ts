import { getSupabaseAdmin } from '../db/supabase';
import { getVehicleById } from './vehicleService';
import { recordAuditEvent } from './auditService';
import {
  DatabaseClaim,
  DatabaseClaimStatusHistory,
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
      vehicles (*)
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
      vehicles (*)
    `)
    .eq('id', claimId)
    .single();

  if (error || !claim) {
    throw new Error('Claim record not found');
  }

  // Enforce claim ownership check: User can only see their own claim unless they are admin
  if (user.role !== 'admin' && user.role !== 'superadmin' && claim.user_id !== user.id) {
    throw new Error('Access denied: You do not have permission to view this claim.');
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

export async function updateClaimStatus(
  claimId: string,
  newStatus: ClaimStatus,
  reason: string,
  adminUser: AuthenticatedUser
): Promise<DatabaseClaim> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  const { data: existing, error: findError } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .single();

  if (findError || !existing) {
    throw new Error('Claim record not found');
  }

  const oldStatus = existing.status as ClaimStatus;

  const { data: updated, error: updateError } = await supabase
    .from('claims')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', claimId)
    .select('*')
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update claim status: ${updateError?.message}`);
  }

  // Insert status history
  await supabase.from('claim_status_history').insert({
    claim_id: claimId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: adminUser.id,
    reason,
    created_at: new Date().toISOString()
  });

  // Audit event
  await recordAuditEvent({
    userId: adminUser.id,
    action: 'CLAIM_STATUS_UPDATED',
    resourceType: 'claim',
    resourceId: claimId,
    payload: { oldStatus, newStatus, reason }
  });

  return updated as DatabaseClaim;
}
