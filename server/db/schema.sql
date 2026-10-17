-- ============================================================================
-- PROMOTION PORTAL POSTGRESQL SCHEMA (SUPABASE)
-- Direct Schema Reference: server/db/schema.sql
-- ============================================================================

-- Refer to supabase/migrations/20261013000000_initial_schema.sql for the complete migration.
-- You can run the entire contents of this file in the Supabase SQL Editor to initialize your database.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) DEFAULT 'United States',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

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

CREATE TABLE IF NOT EXISTS public.claim_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    old_status claim_status_type,
    new_status claim_status_type NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

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
