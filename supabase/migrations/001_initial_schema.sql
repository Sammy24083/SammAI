-- ====================================================================
-- SAMM AI DATABASE MIGRATION 001: Initial Schema & Profiles
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Roles Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_number TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    country TEXT DEFAULT 'Nigeria',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically create profile entry on auth.user created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, country)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
        COALESCE(NEW.raw_user_meta_data->>'country', 'Nigeria')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT DEFAULT 'SAMM AI' NOT NULL,
    tagline TEXT DEFAULT 'Premium AI. Smarter Access.' NOT NULL,
    whatsapp_number TEXT DEFAULT '07036192301' NOT NULL,
    support_email TEXT DEFAULT 'support@sammai.store' NOT NULL,
    currency TEXT DEFAULT 'NGN' NOT NULL,
    announcement_text TEXT DEFAULT '⚡ Instant WhatsApp & Email Delivery for all AI Subscriptions',
    hero_title TEXT DEFAULT 'Premium AI tools. Smarter access.',
    hero_description TEXT DEFAULT 'Discover premium AI subscriptions and digital tools for learning, creating, building and growing — all in one trusted African marketplace.',
    paystack_public_key TEXT,
    opay_account_number TEXT,
    opay_account_name TEXT,
    opay_bank_name TEXT,
    social_links JSONB DEFAULT '{"instagram": "https://instagram.com/samm_ai", "twitter": "https://x.com/samm_ai", "tiktok": "https://tiktok.com/@samm_ai"}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
