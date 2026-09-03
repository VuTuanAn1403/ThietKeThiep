-- ==============================================================================
-- MIGRATION: 20260903010000_upgrade_schema.sql
-- DESCRIPTION: Thêm bảng Gifts, Signatures, Feedback, Subscription Plans
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE feedback_type AS ENUM ('BUG', 'FEATURE', 'UI_UX', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feedback_status AS ENUM ('NEW', 'REVIEWING', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('FREE', 'BASIC', 'PREMIUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLE: gifts (Cấu hình thông tin nhận quà / chuyển khoản)
CREATE TABLE IF NOT EXISTS public.gifts (
    id TEXT PRIMARY KEY,
    invitation_id TEXT NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Quà mừng chúc phúc',
    description TEXT,
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    qr_image_url TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: signatures (Chữ ký số & lưu bút khách mời)
CREATE TABLE IF NOT EXISTS public.signatures (
    id TEXT PRIMARY KEY,
    invitation_id TEXT NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    guest_id TEXT REFERENCES public.guests(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    message TEXT NOT NULL,
    signature_image_url TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLE: feedback (Góp ý & đánh giá từ người dùng)
CREATE TABLE IF NOT EXISTS public.feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type feedback_type NOT NULL DEFAULT 'OTHER',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    status feedback_status NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLE: subscription_plans (Gói dịch vụ)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    tier subscription_tier NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price_vnd NUMERIC(12, 0) NOT NULL DEFAULT 0,
    max_invitations INTEGER NOT NULL DEFAULT 1,
    max_images_per_invitation INTEGER NOT NULL DEFAULT 10,
    max_views_per_invitation INTEGER NOT NULL DEFAULT 300,
    allow_custom_qr BOOLEAN NOT NULL DEFAULT false,
    allow_custom_music BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLE: user_subscriptions (Quản lý gói của người dùng)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_gifts_invitation_id ON public.gifts(invitation_id);
CREATE INDEX IF NOT EXISTS idx_signatures_invitation_id ON public.signatures(invitation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Gifts RLS: Public read if visible, Owner full control
CREATE POLICY "Public read visible gifts" ON public.gifts FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Owner manage gifts" ON public.gifts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.invitations WHERE invitations.id = gifts.invitation_id AND invitations.user_id = auth.uid()));

-- Signatures RLS: Public read visible signatures, Any can insert, Owner full control
CREATE POLICY "Public read visible signatures" ON public.signatures FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Anyone insert signatures" ON public.signatures FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Owner manage signatures" ON public.signatures FOR ALL
    USING (EXISTS (SELECT 1 FROM public.invitations WHERE invitations.id = signatures.invitation_id AND invitations.user_id = auth.uid()));

-- Feedback RLS: Owner read/insert, Admin full control
CREATE POLICY "User manage own feedback" ON public.feedback FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Admin view all feedback" ON public.feedback FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN'));

-- Subscription Plans RLS: Public read
CREATE POLICY "Public read subscription plans" ON public.subscription_plans FOR SELECT
    USING (true);

-- User Subscriptions RLS: Owner read, Admin manage
CREATE POLICY "User read own subscription" ON public.user_subscriptions FOR SELECT
    USING (user_id = auth.uid());
