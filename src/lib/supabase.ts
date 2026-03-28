import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { mmkvStorage } from './storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import type {
  Service,
  Category,
  Booking,
  BookingDraft,
  ServiceDraft,
  ServiceFilter,
  ServiceAvailability,
  Review,
  ReviewDraft,
  ProviderProfile,
  Promotion,
  UserCoupon,
  BlockedDate,
  ProfileUpdatePayload,
  LocationCoords,
} from '@/types';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: mmkvStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: { eventsPerSecond: 1 },
  },
});

// ============================================================
// Media
// ============================================================

export async function uploadServiceMedia(
  uri: string,
  fileName: string,
  contentType: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/${Date.now()}_${fileName}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from('service-media')
    .upload(path, arrayBuffer, { contentType, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('service-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteServiceMedia(publicUrls: string[]): Promise<void> {
  if (publicUrls.length === 0) return;

  const bucketBase = supabase.storage.from('service-media').getPublicUrl('')
    .data.publicUrl;
  const paths = publicUrls.map(url => url.replace(bucketBase, ''));

  const { error } = await supabase.storage.from('service-media').remove(paths);
  if (error) throw error;
}

export async function uploadAvatar(
  uri: string,
  fileName: string,
  contentType: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/avatar_${Date.now()}_${fileName}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

// ============================================================
// Categories
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data;
}

// ============================================================
// Services
// ============================================================

const SERVICE_SELECT =
  '*, categories(name), service_images(url, sort_order), profiles!user_id(id, name, avatar_url)';

function mapServiceRow(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.categories.name,
    description: row.description,
    price: Number(row.price),
    duration_minutes: row.duration_minutes,
    image_urls: (row.service_images || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => img.url),
    rating: Number(row.rating),
    provider_id: row.profiles?.id ?? row.user_id,
    provider_name: row.profiles?.name,
    provider_avatar: row.profiles?.avatar_url,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
  };
}

function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getServices(
  userLocation?: LocationCoords,
): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT);
  if (error) throw error;
  let services = data.map(mapServiceRow);
  if (userLocation) {
    services = services.map(s => ({
      ...s,
      distance:
        s.latitude && s.longitude
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              s.latitude,
              s.longitude,
            )
          : undefined,
    }));
  }
  return services;
}

