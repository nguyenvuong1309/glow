-- ============================================================
-- Subscription Management for Glow Marketplace
-- Provider subscription model: Free / Basic / Pro
-- ============================================================

-- Main subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revenuecat_customer_id text NOT NULL,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  period text CHECK (period IN ('monthly', 'yearly')),
  product_id text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'grace_period', 'billing_retry', 'cancelled', 'paused')),
  original_purchase_date timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  is_sandbox boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_subscriptions_rc_customer ON public.subscriptions (revenuecat_customer_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);

-- Subscription event log (audit trail)
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revenuecat_customer_id text NOT NULL,
  event_type text NOT NULL,
  product_id text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages events"
  ON public.subscription_events FOR ALL
  USING (auth.role() = 'service_role');

-- Add subscription_plan to profiles for fast denormalized reads
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free'
    CHECK (subscription_plan IN ('free', 'basic', 'pro'));

-- Helper function: get user's effective plan
CREATE OR REPLACE FUNCTION public.get_user_plan(target_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.subscriptions
     WHERE user_id = target_user_id
       AND status IN ('active', 'grace_period')
     LIMIT 1),
    'free'
  );
$$;

-- Service posting limit enforcement trigger
CREATE OR REPLACE FUNCTION public.check_service_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_plan text;
  service_count integer;
  max_services integer;
BEGIN
  current_plan := public.get_user_plan(NEW.user_id);

  SELECT COUNT(*) INTO service_count
  FROM public.services
  WHERE user_id = NEW.user_id;

  CASE current_plan
    WHEN 'free' THEN max_services := 2;
    WHEN 'basic' THEN max_services := 10;
    WHEN 'pro' THEN max_services := 999999;
    ELSE max_services := 2;
  END CASE;

  IF service_count >= max_services THEN
    RAISE EXCEPTION 'Service limit reached for % plan. Upgrade to post more services.', current_plan;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_service_limit
  BEFORE INSERT ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.check_service_limit();
