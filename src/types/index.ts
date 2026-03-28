export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  address?: string;
  subscription_plan?: 'free' | 'basic' | 'pro';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image_url?: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  services: Service[];
  averageRating: number;
  totalBookings: number;
  subscription_plan?: 'free' | 'basic' | 'pro';
}

export interface Service {
  id: string;
  name: string;
  category: string;
  category_id?: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_urls: string[];
  rating: number;
  provider_id?: string;
  provider_name?: string;
  provider_avatar?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  distance?: number;
  booking_count?: number;
}

export interface ServiceDraft {
  name: string;
  category_id: string;
  description: string;
  price: number;
  duration_minutes: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface MediaFile {
  uri: string;
  fileName: string;
  type: string;
}

export interface SubmitServicePayload {
  name: string;
  category_id: string;
  description: string;
  price: number;
  duration_minutes: number;
  localMedia: MediaFile[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  service_name?: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
  original_date?: string;
  original_time_slot?: string;
  rescheduled_at?: string;
  discount_amount?: number;
}

export interface BookingDraft {
  service_id: string;
  date: string;
  time_slot: string;
  notes?: string;
  coupon_id?: string;
  discount_amount?: number;
}

export interface ServiceAvailability {
  id: string;
  service_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface BlockedDate {
  id: string;
  service_id: string;
  blocked_date: string;
  reason?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  service_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface ReviewDraft {
  booking_id: string;
  service_id: string;
  rating: number;
  comment?: string;
}

export interface ServiceFilter {
  searchQuery: string;
  categories: string[];
  dateFrom: string | null;
  dateTo: string | null;
  timeFrom: string | null;
  timeTo: string | null;
  priceMin: number | null;
  priceMax: number | null;
  minRating: number | null;
  maxDistance: number | null;
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'rating' | 'distance' | 'newest';
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses?: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  color: string;
  active: boolean;
}

export interface UserCoupon {
  id: string;
  user_id: string;
  promotion_id: string;
  claimed_at: string;
  used_at?: string;
  booking_id?: string;
  promotion?: Promotion;
}

export interface NotificationPayload {
  booking_id?: string;
  screen?: string;
  event_type?: 'created' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  bio?: string;
  address?: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}
