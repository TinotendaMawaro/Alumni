-- =====================================================================
-- Alumni table
-- NOTE: columns are snake_case to match the live Supabase database
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.alumni (
  id text PRIMARY KEY,
  fullname text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  program text NOT NULL,
  year text NOT NULL,
  employment text DEFAULT 'N/A',
  location text DEFAULT 'N/A',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alumni_email ON public.alumni(email);
CREATE INDEX IF NOT EXISTS idx_alumni_year ON public.alumni(year);

ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert alumni" ON public.alumni;
DROP POLICY IF EXISTS "Public can view alumni" ON public.alumni;
DROP POLICY IF EXISTS "Admin can update alumni" ON public.alumni;
DROP POLICY IF EXISTS "Admin can delete alumni" ON public.alumni;

CREATE POLICY "Public can insert alumni" ON public.alumni FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view alumni" ON public.alumni FOR SELECT USING (true);
CREATE POLICY "Admin can update alumni" ON public.alumni FOR UPDATE USING (true);
CREATE POLICY "Admin can delete alumni" ON public.alumni FOR DELETE USING (true);

-- =====================================================================
-- Payment methods
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  description text DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON public.payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin can manage payment methods" ON public.payment_methods;

CREATE POLICY "Public can view active payment methods" ON public.payment_methods FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage payment methods" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- Payments
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id text PRIMARY KEY,
  alumni_id text,
  alumni_name text NOT NULL,
  alumni_email text NOT NULL,
  alumni_whatsapp text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  method_id text REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  method_name text NOT NULL,
  method_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reference text,
  transaction_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON public.payments(method_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON public.payments(transaction_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Public can select payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can manage payments" ON public.payments;

CREATE POLICY "Public can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can select payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Admin can manage payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- Seed active payment method: ClickNPay only
-- Run this ONCE on a fresh database.
-- =====================================================================
INSERT INTO public.payment_methods (id, name, type, description, config, is_active, sort_order)
VALUES
  ('default-clicknpay', 'ClickNPay Online', 'clicknpay', 'Pay securely online using ClickNPay. You will be redirected to complete your payment.',
   '{"currency":"USD","merchantName":"School of Hospitality and Tourism","instructions":"Click submit to be redirected to the ClickNPay secure payment page."}', true, 1)
ON CONFLICT (id) DO NOTHING;

-- Ensure legacy methods are hidden
UPDATE public.payment_methods
SET is_active = false
WHERE id IN ('default-paypal', 'default-bank-account', 'default-bank-transfer', 'default-ecocash', 'default-card');
