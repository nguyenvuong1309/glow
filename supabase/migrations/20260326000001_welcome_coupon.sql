-- ============================================================
-- Welcome Coupon: WELCOME20 (20% off first booking)
-- ============================================================

-- 1. Insert the permanent WELCOME20 promotion
INSERT INTO public.promotions (
  code,
  title,
  description,
  discount_type,
  discount_value,
  min_purchase,
  max_uses,
  current_uses,
  start_date,
  end_date,
  color,
  active
) VALUES (
  'WELCOME20',
  'Welcome Gift',
  '20% off your first booking',
  'percentage',
  20,
  0,
  NULL,
  0,
  '2020-01-01',
  '2099-12-31',
  '#FF6F61',
  true
) ON CONFLICT (code) DO NOTHING;

-- 2. Trigger function: auto-create a user_coupon when a new profile is created
CREATE OR REPLACE FUNCTION public.grant_welcome_coupon()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  promo_id uuid;
BEGIN
  SELECT id INTO promo_id
  FROM public.promotions
  WHERE code = 'WELCOME20' AND active = true
  LIMIT 1;

  IF promo_id IS NOT NULL THEN
    INSERT INTO public.user_coupons (user_id, promotion_id)
    VALUES (NEW.id, promo_id)
    ON CONFLICT (user_id, promotion_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Create the trigger on profiles table
DROP TRIGGER IF EXISTS trg_grant_welcome_coupon ON public.profiles;
CREATE TRIGGER trg_grant_welcome_coupon
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_welcome_coupon();
