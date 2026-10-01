-- ====================================================================
-- SAMM AI DATABASE MIGRATION 008: Indexes for High Performance
-- ====================================================================

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON public.products (is_on_sale);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders (order_number);

-- Order items & delivery indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_records_order_id ON public.delivery_records (order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_records_customer_id ON public.delivery_records (customer_id);

-- Payment & reviews indexes
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments (reference);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts (code);
