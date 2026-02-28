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
