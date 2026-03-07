import {takeLatest, put, call, all} from 'redux-saga/effects';
import {loadHome, loadHomeSuccess, loadHomeFailure} from './homeSlice';
import {
  getCategories,
  getNewServices,
  getTopRatedServices,
  getRecentBooking,
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
    yield put(
      loadHomeSuccess({categories, newServices, topRatedServices, recentBooking}),
    );
  } catch (e: any) {
    yield put(loadHomeFailure(e.message ?? 'Failed to load home'));
  }
}

export function* homeSaga() {
  yield takeLatest(loadHome.type, handleLoadHome);
}
