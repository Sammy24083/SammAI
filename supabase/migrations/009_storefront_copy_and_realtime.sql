-- Keep existing hosted data in step with the storefront copy and defaults.
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS paystack_public_key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS opay_account_number TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS opay_account_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS opay_bank_name TEXT;

UPDATE public.site_settings
SET tagline = 'Useful digital tools, made easier to access.',
    announcement_text = 'Browse digital subscriptions, compare plan details, and get help from our team when you need it.',
    hero_title = 'Useful tools for the work you do.',
    hero_description = 'Find subscriptions for work, study, and creative projects. Check each listing for its plan length, price, and delivery method.';

UPDATE public.categories
SET description = CASE slug
    WHEN 'ai-tools' THEN 'Subscriptions for writing, research, learning, and everyday AI assistance.'
    WHEN 'creative-tools' THEN 'Design and content tools for personal projects, teams, and small businesses.'
    WHEN 'video-media' THEN 'Tools for editing video, creating images, and working with digital media.'
    WHEN 'developer-tools' THEN 'Coding assistants and software that help with development work.'
    WHEN 'productivity' THEN 'Research, document, and productivity subscriptions.'
    WHEN 'deals' THEN 'Current offers on selected products.'
    ELSE description
END
WHERE slug IN ('ai-tools', 'creative-tools', 'video-media', 'developer-tools', 'productivity', 'deals');

UPDATE public.products
SET name = 'Google Gemini Pro',
    short_description = 'A Google AI subscription for asking questions, working with documents, and exploring ideas.',
    description = 'Use Gemini to brainstorm, draft and refine writing, ask questions about documents, and work through ideas. The plan listed here is for 18 months. Check the provider’s current plan details and the delivery method on this page before ordering; available features may change over time.'
WHERE slug = 'google-gemini-ai-pro';

UPDATE public.products
SET name = 'ChatGPT Plus',
    short_description = 'A personal ChatGPT subscription for writing, brainstorming, research, and everyday problem-solving.',
    description = 'ChatGPT Plus adds paid-plan features to ChatGPT. It can help draft and revise text, explore questions, work with supported files, and assist with creative or technical tasks. Feature access and usage limits are set by OpenAI and can change. Review the current plan details and the account setup method on this page before you order.'
WHERE slug = 'chatgpt-plus';

UPDATE public.products
SET name = 'CapCut Pro · 1 month',
    short_description = 'One month of CapCut Pro features for editing and polishing video projects.',
    description = 'CapCut Pro is a video-editing subscription with additional editing tools and effects. It may suit short-form creators, social media teams, or anyone editing video regularly. The available tools depend on CapCut’s current plan and your device. This listing covers one month of access.'
WHERE slug = 'capcut-pro-monthly';

UPDATE public.products
SET name = 'CapCut Pro · 1 year',
    short_description = 'A 12-month CapCut Pro plan for regular video editing.',
    description = 'Get a year of CapCut Pro access for ongoing video projects. The plan adds editing tools and effects to CapCut; exact features and device support are determined by CapCut and may change. Please check the listing’s delivery method before purchasing.'
WHERE slug = 'capcut-pro-yearly';

UPDATE public.products
SET name = 'Canva Pro',
    short_description = 'Design subscription with premium templates, media, and creative tools.',
    description = 'Canva Pro offers additional design features for creating presentations, social posts, and other visual content. This listing is for one year and is delivered by invitation to the email you provide. Available features are controlled by Canva and can change; check that the invitation method suits your account before ordering.'
WHERE slug = 'canva-pro';

UPDATE public.products
SET name = 'X Premium',
    short_description = 'A paid X plan with additional account features. Availability depends on your region and account.',
    description = 'X Premium is a subscription offered by X. Features, eligibility, and availability can vary by region and may change. Check the current X plan details and any account requirements before ordering. This listing covers the stated three-month term.'
WHERE slug = 'x-premium';

UPDATE public.products
SET name = 'SuperGrok',
    short_description = 'A paid Grok plan for AI chat and supported creative tasks.',
    description = 'SuperGrok is a subscription for Grok, xAI’s assistant. It may include higher usage or additional features compared with free access. The exact features and limits are set by xAI and may change, so check the current plan information before purchasing. This listing is for the stated 12-month term.'
WHERE slug = 'super-grok';

UPDATE public.products
SET name = 'Claude Pro',
    short_description = 'A Claude subscription for writing, research, and coding assistance.',
    description = 'Claude Pro is a paid plan for Anthropic’s AI assistant. It can help with writing, analysis, and coding tasks, with plan limits and included models set by Anthropic. Those details may change, so review the current plan information before ordering. This listing covers one month.'
WHERE slug = 'claude-pro';

UPDATE public.products
SET name = 'Cursor Pro',
    short_description = 'A coding-editor subscription with AI assistance for software projects.',
    description = 'Cursor is a code editor with AI features that can help explain code, suggest edits, and work across files. Available models, request limits, and editor features depend on Cursor’s current plan. Check the plan details and license delivery method before purchasing. This listing covers one month.'