export async function getAvailableServices(
  filter: ServiceFilter,
  userLocation?: LocationCoords,
): Promise<Service[]> {
  const { searchQuery, categories, dateFrom, dateTo, timeFrom, timeTo, priceMin, priceMax, minRating } = filter;

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
    .select(
      '*, categories(name), service_availability(*), service_images(url, sort_order), profiles!user_id(id, name, avatar_url)',
    );

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`);
  }
  if (priceMin !== null && priceMin !== undefined) {
    query = query.gte('price', priceMin);
  }
  if (priceMax !== null && priceMax !== undefined) {
    query = query.lte('price', priceMax);
  }
  if (minRating !== null && minRating !== undefined) {
    query = query.gte('rating', minRating);
  }

  const { data, error } = await query;
  if (error) throw error;

  let results = data.map((row: any) => ({
    ...mapServiceRow(row),
    availability: row.service_availability,
  }));

  if (categories.length > 0) {
    results = results.filter(s => categories.includes(s.category));
  }

  if (days.length > 0) {
    results = results.filter(s =>
      s.availability.some((a: any) => days.includes(a.day_of_week)),
    );
  }

  if (timeFrom || timeTo) {
    results = results.filter(s =>
      s.availability.some((a: any) => {
        if (timeFrom && a.end_time <= timeFrom) return false;
        if (timeTo && a.start_time >= timeTo) return false;
        return true;
      }),
    );
  }

  // Calculate distance
  if (userLocation) {
    results = results.map(s => ({
      ...s,
      distance:
        s.latitude && s.longitude
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              s.latitude,
              s.longitude,
            )
          : undefined,
    }));

    if (filter.maxDistance !== null && filter.maxDistance !== undefined) {
      results = results.filter(
        s => s.distance !== undefined && s.distance <= filter.maxDistance!,
      );
    }
  }

  // Sort
  switch (filter.sortBy) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'distance':
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      break;
    case 'newest':
      break;
    default:
      break;
  }

  return results.map(({ availability: _, ...rest }) => rest);
}

// ============================================================
// Service Booking Counts (Social Proof)
// ============================================================

export async function fetchServiceBookingCounts(
  serviceIds: string[],
): Promise<Record<string, number>> {
  if (serviceIds.length === 0) return {};

  const results: Record<string, number> = {};
  const promises = serviceIds.map(async (id) => {
    const { data, error } = await supabase.rpc('get_service_booking_count', {
      service_uuid: id,
    });
    if (!error && data !== null) {
      results[id] = Number(data);
    }
  });

  await Promise.all(promises);
  return results;
}

// ============================================================
// Availability
// ============================================================

export async function getServiceAvailability(
  serviceId: string,
): Promise<ServiceAvailability[]> {
  const { data, error } = await supabase
    .from('service_availability')
    .select('*')
    .eq('service_id', serviceId);
  if (error) throw error;
  return data;
}

export async function upsertAvailability(
  serviceId: string,
  slots: Omit<ServiceAvailability, 'id'>[],
): Promise<ServiceAvailability[]> {
  // Delete existing and insert new
  const { error: delError } = await supabase
    .from('service_availability')
    .delete()
    .eq('service_id', serviceId);
  if (delError) throw delError;

  if (slots.length === 0) return [];

  const rows = slots.map(s => ({
    service_id: serviceId,
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
  }));

  const { data, error } = await supabase
    .from('service_availability')
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

export async function getBlockedDates(
  serviceId: string,
): Promise<BlockedDate[]> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('service_id', serviceId)
    .gte('blocked_date', new Date().toISOString().split('T')[0])
    .order('blocked_date');
  if (error) throw error;
  return data;
}

export async function addBlockedDate(
  serviceId: string,
  blockedDate: string,
  reason?: string,
): Promise<BlockedDate> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert({ service_id: serviceId, blocked_date: blockedDate, reason })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeBlockedDate(id: string): Promise<void> {
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Bookings
// ============================================================

export async function getBookedSlots(
  serviceId: string,
  date: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('service_id', serviceId)
    .eq('date', date)
    .neq('status', 'cancelled');
  if (error) throw error;
  return data.map((row: { time_slot: string }) => row.time_slot);
}

function mapBookingRow(row: any): Booking {
  return {
    id: row.id,
    user_id: row.user_id,
    service_id: row.service_id,
    service_name: row.services?.name,
    date: row.date,
    time_slot: row.time_slot,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    original_date: row.original_date,
    original_time_slot: row.original_time_slot,
    rescheduled_at: row.rescheduled_at,
    discount_amount: row.discount_amount ? Number(row.discount_amount) : undefined,
  };
}

export async function getBookings(): Promise<Booking[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapBookingRow);
}

export async function getProviderBookings(): Promise<Booking[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .select('*, services!inner(name, user_id)')
    .eq('services.user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapBookingRow);
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
  if (error) throw error;
}

export async function createBooking(draft: BookingDraft): Promise<Booking> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: service, error: svcError } = await supabase
    .from('services')
    .select('user_id')
    .eq('id', draft.service_id)
    .single();
  if (svcError) throw svcError;
  if (service.user_id === user.id) {
    throw new Error('Cannot book your own service');
  }

  const insertData: any = {
    service_id: draft.service_id,
    user_id: user.id,
    date: draft.date,
    time_slot: draft.time_slot,
    notes: draft.notes,
  };
  if (draft.coupon_id) {
    insertData.coupon_id = draft.coupon_id;
    insertData.discount_amount = draft.discount_amount ?? 0;
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;

  // Mark coupon as used
  if (draft.coupon_id) {
    await supabase
      .from('user_coupons')
      .update({ used_at: new Date().toISOString(), booking_id: data.id })
      .eq('id', draft.coupon_id);
  }

  return data;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function completeBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', bookingId);
  if (error) throw error;
}

export async function rescheduleBooking(
  bookingId: string,
  newDate: string,
  newTimeSlot: string,
): Promise<void> {
  // First get the current booking to save original values
  const { data: current, error: getErr } = await supabase
    .from('bookings')
    .select('date, time_slot, original_date, original_time_slot')
    .eq('id', bookingId)
    .single();
  if (getErr) throw getErr;

  const updateData: any = {
    date: newDate,
    time_slot: newTimeSlot,
    rescheduled_at: new Date().toISOString(),
    status: 'pending',
  };

  // Only save original values on first reschedule
  if (!current.original_date) {
    updateData.original_date = current.date;
    updateData.original_time_slot = current.time_slot;
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId);
  if (error) throw error;
}

// ============================================================
// Services CRUD
// ============================================================

export async function getMyServices(): Promise<Service[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((row: any) => ({
    ...mapServiceRow(row),
    category_id: row.category_id,
  }));
}

export async function updateService(
  id: string,
  draft: Partial<ServiceDraft>,
  imageUrls?: string[],
): Promise<void> {
  const { error } = await supabase.from('services').update(draft).eq('id', id);
  if (error) throw error;

  if (imageUrls) {
    const { error: delError } = await supabase
      .from('service_images')
      .delete()
      .eq('service_id', id);
    if (delError) throw delError;

    if (imageUrls.length > 0) {
      const rows = imageUrls.map((url, i) => ({
        service_id: id,
        url,
        sort_order: i,
      }));
      const { error: insError } = await supabase
        .from('service_images')
        .insert(rows);
      if (insError) throw insError;
    }
  }
}

export async function createService(
  draft: ServiceDraft,
  imageUrls: string[],
): Promise<Service> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('services')
    .insert({ ...draft, user_id: user.id, rating: 0 })
    .select('*, categories(name)')
    .single();
  if (error) throw error;

  if (imageUrls.length > 0) {
    const rows = imageUrls.map((url, i) => ({
      service_id: data.id,
      url,
      sort_order: i,
    }));
    const { error: imgError } = await supabase
      .from('service_images')
      .insert(rows);
    if (imgError) throw imgError;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.categories.name,
    description: data.description,
    price: Number(data.price),
    duration_minutes: data.duration_minutes,
    image_urls: imageUrls,
    rating: Number(data.rating),
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
  };
}

// ============================================================
// Provider
// ============================================================

export interface ProviderStatsRow {
  date: string;
  time_slot: string;
  status: Booking['status'];
  service_name: string;
  price: number;
}

export async function getProviderStatsRows(
  month: number,
  year: number,
): Promise<ProviderStatsRow[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('bookings')
    .select('date, time_slot, status, services!inner(name, price, user_id)')
    .eq('services.user_id', user.id)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date');
  if (error) throw error;

  return data.map((row: any) => ({
    date: row.date,
    time_slot: row.time_slot,
    status: row.status,
    service_name: row.services.name,
    price: Number(row.services.price),
  }));
}

// ============================================================
// Reviews
// ============================================================

export async function getServiceReviews(serviceId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createReview(draft: ReviewDraft): Promise<Review> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: draft.booking_id,
      service_id: draft.service_id,
      user_id: user.id,
      rating: draft.rating,
      comment: draft.comment || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// Favorites
// ============================================================

export async function getFavoriteIds(): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('service_id')
    .eq('user_id', user.id);
  if (error) throw error;
  return data.map((row: { service_id: string }) => row.service_id);
}

export async function addFavorite(serviceId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, service_id: serviceId });
  if (error) throw error;
}

export async function removeFavorite(serviceId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('service_id', serviceId);
  if (error) throw error;
}

// ============================================================
// Spending
// ============================================================

export interface UserSpendingRow {
  date: string;
  status: Booking['status'];
  service_name: string;
  price: number;
}

export async function getUserSpendingRows(
  month: number,
  year: number,
): Promise<UserSpendingRow[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('bookings')
    .select('date, status, services!inner(name, price)')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date');
  if (error) throw error;

  return data.map((row: any) => ({
    date: row.date,
    status: row.status,
    service_name: row.services.name,
    price: Number(row.services.price),
  }));
}

// ============================================================
// Notifications / Device Tokens
// ============================================================

export async function registerDeviceToken(
  token: string,
  platform: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('device_tokens').upsert(
    {
      user_id: user.id,
      token,
      platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' },
  );
  if (error) throw error;
}

export async function unregisterDeviceToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('device_tokens')
    .delete()
    .eq('token', token);
  if (error) throw error;
}

export async function deleteUserAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_user_account');
  if (error) throw error;
}

// ============================================================
// Home
// ============================================================

export async function getNewServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) throw error;
  return data.map(mapServiceRow);
}

export async function getTopRatedServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .gte('rating', 4.5)
    .order('rating', { ascending: false })
    .limit(6);
  if (error) throw error;
  return data.map(mapServiceRow);
}

export async function getRecentBooking(): Promise<Booking | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name)')
    .eq('user_id', user.id)
    .in('status', ['completed', 'confirmed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapBookingRow(data);
}

// ============================================================
// Profile
// ============================================================

export async function getProviderProfileData(
  userId: string,
): Promise<ProviderProfile> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (profileError) throw profileError;

  const { data: services, error: svcError } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (svcError) throw svcError;

  const mappedServices = services.map(mapServiceRow);
  const averageRating =
    mappedServices.length > 0
      ? mappedServices.reduce((sum, s) => sum + s.rating, 0) /
        mappedServices.length
      : 0;

  const { count, error: countError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .in(
      'service_id',
      mappedServices.map(s => s.id),
    );
  if (countError) throw countError;

  return {
    id: profile.id,
    name: profile.name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    phone: profile.phone,
    address: profile.address,
    services: mappedServices,
    averageRating: Math.round(averageRating * 10) / 10,
    totalBookings: count ?? 0,
  };
}

export async function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id);
  if (error) throw error;
}

export async function updateProfileAvatar(avatarUrl: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);
  if (error) throw error;
}

// ============================================================
// Promotions / Coupons
// ============================================================

export async function getActivePromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getUserCoupons(): Promise<UserCoupon[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_coupons')
    .select('*, promotions(*)')
    .eq('user_id', user.id)
    .order('claimed_at', { ascending: false });
  if (error) throw error;
  return data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    promotion_id: row.promotion_id,
    claimed_at: row.claimed_at,
    used_at: row.used_at,
    booking_id: row.booking_id,
    promotion: row.promotions,
  }));
}

export async function claimCoupon(promotionId: string): Promise<UserCoupon> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Increment current_uses
  const { error: incErr } = await supabase.rpc('increment_promotion_uses', {
    promo_id: promotionId,
  });
  if (incErr) {
    // Fallback: just insert, the trigger/constraint will handle
  }

  const { data, error } = await supabase
    .from('user_coupons')
    .insert({ user_id: user.id, promotion_id: promotionId })
    .select('*, promotions(*)')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    user_id: data.user_id,
    promotion_id: data.promotion_id,
    claimed_at: data.claimed_at,
    used_at: data.used_at,
    booking_id: data.booking_id,
    promotion: data.promotions,
  };
}

// ============================================================
// Subscription
// ============================================================

export async function getSubscriptionStatus(): Promise<{
  plan: 'free' | 'basic' | 'pro';
  status: string;
  expiresAt: string | null;
  productId: string | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { plan: 'free', status: 'active', expiresAt: null, productId: null };

  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, product_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'grace_period'])
    .single();

  if (error || !data) {
    return { plan: 'free', status: 'active', expiresAt: null, productId: null };
  }

  return {
    plan: data.plan as 'free' | 'basic' | 'pro',
    status: data.status,
    expiresAt: data.current_period_end,
    productId: data.product_id,
  };
}

export async function syncSubscription(params: {
  revenuecatCustomerId: string;
  plan: 'free' | 'basic' | 'pro';
  productId: string;
  status: string;
  expirationDate: string | null;
  isSandbox: boolean;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('subscriptions').upsert({
    user_id: user.id,
    revenuecat_customer_id: params.revenuecatCustomerId,
    plan: params.plan,
    product_id: params.productId,
    status: params.status,
    current_period_end: params.expirationDate,
    is_sandbox: params.isSandbox,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  await supabase.from('profiles').update({
    subscription_plan: params.plan,
  }).eq('id', user.id);
}

export async function getUserServiceCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return count ?? 0;
}
