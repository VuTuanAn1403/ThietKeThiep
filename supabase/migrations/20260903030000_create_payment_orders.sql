-- ============================================================
-- NHÀ CÓ TIỆC: PAYMENT ORDERS MIGRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subscription_plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
    order_code TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    final_amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'VND',
    payment_method TEXT NOT NULL DEFAULT 'QR_TRANSFER',
    status TEXT NOT NULL DEFAULT 'PENDING',
    transfer_content TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    qr_code_url TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid lookup
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_code ON public.payment_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON public.payment_orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment orders"
    ON public.payment_orders FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view and manage all payment orders"
    ON public.payment_orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()::text AND users.role = 'ADMIN'
        )
    );
