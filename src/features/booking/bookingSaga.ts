import {takeLatest, put, call, select} from 'redux-saga/effects';
import {
  submitBooking,
  submitBookingSuccess,
  submitBookingFailure,
  loadBookings,
  loadBookingsSuccess,
} from './bookingSlice';
import {createBooking, getBookings} from '@/lib/supabase';
import type {Booking, BookingDraft} from '@/types';
import type {RootState} from '@/store';

function* handleSubmitBooking() {
  try {
    const draft: BookingDraft = yield select(
      (state: RootState) => state.booking.draft,
    );
    if (!draft) {
      return;
    }
    const booking: Booking = yield call(createBooking, draft);
    yield put(submitBookingSuccess(booking));
  } catch {
    yield put(submitBookingFailure());
  }
}

function* handleLoadBookings() {
  const bookings: Booking[] = yield call(getBookings);
  yield put(loadBookingsSuccess(bookings));
}

export function* bookingSaga() {
  yield takeLatest(submitBooking.type, handleSubmitBooking);
  yield takeLatest(loadBookings.type, handleLoadBookings);
}
