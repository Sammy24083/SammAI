-- ====================================================================
-- SAMM AI DATABASE MIGRATION 002: Categories & Products
-- ====================================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon TEXT DEFAULT 'bot' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock Status Enum
DO $$ BEGIN
    CREATE TYPE stock_status_enum AS ENUM ('in_stock', 'limited', 'out_of_stock');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    promo_price NUMERIC(12, 2) CHECK (promo_price IS NULL OR (promo_price >= 0 AND promo_price <= price)),
    currency TEXT DEFAULT 'NGN' NOT NULL,
    subscription_duration TEXT NOT NULL, -- e.g. '18 Months', '1 Month', '1 Year'
    stock_status stock_status_enum DEFAULT 'in_stock' NOT NULL,
    stock_quantity INT DEFAULT 100 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_on_sale BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    image_url TEXT NOT NULL,
    delivery_method TEXT DEFAULT 'Email & WhatsApp Instant Delivery',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Product Features Table
CREATE TABLE IF NOT EXISTS public.product_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    feature TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
