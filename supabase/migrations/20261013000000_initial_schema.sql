-- ============================================================================
-- PROMOTION PORTAL POSTGRESQL SCHEMA (SUPABASE)
-- Initial Migration: 20261013000000_initial_schema.sql
-- Hardened for Idempotency, Zero-Data-Loss, and RLS Security
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USER PROFILES
-- Linked to Supabase Auth (auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name TEXT NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) DEFAULT 'United States',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ----------------------------------------------------------------------------
-- 2. ADMINISTRATIVE ROLES
-- Explicit server-verified roles (Never grant based on client-supplied data)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('user', 'support', 'admin', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_role UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ----------------------------------------------------------------------------
-- 3. VEHICLE INVENTORY
-- Authoritative catalog with prices, mandatory fees, and inventory state
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE vehicle_availability AS ENUM ('in_stock', 'allocated', 'claimed', 'discontinued');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.vehicles (
    id VARCHAR(50) PRIMARY KEY,
    vin VARCHAR(17) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2035),
    trim VARCHAR(100) NOT NULL,
    powertrain VARCHAR(150) NOT NULL,
    range_miles INTEGER NOT NULL CHECK (range_miles > 0),
    zero_to_sixty_sec NUMERIC(4,2) NOT NULL CHECK (zero_to_sixty_sec > 0),
    top_speed_mph INTEGER NOT NULL CHECK (top_speed_mph > 0),
    exterior_color VARCHAR(100) NOT NULL,
    interior_color VARCHAR(100) NOT NULL,
    wheels VARCHAR(100) NOT NULL,
    price_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (price_usd >= 0),
    delivery_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 1200.00 CHECK (delivery_fee_usd >= 0),
    documentation_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 190.00 CHECK (documentation_fee_usd >= 0),
    is_free_promotional_vehicle BOOLEAN NOT NULL DEFAULT true,
    availability_status vehicle_availability NOT NULL DEFAULT 'in_stock',
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(availability_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON public.vehicles(model);

-- ----------------------------------------------------------------------------
-- 4. DELIVERY ADDRESSES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    street_address TEXT NOT NULL,
    apartment_or_suite TEXT,
    city VARCHAR(100) NOT NULL,
    state_or_region VARCHAR(100) NOT NULL,
    postal_code VARCHAR(30) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user ON public.delivery_addresses(user_id);

-- ----------------------------------------------------------------------------
-- 5. VEHICLE CLAIMS
-- Primary entity for allocations and claims
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE claim_status_type AS ENUM (
        'submitted',
        'under_review',
        'verified',
        'dispatched',
        'delivered',
        'rejected',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    delivery_address_id UUID NOT NULL REFERENCES public.delivery_addresses(id) ON DELETE RESTRICT,
    status claim_status_type NOT NULL DEFAULT 'submitted',
    vehicle_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 1200.00,
    documentation_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 190.00,
    total_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 1390.00,
    is_simulation BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_vehicle_id ON public.claims(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_tracking_number ON public.claims(tracking_number);

-- ----------------------------------------------------------------------------
-- 6. CLAIM STATUS HISTORY
-- Immutable audit trail of every status transition
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.claim_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    old_status claim_status_type,
    new_status claim_status_type NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_claim_history_claim_id ON public.claim_status_history(claim_id);

-- ----------------------------------------------------------------------------
-- 7. PAYMENT RECORDS (STAGE 6 FOUNDATION)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
    provider_payment_id TEXT,
    provider_session_id TEXT,
    status payment_status_type NOT NULL DEFAULT 'pending',
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_claim_id ON public.payments(claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ----------------------------------------------------------------------------
-- 8. AUDIT EVENTS
-- Security, authorization, and administrative activity logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_events(created_at);

-- ----------------------------------------------------------------------------
-- 9. UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER set_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_delivery_addresses_updated_at ON public.delivery_addresses;
CREATE TRIGGER set_delivery_addresses_updated_at
    BEFORE UPDATE ON public.delivery_addresses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_claims_updated_at ON public.claims;
CREATE TRIGGER set_claims_updated_at
    BEFORE UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current authenticated user an admin?
-- Hardened with fixed search_path to prevent search-path injection
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Helper function: Automatically create profile on new user registration in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user'), '@', 1))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- User Roles: Users can only view their own role; mutations restricted to server service_role
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Vehicles: Everyone can view active inventory; only admins can insert/update
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.vehicles;
CREATE POLICY "Anyone can view inventory"
    ON public.vehicles FOR SELECT
    TO PUBLIC
    USING (true);

DROP POLICY IF EXISTS "Admins can modify inventory" ON public.vehicles;
CREATE POLICY "Admins can modify inventory"
    ON public.vehicles FOR ALL
    USING (public.is_admin());

-- Delivery Addresses: Users manage their own addresses; admins can view for logistics
DROP POLICY IF EXISTS "Users manage own addresses" ON public.delivery_addresses;
CREATE POLICY "Users manage own addresses"
    ON public.delivery_addresses FOR ALL
    USING (auth.uid() = user_id OR public.is_admin());

-- Claims: Users can view their own claims; admins can view and update all claims
DROP POLICY IF EXISTS "Users can view own claims" ON public.claims;
CREATE POLICY "Users can view own claims"
    ON public.claims FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create claims" ON public.claims;
CREATE POLICY "Users can create claims"
    ON public.claims FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update claims" ON public.claims;
CREATE POLICY "Admins can update claims"
    ON public.claims FOR UPDATE
    USING (public.is_admin());

-- Claim Status History: Users can view history of their claims; only admins/system write
DROP POLICY IF EXISTS "Users can view own claim history" ON public.claim_status_history;
CREATE POLICY "Users can view own claim history"
    ON public.claim_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.claims
            WHERE claims.id = claim_status_history.claim_id
            AND (claims.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Payments: Users view own payments; admins manage
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Audit Events: Only admins can view audit logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_events;
CREATE POLICY "Only admins can view audit logs"
    ON public.audit_events FOR SELECT
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. INITIAL SEED INVENTORY DATA
-- Idempotent insertion (ON CONFLICT DO NOTHING)
-- ----------------------------------------------------------------------------
INSERT INTO public.vehicles (
    id, vin, model, year, trim, powertrain, range_miles,
    zero_to_sixty_sec, top_speed_mph, exterior_color, interior_color,
    wheels, price_usd, delivery_fee_usd, documentation_fee_usd,
    is_free_promotional_vehicle, availability_status, image_url
) VALUES
(
    'veh-ms-plaid-2026', '5YJSA1E28TF982104', 'Model S', 2026,
    'Plaid Tri-Motor AWD', 'Tri-Motor All-Wheel Drive (1,020 hp)',
    359, 1.99, 200, 'Deep Blue Metallic', 'All Black Carbon Fiber Décor',
    '21" Arachnid Wheels', 0.00, 1200.00, 190.00,
    true, 'in_stock',
    '/images/model-s-primary.jpg'
),
(
    'veh-m3-perf-2026', '5YJ3E1EB8TF441920', 'Model 3', 2026,
    'Performance AWD', 'Dual Motor Performance AWD (510 hp)',
    303, 2.90, 163, 'Pearl White Multi-Coat', 'Black and White Sport Interior',
    '20" Warp Wheels', 0.00, 1200.00, 190.00,
    true, 'in_stock',
    '/images/model-3-primary.jpg'
),
(
    'veh-my-lr-2026', '7SAYGDEE8TF330198', 'Model Y', 2026,
    'Long Range AWD', 'Dual Motor All-Wheel Drive (384 hp)',
    311, 4.80, 135, 'Midnight Silver Metallic', 'All Black Premium Interior',
    '20" Induction Wheels', 0.00, 1200.00, 190.00,
    true, 'in_stock',
    '/images/model-y-primary.jpg'
),
(
    'veh-mx-plaid-2026', '5YJXCBE28TF719033', 'Model X', 2026,
    'Plaid Tri-Motor AWD', 'Tri-Motor All-Wheel Drive (1,020 hp)',
    326, 2.50, 163, 'Pearl White Multi-Coat', 'Cream Premium Interior with Walnut Décor',
    '22" Turbine Wheels', 0.00, 1200.00, 190.00,
    true, 'allocated',
    '/images/model-x-primary.jpg'
),
(
    'veh-ct-cb-2026', '7G2CE6ED8TF104882', 'Cybertruck', 2026,
    'Cyberbeast Tri-Motor AWD', 'Tri-Motor All-Wheel Drive (845 hp)',
    320, 2.60, 130, 'Stainless Steel Armor', 'Tactical Grey with Ceramic Finish',
    '20" Cyber Wheels with 35" All-Terrain Tires', 0.00, 1200.00, 190.00,
    true, 'in_stock',
    '/images/cybertruck-primary.jpg'
)
ON CONFLICT (id) DO NOTHING;
