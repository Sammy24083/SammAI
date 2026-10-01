-- ====================================================================
-- SAMM AI DATABASE MIGRATION 003: Orders, Order Items & Delivery Records
-- ====================================================================

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded');
    CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'fulfilled', 'cancelled', 'refunded');
    CREATE TYPE delivery_status_enum AS ENUM ('pending', 'processing', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sequence for custom order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- Function to generate order numbers like SAMM-2026-001001
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'SAMM-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL DEFAULT generate_order_number(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    customer_country TEXT DEFAULT 'Nigeria' NOT NULL,
    order_notes TEXT,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN' NOT NULL,
    discount_code TEXT,
    payment_status payment_status_enum DEFAULT 'pending' NOT NULL,
    order_status order_status_enum DEFAULT 'pending' NOT NULL,
    payment_reference TEXT UNIQUE,
    payment_provider TEXT DEFAULT 'OPay Transfer' NOT NULL,
    delivery_status delivery_status_enum DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order Items Table (snapshots price and name at purchase time)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    subscription_duration TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Delivery Records Table
CREATE TABLE IF NOT EXISTS public.delivery_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    delivery_method TEXT DEFAULT 'Instant WhatsApp & Email' NOT NULL,
    delivery_status delivery_status_enum DEFAULT 'pending' NOT NULL,
    delivery_instructions TEXT NOT NULL,
    access_information TEXT NOT NULL, -- sensitive credentials/licenses
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    fulfilled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    fulfilled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_delivery_records_updated_at
BEFORE UPDATE ON public.delivery_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
