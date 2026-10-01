-- ====================================================================
-- SAMM AI SEED DATA
-- ====================================================================

-- Insert Default Site Settings
INSERT INTO public.site_settings (
    brand_name, tagline, whatsapp_number, support_email, currency,
    announcement_text, hero_title, hero_description
) VALUES (
    'SAMM AI',
    'Useful digital tools, made easier to access.',
    '07036192301',
    'support@sammai.store',
    'NGN',
    'Browse digital subscriptions, compare plan details, and get help from our team when you need it.',
    'Useful tools for the work you do.',
    'Find subscriptions for work, study, and creative projects. Check each listing for its plan length, price, and delivery method.'
) ON CONFLICT DO NOTHING;

-- Insert Categories
INSERT INTO public.categories (id, name, slug, description, icon, is_active, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'AI Tools', 'ai-tools', 'Subscriptions for writing, research, learning, and everyday AI assistance.', 'bot', true, 1),
('22222222-2222-2222-2222-222222222222', 'Creative Tools', 'creative-tools', 'Design and content tools for personal projects, teams, and small businesses.', 'palette', true, 2),
('33333333-3333-3333-3333-333333333333', 'Video & Media', 'video-media', 'Tools for editing video, creating images, and working with digital media.', 'video', true, 3),
('44444444-4444-4444-4444-444444444444', 'Developer Tools', 'developer-tools', 'Coding assistants and software that help with development work.', 'code', true, 4),
('55555555-5555-5555-5555-555555555555', 'Productivity', 'productivity', 'Research, document, and productivity subscriptions.', 'book-open', true, 5),
('66666666-6666-6666-6666-666666666666', 'Deals', 'deals', 'Current offers on selected products.', 'flame', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert Products
INSERT INTO public.products (
    id, name, slug, short_description, description, category_id,
    price, promo_price, currency, subscription_duration, stock_status,
    stock_quantity, is_featured, is_on_sale, is_active, image_url, delivery_method
) VALUES
(
    'a0000001-0000-0000-0000-000000000001',
    'Google Gemini AI Pro',
    'google-gemini-ai-pro',
    'Google Gemini Advanced multimodal AI with 2M token context, Imagen 3, and deep Workspace integration.',
    'Access Google''s most capable frontier AI model with an expansive 2 million token context window. Perfect for analyzing full books, complex code repositories, hours of audio, and detailed video files. Includes advanced Imagen 3 image generation, document synthesis, and Python code execution in a dedicated private environment.',
    '11111111-1111-1111-1111-111111111111',
    15000, 12000, 'NGN', '18 Months', 'in_stock', 150, true, true, true,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'Email & WhatsApp Instant Delivery'
),
(
    'a0000002-0000-0000-0000-000000000002',
    'ChatGPT Plus (GPT-4o & Canvas)',
    'chatgpt-plus',
    'Full access to GPT-4o, OpenAI o1 reasoning model, DALL·E 3, custom GPTs, and real-time voice.',
    'Supercharge your daily workflow with OpenAI''s flagship subscription. Enjoy unrestricted access to GPT-4o, high-accuracy reasoning with o1, canvas interactive coding & writing, memory persistence, web browsing with live citations, and custom GPT creators.',
    '11111111-1111-1111-1111-111111111111',
    16000, 13000, 'NGN', '1 Month', 'in_stock', 85, true, true, true,
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    'Email & WhatsApp Instant Delivery'
),
(
    'a0000003-0000-0000-0000-000000000003',
    'Canva Pro Education / Team',
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
    'X Premium (Twitter Blue)',
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
    'Super Grok (xAI Grok 2 & Imagine)',
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
    'Claude Pro (Sonnet 3.5 & Artifacts)',
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
    'Cursor AI Pro (AI Code Editor)',
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
    'Perplexity Pro AI Research',
    'perplexity-pro',
    'Unlimited Pro searches, academic citations, file analysis with Claude 3.5/GPT-4o, and $5/mo API credits.',
    'Replace search engines with an AI research partner. Get synthesized answers with direct inline source links, full PDF upload analysis, and specialized search focuses (Academic, YouTube, Reddit, Writing, Computational).',
    '55555555-5555-5555-5555-555555555555',
    24000, 18000, 'NGN', '1 Year', 'in_stock', 70, true, true, true,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'Direct Email Invite / Code'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Product Features
INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
('a0000001-0000-0000-0000-000000000001', '2 Million Token Context Window (Analyze entire codebases or long video)', 1),
('a0000001-0000-0000-0000-000000000001', 'Imagen 3 High-Fidelity Photorealistic Image Generation', 2),
('a0000001-0000-0000-0000-000000000001', 'Python Code Interpreter & Document Synthesis', 3),
('a0000001-0000-0000-0000-000000000001', 'Integrated with Google Docs, Gmail & Drive', 4),

('a0000002-0000-0000-0000-000000000002', 'GPT-4o Omnimodal Reasoning with Image & Voice', 1),
('a0000002-0000-0000-0000-000000000002', 'Canvas Interactive Code & Writing Workspace', 2),
('a0000002-0000-0000-0000-000000000002', 'OpenAI o1 Reasoning Model for Complex STEM & Logic', 3),
('a0000002-0000-0000-0000-000000000002', 'Access to Thousands of Custom GPTs & Web Browsing', 4),

('a0000003-0000-0000-0000-000000000003', '100+ Million Premium Stock Photos, Videos & Fonts', 1),
('a0000003-0000-0000-0000-000000000003', 'Magic Studio AI: 1-Click Background Eraser & Object Replacer', 2),
('a0000003-0000-0000-0000-000000000003', 'Brand Kits with Custom Color Palettes & SVG Export', 3),
('a0000003-0000-0000-0000-000000000003', 'Full 365 Days Duration with Guaranteed Uptime', 4),

('a0000007-0000-0000-0000-000000000007', 'Composer: Multi-file automated code editing agent', 1),
('a0000007-0000-0000-0000-000000000007', 'Instant Codebase Embeddings & Semantic Search', 2),
('a0000007-0000-0000-0000-000000000007', 'Predictive Next-Line Copilot Autocomplete', 3),
('a0000007-0000-0000-0000-000000000007', 'Direct terminal command debugging & fix suggestions', 4);

-- Insert Discounts
INSERT INTO public.discounts (code, type, value, minimum_order_amount, usage_limit, is_active) VALUES
('SAMM10', 'percentage', 10, 5000, 1000, true),
('STUDENT20', 'percentage', 20, 10000, 500, true),
('WELCOME5', 'fixed', 1500, 8000, 1000, true)
ON CONFLICT (code) DO NOTHING;

-- Insert FAQs
INSERT INTO public.faqs (question, answer, category, sort_order, is_active) VALUES
('What is SAMM AI?', 'SAMM AI is a store for digital subscriptions and software tools. Each product page explains the plan length, price, and delivery method. If anything is unclear, contact us before ordering.', 'General', 1, true),
('How do I receive my subscription?', 'After payment is confirmed, we send the access details or setup instructions to the email address or WhatsApp number on your order. The delivery method depends on the product.', 'Delivery', 2, true),
('How long does delivery take?', 'Many orders are prepared within 5–30 minutes after payment confirmation. Some products or busy periods can take longer. If you are waiting, message us with your order number.', 'Delivery', 3, true),
('Are these personal or shared subscriptions?', 'The setup method varies by product. Check the product page for whether access is provided by invitation, code, or another method, and contact us if you need clarification before paying.', 'Subscriptions', 4, true),
('What happens after payment?', 'You will see an order confirmation and order number. For OPay transfers, the order remains pending until we confirm the funds. Include your order number if you contact us for an update.', 'Orders', 5, true),
('Can I get support through WhatsApp?', 'Yes. Message 07036192301 and include your order number so we can help with setup or an order question.', 'Support', 6, true),
('What payment methods are available?', 'OPay bank transfer is selected by default at checkout. Other methods may be available there as well. Transfer orders are confirmed manually, so a submitted receipt does not mean the payment has cleared.', 'Payment', 7, true),
('What happens if I have a problem with my order?', 'Contact us with your order number and details of the issue. We will investigate and help troubleshoot or arrange a replacement or refund where the issue qualifies under our Refund & Replacement Policy.', 'Support', 8, true);
