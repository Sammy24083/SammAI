-- ====================================================================
-- SAMM AI DATABASE MIGRATION 005: Discounts & Promos
-- ====================================================================

DO $$ BEGIN
    CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type discount_type_enum DEFAULT 'percentage' NOT NULL,
    value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
    minimum_order_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    maximum_discount NUMERIC(12, 2),
    usage_limit INT DEFAULT 1000 NOT NULL,
    used_count INT DEFAULT 0 NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.discount_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_id UUID REFERENCES public.discounts(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    applied_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