WHERE slug = 'cursor-ai-pro';

UPDATE public.products
SET name = 'Perplexity Pro',
    short_description = 'A research-focused search subscription with AI-generated answers and sources.',
    description = 'Perplexity Pro adds paid-plan search and research features to Perplexity. The available models, search limits, and included extras are set by Perplexity and may change. Check the current plan details and email-invitation setup before ordering. This listing covers the stated one-year term.'
WHERE slug = 'perplexity-pro';

UPDATE public.products
SET name = 'Midjourney Pro',
    short_description = 'An image-generation subscription for creating and refining visual ideas.',
    description = 'Midjourney creates images from written prompts and offers tools for exploring and refining visual concepts. Plan limits and features are set by Midjourney and may change. Check the account or delivery method shown on this listing before purchasing. This listing covers one month.'
WHERE slug = 'midjourney-pro';

INSERT INTO public.products (
        name, slug, short_description, description, category_id,
        price, promo_price, currency, subscription_duration, stock_status,
        stock_quantity, is_featured, is_on_sale, is_active, image_url, delivery_method
)
SELECT
        'Runway Pro',
        'runway-pro',
        'Create AI video with 2,250 monthly credits, up to 15 parallel generations, and the features shown in this plan.',
        'Runway Pro is a monthly plan for creators working with AI video. The plan artwork lists 2,250 generation credits per month, up to 15 simultaneous generations, unlimited video upscaling with Topaz AI up to 4K, voice cloning, and 100 GB of cloud storage. Feature access is subject to Runway’s current plan terms and can change. Check the delivery method and account requirements with us before ordering.',
        categories.id,
        25000, 20000, 'NGN', '1 Month', 'in_stock',
        25, true, true, true, '/images/runway-pro.svg',
        'Email & WhatsApp delivery after payment confirmation'
FROM public.categories AS categories
WHERE categories.slug = 'video-media'
    AND NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'runway-pro');

INSERT INTO public.product_features (product_id, feature, sort_order)
SELECT products.id, features.feature, features.sort_order
FROM public.products AS products
CROSS JOIN (VALUES
        ('2,250 generation credits per month', 1),
        ('Up to 15 simultaneous generations', 2),
        ('Unlimited Topaz AI video upscaling up to 4K', 3),
        ('Voice cloning', 4),
        ('100 GB cloud storage', 5)
) AS features(feature, sort_order)
WHERE products.slug = 'runway-pro'
    AND NOT EXISTS (
            SELECT 1 FROM public.product_features
            WHERE product_id = products.id AND feature = features.feature
    );

UPDATE public.faqs
SET answer = CASE sort_order
    WHEN 1 THEN 'SAMM AI is a store for digital subscriptions and software tools. Each product page explains the plan length, price, and delivery method. If anything is unclear, contact us before ordering.'
    WHEN 2 THEN 'After payment is confirmed, we send the access details or setup instructions to the email address or WhatsApp number on your order. The delivery method depends on the product.'
    WHEN 3 THEN 'Many orders are prepared within 5–30 minutes after payment confirmation. Some products or busy periods can take longer. If you are waiting, message us with your order number.'
    WHEN 4 THEN 'The setup method varies by product. Check the product page for whether access is provided by invitation, code, or another method, and contact us if you need clarification before paying.'
    WHEN 5 THEN 'You will see an order confirmation and order number. For OPay transfers, the order remains pending until we confirm the funds. Include your order number if you contact us for an update.'
    WHEN 6 THEN 'Yes. Message 07036192301 and include your order number so we can help with setup or an order question.'
    WHEN 7 THEN 'OPay bank transfer is selected by default at checkout. Other methods may be available there as well. Transfer orders are confirmed manually, so a submitted receipt does not mean the payment has cleared.'
    WHEN 8 THEN 'Contact us with your order number and details of the issue. We will investigate and help troubleshoot or arrange a replacement or refund where the issue qualifies under our Refund & Replacement Policy.'
    ELSE answer
END
WHERE sort_order BETWEEN 1 AND 8;

ALTER TABLE public.orders
    ALTER COLUMN payment_provider SET DEFAULT 'OPay Transfer';

-- Enable PostgreSQL change events used for live refresh in open app sessions.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        FOREACH table_name IN ARRAY ARRAY[
            'products', 'categories', 'product_features', 'orders', 'order_items',
            'delivery_records', 'discounts', 'faqs', 'site_settings', 'audit_logs'
        ] LOOP
            IF to_regclass('public.' || table_name) IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1 FROM pg_publication_tables
                   WHERE pubname = 'supabase_realtime'
                     AND schemaname = 'public'
                     AND tablename = table_name
               ) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
            END IF;
        END LOOP;
    END IF;
END $$;