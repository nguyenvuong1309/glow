-- ============================================================
-- Feature 4: Location-based services
-- ============================================================
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS address text;

CREATE INDEX IF NOT EXISTS idx_services_location ON public.services (latitude, longitude);

-- ============================================================
-- Feature 5: Profile Enhancement
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text;

-- ============================================================
-- Feature 6: Promotion / Coupon system
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_purchase numeric DEFAULT 0,
  max_uses integer,
  current_uses integer DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  color text DEFAULT '#E07A94',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active promotions"
  ON public.promotions FOR SELECT
  USING (active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);

CREATE TABLE IF NOT EXISTS public.user_coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promotion_id uuid NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  claimed_at timestamptz DEFAULT now(),
  used_at timestamptz,
  booking_id uuid REFERENCES public.bookings(id),
  UNIQUE (user_id, promotion_id)
);

ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own coupons"
  ON public.user_coupons FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Feature 7: Booking Reschedule
-- ============================================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS original_date date,
  ADD COLUMN IF NOT EXISTS original_time_slot text,
  ADD COLUMN IF NOT EXISTS rescheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.user_coupons(id),
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- ============================================================
-- Feature 8: Availability Management - Blocked Dates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (service_id, blocked_date)
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service owners manage blocked dates"
  ON public.blocked_dates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = blocked_dates.service_id
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read blocked dates"
  ON public.blocked_dates FOR SELECT
  USING (true);

-- ============================================================
-- Feature 9: Advanced Search - Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_services_rating ON public.services (rating DESC);
CREATE INDEX IF NOT EXISTS idx_services_price ON public.services (price);
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON public.services USING gin (name gin_trgm_ops);
