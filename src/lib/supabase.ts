import {mockCategories} from '@/mocks/categories';
import {mockServices} from '@/mocks/services';
import {mockBookings} from '@/mocks/bookings';
import type {Service, Category, Booking, BookingDraft} from '@/types';

// Supabase client placeholder — will be initialized with real credentials later
// import {createClient} from '@supabase/supabase-js';
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getServices(): Promise<Service[]> {
  return mockServices;
}

export async function getCategories(): Promise<Category[]> {
  return mockCategories;
}

export async function getBookings(): Promise<Booking[]> {
  return mockBookings;
}

export async function createBooking(draft: BookingDraft): Promise<Booking> {
  const booking: Booking = {
    id: `b${Date.now()}`,
    user_id: 'u1',
    ...draft,
    status: 'confirmed',
  };
  return booking;
}
