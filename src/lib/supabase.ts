import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import {mmkvStorage} from './storage';
import {SUPABASE_URL, SUPABASE_ANON_KEY} from '@env';
import type {Service, Category, Booking, BookingDraft, ServiceDraft, ServiceFilter, ServiceAvailability} from '@/types';

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

export async function uploadServiceMedia(
  uri: string,
  fileName: string,
  contentType: string,
): Promise<string> {
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/${Date.now()}_${fileName}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const {error} = await supabase.storage
    .from('service-media')
    .upload(path, arrayBuffer, {contentType, upsert: false});
  if (error) throw error;

  const {data} = supabase.storage.from('service-media').getPublicUrl(path);
  return data.publicUrl;
}

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

export async function getServiceAvailability(
  serviceId: string,
): Promise<ServiceAvailability[]> {
  const {data, error} = await supabase
    .from('service_availability')
    .select('*')
    .eq('service_id', serviceId);
  if (error) throw error;
  return data;
}

export async function getBookedSlots(
  serviceId: string,
  date: string,
): Promise<string[]> {
  const {data, error} = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('service_id', serviceId)
    .eq('date', date)
    .neq('status', 'cancelled');
  if (error) throw error;
  return data.map((row: {time_slot: string}) => row.time_slot);
}

export async function getBookings(): Promise<Booking[]> {
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const {data, error} = await supabase
    .from('bookings')
    .select('*, services(name)')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    service_id: row.service_id,
    service_name: row.services?.name,
    date: row.date,
    time_slot: row.time_slot,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
  }));
}

export async function getProviderBookings(): Promise<Booking[]> {
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const {data, error} = await supabase
    .from('bookings')
    .select('*, services!inner(name, user_id)')
    .eq('services.user_id', user.id)
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    service_id: row.service_id,
    service_name: row.services?.name,
    date: row.date,
    time_slot: row.time_slot,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
  }));
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
): Promise<void> {
  const {error} = await supabase
    .from('bookings')
    .update({status})
    .eq('id', bookingId);
  if (error) throw error;
}

export async function getMyServices(): Promise<Service[]> {
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const {data, error} = await supabase
    .from('services')
    .select('*, categories(name)')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.categories.name,
    category_id: row.category_id,
    description: row.description,
    price: Number(row.price),
    duration_minutes: row.duration_minutes,
    image_url: row.image_url,
    rating: Number(row.rating),
  }));
}

export async function updateService(
  id: string,
  draft: Partial<ServiceDraft>,
): Promise<void> {
  const {error} = await supabase
    .from('services')
    .update(draft)
    .eq('id', id);
  if (error) throw error;
}

export async function createService(draft: ServiceDraft): Promise<Service> {
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const {data, error} = await supabase
    .from('services')
    .insert({...draft, user_id: user.id, rating: 0})
    .select('*, categories(name)')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    category: data.categories.name,
    description: data.description,
    price: Number(data.price),
    duration_minutes: data.duration_minutes,
    image_url: data.image_url,
    rating: Number(data.rating),
  };
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
