-- Create a function to get booking counts per service for the last 7 days
CREATE OR REPLACE FUNCTION get_service_booking_count(service_uuid uuid)
RETURNS bigint AS $$
  SELECT COALESCE(count(*), 0)
  FROM bookings
  WHERE service_id = service_uuid
    AND created_at >= now() - interval '7 days'
    AND status NOT IN ('cancelled');
$$ LANGUAGE sql STABLE;
