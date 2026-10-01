-- ====================================================================
-- SAMM AI COMPLETE DATABASE SETUP (PASTE DIRECTLY IN SUPABASE SQL EDITOR)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_number TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' NOT NULL,
    country TEXT DEFAULT 'Nigeria',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Site Settings Table
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

-- 5. Categories Table
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

-- 6. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    promo_price NUMERIC(12, 2),
    currency TEXT DEFAULT 'NGN' NOT NULL,
    subscription_duration TEXT NOT NULL,
    stock_status TEXT DEFAULT 'in_stock' NOT NULL,
    stock_quantity INT DEFAULT 100 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_on_sale BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    image_url TEXT NOT NULL,
    delivery_method TEXT DEFAULT 'Email & WhatsApp Instant Delivery',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Product Features Table
CREATE TABLE IF NOT EXISTS public.product_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    feature TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
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
    payment_status TEXT DEFAULT 'pending' NOT NULL,
    order_status TEXT DEFAULT 'pending' NOT NULL,
    payment_reference TEXT,
    payment_provider TEXT DEFAULT 'OPay Transfer' NOT NULL,
    delivery_status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Order Items Table
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

-- 10. Delivery Records Table
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
    delivery_status TEXT DEFAULT 'pending' NOT NULL,
    delivery_instructions TEXT NOT NULL,
    access_information TEXT NOT NULL,
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    fulfilled_by TEXT DEFAULT 'SAMM AI Operations',
    fulfilled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    provider TEXT DEFAULT 'Paystack' NOT NULL,
    reference TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN' NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    gateway_response TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Discounts Table
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'percentage' NOT NULL,
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

-- 13. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_role TEXT DEFAULT 'Creator / Developer',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT true NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. FAQs Table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General' NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- SEED DATA (POPULATE STORE WITH REAL AI TOOLS & PRICING)
-- ====================================================================

