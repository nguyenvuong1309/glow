import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import {mmkvStorage} from './storage';
import type {Service, Category, Booking, BookingDraft, ServiceFilter} from '@/types';

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

export async function getAvailableServices(
  filter: ServiceFilter,
): Promise<Service[]> {
  const {categories, dateFrom, dateTo, timeFrom, timeTo} = filter;

  // Collect day_of_week values from the date range
  const days: number[] = [];
  if (dateFrom) {
    const start = new Date(dateFrom + 'T00:00:00');
    const end = dateTo ? new Date(dateTo + 'T00:00:00') : start;
    const current = new Date(start);
    while (current <= end) {
      const dow = current.getDay();
      if (!days.includes(dow)) {
        days.push(dow);
      }
      current.setDate(current.getDate() + 1);
    }
  }

  let query = supabase
    .from('services')
    .select('*, categories(name), service_availability(*)');

  const {data, error} = await query;
  if (error) {
    throw error;
  }

  let results = data.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.categories.name,
    description: row.description,
    price: Number(row.price),
    duration_minutes: row.duration_minutes,
    image_url: row.image_url,
    rating: Number(row.rating),
    availability: row.service_availability,
  }));

  // Filter by categories
  if (categories.length > 0) {
    results = results.filter(s => categories.includes(s.category));
  }

  // Filter by day_of_week availability
  if (days.length > 0) {
    results = results.filter(s =>
      s.availability.some((a: any) => days.includes(a.day_of_week)),
    );
  }

  // Filter by time overlap
  if (timeFrom || timeTo) {
    results = results.filter(s =>
      s.availability.some((a: any) => {
        if (timeFrom && a.end_time <= timeFrom) {
          return false;
        }
        if (timeTo && a.start_time >= timeTo) {
          return false;
        }
        return true;
      }),
    );
  }

  // Strip availability from final result
  return results.map(({availability: _, ...rest}) => rest);
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
