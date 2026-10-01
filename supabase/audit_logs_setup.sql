-- ====================================================================
-- AUDIT LOGS TABLE FOR SUPABASE (RUN IN SUPABASE SQL EDITOR)
-- ====================================================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,           -- 'create', 'update', 'delete', 'delivery', 'status_change'
    entity TEXT NOT NULL,           -- 'product', 'order', 'discount', 'settings', 'storage'
    entity_id TEXT,                 -- Target record ID or slug
    details TEXT NOT NULL,          -- Human-readable description
    metadata JSONB DEFAULT '{}'::jsonb, -- Raw payloads, status codes, errors
    performed_by TEXT DEFAULT 'Admin Operations' NOT NULL,
    status TEXT DEFAULT 'success' NOT NULL, -- 'success', 'failed', 'warning'
    synced_to_supabase BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast sorting and searching
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity);

-- 3. Row Level Security Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read audit logs" ON public.audit_logs;
CREATE POLICY "Allow read audit logs" ON public.audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete audit logs" ON public.audit_logs;
CREATE POLICY "Allow delete audit logs" ON public.audit_logs FOR DELETE USING (true);

-- 4. Initial Test Log Entry
INSERT INTO public.audit_logs (action, entity, details, performed_by, status, synced_to_supabase)
VALUES (
    'status_change',
    'settings',
    'Audit logging system initialized successfully in Supabase',
    'SAMM AI System',
    'success',
    true
) ON CONFLICT DO NOTHING;