-- Categories
INSERT INTO public.categories (id, name, slug, description, icon, is_active, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'AI Tools', 'ai-tools', 'ChatGPT, Gemini, Claude, Grok and more frontier models', 'bot', true, 1),
('22222222-2222-2222-2222-222222222222', 'Creative Tools', 'creative-tools', 'Canva Pro, design and visual content creation tools', 'palette', true, 2),
('33333333-3333-3333-3333-333333333333', 'Video & Media', 'video-media', 'Video generation, voice cloning and media tools', 'video', true, 3),
('44444444-4444-4444-4444-444444444444', 'Developer Tools', 'developer-tools', 'AI coding and developer productivity tools', 'code', true, 4),
('55555555-5555-5555-5555-555555555555', 'Productivity', 'productivity', 'Research, writing, documents and productivity tools', 'book-open', true, 5),
('66666666-6666-6666-6666-666666666666', 'Deals', 'deals', 'Special prices and limited-time African offers', 'flame', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO public.products (
    id, name, slug, short_description, description, category_id,
    price, promo_price, currency, subscription_duration, stock_status,
    stock_quantity, is_featured, is_on_sale, is_active, image_url, delivery_method
) VALUES
(
    'a0000001-0000-0000-0000-000000000001',
    'GOOGLE GEMINI AI PRO',
    'google-gemini-ai-pro',
    'Google Gemini Advanced multimodal AI with 2M token context, Imagen 3, and deep Workspace integration.',
    'Access Google most capable frontier AI model with an expansive 2 million token context window. Perfect for analyzing full books, complex code repositories, hours of audio, and detailed video files. Includes advanced Imagen 3 image generation, document synthesis, and Python code execution in a dedicated private environment.',
    '11111111-1111-1111-1111-111111111111',
    15000, 12000, 'NGN', '18 Months', 'in_stock', 150, true, true, true,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'Email & WhatsApp Instant Delivery'
),
(
    'a0000002-0000-0000-0000-000000000002',
    'CHATGPT PLUS (GPT-4o & Canvas)',
    'chatgpt-plus',
    'Full access to GPT-4o, OpenAI o1 reasoning model, DALL·E 3, custom GPTs, and real-time voice.',
    'Supercharge your daily workflow with OpenAI flagship subscription. Enjoy unrestricted access to GPT-4o, high-accuracy reasoning with o1, canvas interactive coding & writing, memory persistence, web browsing with live citations, and custom GPT creators.',
    '11111111-1111-1111-1111-111111111111',
    16000, 13000, 'NGN', '1 Month', 'in_stock', 85, true, true, true,
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    'Email & WhatsApp Instant Delivery'
),
(
    'a0000003-0000-0000-0000-000000000003',
    'CANVA PRO',
    'canva-pro',
    'Unlock 100M+ premium graphics, Magic Studio AI tools, background remover, brand kits, and unlimited resize.',
    'The ultimate creative toolkit for designers, social media managers, and entrepreneurs. Access all premium templates, stock video clips, 1-click Magic Switch, automatic background remover, and cloud storage for 365 days on your private personal email.',
    '22222222-2222-2222-2222-222222222222',
    8000, 5000, 'NGN', '1 Year', 'in_stock', 250, true, true, true,
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    'Direct Email Invite & WhatsApp'
),
(
    'a0000004-0000-0000-0000-000000000004',
    'X PREMIUM',
    'x-premium',
    'Verified blue checkmark, Grok AI access, 60% fewer ads, edit posts, and creator revenue sharing eligibility.',
    'Boost your personal brand, tech reach, and creator authority on X (formerly Twitter). Features the verified blue check, edit tweet capabilities, prioritized algorithm ranking in replies and search, and full Grok AI generation in your feed.',
    '66666666-6666-6666-6666-666666666666',
    25000, 20000, 'NGN', '3 Months', 'in_stock', 40, true, true, true,
    'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=800&q=80',
    'Instant Account Setup / Voucher'
),
(
    'a0000005-0000-0000-0000-000000000005',
    'SUPER GROK',
    'super-grok',
    'Next-level real-time intelligence with Grok 2 reasoning, uncensored Flux image generation, and real-time news.',
    'Experience real-time AI grounded on real-time global events. Features superior mathematical reasoning, code analysis, and ultra-high-resolution photorealistic image creation via Flux 1.0 engine without stringent safety filters.',
    '11111111-1111-1111-1111-111111111111',
    65000, 50000, 'NGN', '12 Months', 'limited', 20, true, true, true,
    'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=800&q=80',
    'Email & WhatsApp Instant Delivery'
),
(
    'a0000006-0000-0000-0000-000000000006',
    'CLAUDE PRO (Sonnet 3.5)',
    'claude-pro',
    '5x higher usage of Claude 3.5 Sonnet, dynamic Artifacts workspace, document & PDF synthesis, and Projects.',
    'The premier AI for software engineers, authors, and researchers. Sonnet 3.5 writes pristine full-stack code, refactors architectural patterns, and renders live interactive frontend prototypes directly in the browser via Artifacts.',
    '11111111-1111-1111-1111-111111111111',
    18000, 14000, 'NGN', '1 Month', 'in_stock', 60, true, true, true,
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    'Email & WhatsApp Instant Delivery'
),
(
    'a0000007-0000-0000-0000-000000000007',
    'CURSOR AI PRO',
    'cursor-ai-pro',
    'AI-native code editor based on VS Code. Unlimited Composer agent, multi-file edits, and instant codebase indexing.',
    'Build applications 10x faster. Features deep codebase knowledge, automatic multi-file refactoring, terminal command generation, and intelligent inline tab-completion powered by custom fine-tuned Claude and GPT-4o models.',
    '44444444-4444-4444-4444-444444444444',
    20000, 16000, 'NGN', '1 Month', 'in_stock', 55, true, true, true,
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'License Key & Setup Guide'
),
(
    'a0000008-0000-0000-0000-000000000008',
    'PERPLEXITY PRO AI',
    'perplexity-pro',
    'Unlimited Pro searches, academic citations, file analysis with Claude 3.5/GPT-4o, and $5/mo API credits.',
    'Replace search engines with an AI research partner. Get synthesized answers with direct inline source links, full PDF upload analysis, and specialized search focuses (Academic, YouTube, Reddit, Writing, Computational).',
    '55555555-5555-5555-5555-555555555555',
    24000, 18000, 'NGN', '1 Year', 'in_stock', 70, true, true, true,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'Direct Email Invite / Code'
)
ON CONFLICT (slug) DO NOTHING;

-- Product Features
INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
('a0000001-0000-0000-0000-000000000001', '2 Million Token Context Window (Analyze entire codebases or long video)', 1),
('a0000001-0000-0000-0000-000000000001', 'Imagen 3 High-Fidelity Photorealistic Image Generation', 2),
('a0000001-0000-0000-0000-000000000001', 'Python Code Interpreter & Document Synthesis', 3),
('a0000001-0000-0000-0000-000000000001', 'Integrated with Google Docs, Gmail & Drive', 4),

('a0000002-0000-0000-0000-000000000002', 'GPT-4o Omnimodal Reasoning with Image & Voice', 1),
('a0000002-0000-0000-0000-000000000002', 'Canvas Interactive Code & Writing Workspace', 2),
('a0000002-0000-0000-0000-000000000002', 'OpenAI o1 Reasoning Model for Complex STEM & Logic', 3),

('a0000003-0000-0000-0000-000000000003', '100+ Million Premium Stock Photos, Videos & Fonts', 1),
('a0000003-0000-0000-0000-000000000003', 'Magic Studio AI: 1-Click Background Eraser & Object Replacer', 2),
('a0000003-0000-0000-0000-000000000003', 'Brand Kits with Custom Color Palettes & SVG Export', 3),

('a0000007-0000-0000-0000-000000000007', 'Composer: Multi-file automated code editing agent', 1),
('a0000007-0000-0000-0000-000000000007', 'Instant Codebase Embeddings & Semantic Search', 2);

-- Discounts
INSERT INTO public.discounts (code, type, value, minimum_order_amount, usage_limit, is_active) VALUES
('SAMM10', 'percentage', 10, 5000, 1000, true),
('STUDENT20', 'percentage', 20, 10000, 500, true),
('WELCOME5', 'fixed', 1500, 8000, 1000, true)
ON CONFLICT (code) DO NOTHING;

-- FAQs
INSERT INTO public.faqs (question, answer, category, sort_order, is_active) VALUES
('What is SAMM AI?', 'SAMM AI is Africa leading digital AI tools and software subscription marketplace. We help students, creators, developers, freelancers, and businesses access premium global AI subscriptions easily, affordably, and securely without international bank card restrictions.', 'General', 1, true),
('How do I receive my subscription?', 'Upon successful payment verification through Paystack, your order is instantly registered. You receive your subscription access details via email and directly on WhatsApp within 5 to 30 minutes.', 'Delivery', 2, true),
('How long does delivery take?', 'Most digital access keys and invites are delivered within 5 to 15 minutes after payment verification.', 'Delivery', 3, true),
('Can I get support through WhatsApp?', 'Yes! We provide dedicated priority support on WhatsApp at 07036192301.', 'Support', 4, true)
ON CONFLICT DO NOTHING;

-- Site Settings
INSERT INTO public.site_settings (
    brand_name, tagline, whatsapp_number, support_email, currency,
    announcement_text, hero_title, hero_description
) VALUES (
    'SAMM AI',
    'Premium AI. Smarter Access.',
    '07036192301',
    'support@sammai.store',
    'NGN',
    '⚡ Instant WhatsApp & Email Delivery for all AI Subscriptions | Over 10,000+ Happy Customers',
    'Premium AI tools. Smarter access.',
    'Discover premium AI subscriptions and digital tools for learning, creating, building and growing — all in one trusted African marketplace.'
) ON CONFLICT DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products, categories, faqs, site settings
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read product features" ON public.product_features;
CREATE POLICY "Public read product features" ON public.product_features FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read discounts" ON public.discounts;
CREATE POLICY "Public read discounts" ON public.discounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select orders" ON public.orders;
CREATE POLICY "Public select orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert order items" ON public.order_items;
CREATE POLICY "Public insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select order items" ON public.order_items;
CREATE POLICY "Public select order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public select delivery records" ON public.delivery_records;
CREATE POLICY "Public select delivery records" ON public.delivery_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert delivery records" ON public.delivery_records;
CREATE POLICY "Public insert delivery records" ON public.delivery_records FOR INSERT WITH CHECK (true);

-- Allow full manage access for admin and development operations
DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" ON public.orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin manage delivery records" ON public.delivery_records;
CREATE POLICY "Admin manage delivery records" ON public.delivery_records FOR ALL USING (true);
