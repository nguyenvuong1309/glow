export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image_url?: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  services: Service[];
  averageRating: number;
  totalBookings: number;
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
}

export interface ServiceDraft {
  name: string;
  category_id: string;
  description: string;
  price: number;
  duration_minutes: number;
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
}

export interface BookingDraft {
  service_id: string;
  date: string;
  time_slot: string;
  notes?: string;
}

export interface ServiceAvailability {
  id: string;
  service_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
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
}
