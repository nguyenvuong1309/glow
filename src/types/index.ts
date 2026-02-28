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
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url: string;
  rating: number;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
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

export interface ServiceFilter {
  categories: string[];
  dateFrom: string | null;
  dateTo: string | null;
  timeFrom: string | null;
  timeTo: string | null;
}
