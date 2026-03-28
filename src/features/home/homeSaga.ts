import {takeLatest, put, call, all} from 'redux-saga/effects';
import {loadHome, loadHomeSuccess, loadHomeFailure} from './homeSlice';
import {
  getCategories,
  getNewServices,
  getTopRatedServices,
  getRecentBooking,
  fetchServiceBookingCounts,
} from '@/lib/supabase';
import type {Category, Service, Booking} from '@/types';

function* handleLoadHome() {
  try {
    const [categories, newServices, topRatedServices, recentBooking]: [
      Category[],
      Service[],
      Service[],
      Booking | null,
    ] = yield all([
      call(getCategories),
      call(getNewServices),
      call(getTopRatedServices),
      call(getRecentBooking),
    ]);
    // Fetch booking counts for all home services
    const allServiceIds = [
      ...newServices.map(s => s.id),
      ...topRatedServices.map(s => s.id),
    ];
    const uniqueIds = [...new Set(allServiceIds)];
    const counts: Record<string, number> = yield call(fetchServiceBookingCounts, uniqueIds);

    const newServicesWithCounts = newServices.map(s => ({
      ...s,
      booking_count: counts[s.id] ?? 0,
    }));
    const topRatedWithCounts = topRatedServices.map(s => ({
      ...s,
      booking_count: counts[s.id] ?? 0,
    }));

    yield put(
      loadHomeSuccess({
        categories,
        newServices: newServicesWithCounts,
        topRatedServices: topRatedWithCounts,
        recentBooking,
      }),
    );
  } catch (e: any) {
    yield put(loadHomeFailure(e.message ?? 'Failed to load home'));
  }
}

export function* homeSaga() {
  yield takeLatest(loadHome.type, handleLoadHome);
}
