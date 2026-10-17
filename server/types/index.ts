import { Request } from 'express';

export type UserRole = 'user' | 'support' | 'admin' | 'superadmin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export type ClaimStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'dispatched'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface DatabaseVehicle {
  id: string;
  vin: string;
  model: string;
  year: number;
  trim: string;
  powertrain: string;
  range_miles: number;
  zero_to_sixty_sec: number;
  top_speed_mph: number;
  exterior_color: string;
  interior_color: string;
  wheels: string;
  price_usd: number;
  delivery_fee_usd: number;
  documentation_fee_usd: number;
  is_free_promotional_vehicle: boolean;
  availability_status: 'in_stock' | 'allocated' | 'claimed' | 'discontinued';
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDeliveryAddress {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  street_address: string;
  apartment_or_suite?: string | null;
  city: string;
  state_or_region: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseClaim {
  id: string;
  tracking_number: string;
  user_id: string;
  vehicle_id: string;
  delivery_address_id: string;
  status: ClaimStatus;
  vehicle_price_usd: number;
  delivery_fee_usd: number;
  documentation_fee_usd: number;
  total_fee_usd: number;
  is_simulation: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseClaimStatusHistory {
  id: string;
  claim_id: string;
  old_status: ClaimStatus | null;
  new_status: ClaimStatus;
  changed_by: string | null;
  reason: string;
  created_at: string;
}

export interface DatabasePayment {
  id: string;
  claim_id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  provider: 'stripe' | 'manual';
  provider_payment_id?: string | null;
  provider_session_id?: string | null;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  idempotency_key: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
