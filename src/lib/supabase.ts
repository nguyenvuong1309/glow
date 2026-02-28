import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import {mmkvStorage} from './storage';
import type {Service, Category, Booking, BookingDraft} from '@/types';

const SUPABASE_URL = 'https://bdavvqgseigqmxerdytn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYXZ2cWdzZWlncW14ZXJkeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjI1ODYsImV4cCI6MjA4NzgzODU4Nn0.I10osCW3J30x42Tx7RKuvNaJUn9OLwLesKzcODB8XiU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: mmkvStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {eventsPerSecond: 1},
  },
});

export async function getCategories(): Promise<Category[]> {
  const {data, error} = await supabase.from('categories').select('*');
  if (error) throw error;
  return data;
}

export async function getServices(): Promise<Service[]> {
  const {data, error} = await supabase
    .from('services')
    .select('*, categories(name)');
  if (error) throw error;
  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.categories.name,
    description: row.description,
    price: Number(row.price),
    duration_minutes: row.duration_minutes,
    image_url: row.image_url,
    rating: Number(row.rating),
  }));
}

export async function getBookings(): Promise<Booking[]> {
  const {data, error} = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data;
}

export async function createBooking(draft: BookingDraft): Promise<Booking> {
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const {data, error} = await supabase
    .from('bookings')
    .insert({...draft, user_id: user.id})
    .select()
    .single();
  if (error) throw error;
  return data;
}
