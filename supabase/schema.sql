-- Alumni table
CREATE TABLE IF NOT EXISTS public.alumni (
  id text PRIMARY KEY,
  fullName text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  program text NOT NULL,
  year text NOT NULL,
  employment text DEFAULT 'N/A',
  location text DEFAULT 'N/A',
  termsAccepted boolean NOT NULL DEFAULT false,
  createdAt text NOT NULL DEFAULT '',
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

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  description text DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  isActive boolean NOT NULL DEFAULT true,
  sortOrder integer NOT NULL DEFAULT 0,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id text PRIMARY KEY,
  alumniId text,
  alumniName text NOT NULL,
  alumniEmail text NOT NULL,
  alumniWhatsapp text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  methodId text REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  methodName text NOT NULL,
  methodType text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reference text,
  transactionId text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON public.payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(isActive);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON public.payments(methodId);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payment_methods
DROP POLICY IF EXISTS "Public can view active payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin can view all payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin can insert payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin can update payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin can delete payment methods" ON public.payment_methods;

CREATE POLICY "Public can view active payment methods" ON public.payment_methods FOR SELECT USING (isActive = true);
CREATE POLICY "Admin can view all payment methods" ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY "Admin can insert payment methods" ON public.payment_methods FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update payment methods" ON public.payment_methods FOR UPDATE USING (true);
CREATE POLICY "Admin can delete payment methods" ON public.payment_methods FOR DELETE USING (true);

-- Policies for payments
DROP POLICY IF EXISTS "Public can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can view payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can delete payments" ON public.payments;

CREATE POLICY "Public can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Admin can update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Admin can delete payments" ON public.payments FOR DELETE USING (true);

-- Seed default payment methods
INSERT INTO public.payment_methods (id, name, type, description, config, isActive, sortOrder)
VALUES
  ('default-bank-account', 'CBZ Bank Account Deposit', 'bank_account', 'Deposit directly into our CBZ bank account.', '{"bankName":"CBZ Bank","accountName":"School of Hospitality and Tourism","accountNumber":"1234567890","branch":"Harare Main Branch","swiftCode":"CBZ ZWHARX","currency":"USD"}', true, 1),
  ('default-bank-transfer', 'Direct Bank Transfer', 'bank_transfer', 'Transfer funds directly to our primary account.', '{"bankName":"CBZ Bank","accountName":"School of Hospitality and Tourism","accountNumber":"1234567890","branch":"Harare Main Branch","swiftCode":"CBZ ZWHARX","referenceInstructions":"Use your full name as reference.","currency":"USD"}', true, 2),
  ('default-ecocash', 'EcoCash Mobile Money', 'ecocash', 'Pay using EcoCash mobile money.', '{"merchantName":"School of Hospitality and Tourism","merchantCode":"123456","shortcode":"*151#","currency":"USD"}', true, 3),
  ('default-card', 'Visa / Mastercard', 'card', 'Secure card payment via supported gateway.', '{"gateway":"Stripe / Paystack","currency":"USD","testMode":true,"instructions":"Card details are processed securely by the payment gateway and are not stored on this portal."}', true, 4),
  ('default-paypal', 'PayPal', 'paypal', 'Pay securely with PayPal.', '{"paypalEmail":"payments@schoolofhospitality.edu","currency":"USD","instructions":"Send payment to the PayPal email above and enter the transaction ID as your reference."}', true, 5)
ON CONFLICT (id) DO NOTHING;
