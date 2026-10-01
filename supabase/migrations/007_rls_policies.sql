-- ====================================================================
-- SAMM AI DATABASE MIGRATION 007: Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Helper function to check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper function to check if current user is staff or admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL USING (public.is_admin());

-- ----------------------------------------------------
-- CATEGORIES POLICIES
-- ----------------------------------------------------
CREATE POLICY "Active categories are viewable by everyone"
ON public.categories FOR SELECT USING (is_active = true OR public.is_staff_or_admin());

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL USING (public.is_admin());

-- ----------------------------------------------------
-- PRODUCTS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Active products are viewable by everyone"
ON public.products FOR SELECT USING (is_active = true OR public.is_staff_or_admin());

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL USING (public.is_admin());

-- PRODUCT FEATURES & IMAGES
CREATE POLICY "Product features are viewable by everyone"
ON public.product_features FOR SELECT USING (true);

CREATE POLICY "Admins can manage product features"
ON public.product_features FOR ALL USING (public.is_admin());

CREATE POLICY "Product images are viewable by everyone"
ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images"
ON public.product_images FOR ALL USING (public.is_admin());

-- ----------------------------------------------------
-- ORDERS POLICIES
-- ----------------------------------------------------
-- Customers can read their own orders. Staff/Admin can view all orders.
CREATE POLICY "Customers view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = customer_id OR public.is_staff_or_admin());

-- Anyone can create an order (even guest checkout which sets customer_id if logged in)
CREATE POLICY "Customers create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Customers CANNOT update payment_status or totals. Only staff/admin or Edge Function (service role)
CREATE POLICY "Staff/Admins can update orders"
ON public.orders FOR UPDATE
USING (public.is_staff_or_admin());

-- ORDER ITEMS POLICIES
CREATE POLICY "Order items viewable by order owner or admin"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR public.is_staff_or_admin())
    )
);

CREATE POLICY "Order items insertable with order"
ON public.order_items FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------
-- DELIVERY RECORDS POLICIES (Strictly Protected)
-- ----------------------------------------------------
CREATE POLICY "Customers view own delivery records"
ON public.delivery_records FOR SELECT
USING (auth.uid() = customer_id OR public.is_staff_or_admin());

CREATE POLICY "Staff/Admins can manage delivery records"
ON public.delivery_records FOR ALL
USING (public.is_staff_or_admin());

-- ----------------------------------------------------
-- PAYMENTS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Customers view own payments"
ON public.payments FOR SELECT
USING (auth.uid() = customer_id OR public.is_staff_or_admin());

CREATE POLICY "Staff/Admins manage payments"
ON public.payments FOR ALL
USING (public.is_staff_or_admin());

-- ----------------------------------------------------
-- DISCOUNTS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Active discounts viewable by public"
ON public.discounts FOR SELECT USING (is_active = true OR public.is_staff_or_admin());

CREATE POLICY "Admins manage discounts"
ON public.discounts FOR ALL USING (public.is_admin());

-- ----------------------------------------------------
-- REVIEWS & FAQS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Published reviews are viewable by everyone"
ON public.reviews FOR SELECT USING (is_published = true OR public.is_staff_or_admin());

CREATE POLICY "Authenticated users can submit review"
ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage reviews"
ON public.reviews FOR ALL USING (public.is_admin());

CREATE POLICY "Active FAQs viewable by everyone"
ON public.faqs FOR SELECT USING (is_active = true OR public.is_staff_or_admin());

CREATE POLICY "Admins manage FAQs"
ON public.faqs FOR ALL USING (public.is_admin());

-- ----------------------------------------------------
-- SITE SETTINGS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Site settings are viewable by everyone"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR ALL USING (public.is_admin());
