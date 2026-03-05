import {takeLatest, put, call, select} from 'redux-saga/effects';
import {
  submitBooking,
  submitBookingSuccess,
  submitBookingFailure,
  loadBookings,
  loadBookingsSuccess,
  loadAvailability,
  loadAvailabilitySuccess,
  loadAvailabilityFailure,
  loadTimeSlots,
  loadTimeSlotsSuccess,
  loadTimeSlotsFailure,
  loadProviderBookings,
  loadProviderBookingsSuccess,
  updateBookingStatus,
  updateBookingStatusSuccess,
} from './bookingSlice';
import {
  createBooking,
  getBookings,
  getServiceAvailability,
  getBookedSlots,
  getProviderBookings,
  updateBookingStatus as updateBookingStatusApi,
} from '@/lib/supabase';
import type {Booking, BookingDraft, ServiceAvailability} from '@/types';
import type {RootState} from '@/store';
import type {PayloadAction} from '@reduxjs/toolkit';

/**
 * Generate available dates for the next 30 days based on service availability.
 * Only includes dates whose day_of_week matches an availability record.
 */
function generateAvailableDates(
  availability: ServiceAvailability[],
): string[] {
  const activeDays = new Set(availability.map(a => a.day_of_week));
  const dates: string[] = [];
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (activeDays.has(d.getDay())) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  return dates;
}

/**
 * Generate time slots for a given date based on availability windows and service duration.
 * Excludes already-booked slots.
 */
function generateTimeSlots(
  availability: ServiceAvailability[],
  dayOfWeek: number,
  durationMinutes: number,
  bookedSlots: string[],
): string[] {
  const windows = availability.filter(a => a.day_of_week === dayOfWeek);
  const booked = new Set(bookedSlots);
  const slots: string[] = [];

  for (const w of windows) {
    const [startH, startM] = w.start_time.split(':').map(Number);
    const [endH, endM] = w.end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let current = startMinutes;
    while (current + durationMinutes <= endMinutes) {
      const hh = String(Math.floor(current / 60)).padStart(2, '0');
      const mm = String(current % 60).padStart(2, '0');
      const slot = `${hh}:${mm}`;
      if (!booked.has(slot)) {
        slots.push(slot);
      }
      current += durationMinutes;
    }
  }

  return slots.sort();
}

function* handleLoadAvailability(action: PayloadAction<string>) {
  try {
    const serviceId = action.payload;
    const availability: ServiceAvailability[] = yield call(
      getServiceAvailability,
      serviceId,
    );
    const dates = generateAvailableDates(availability);
    yield put(loadAvailabilitySuccess({availability, dates}));
  } catch {
    yield put(loadAvailabilityFailure());
  }
}

function* handleLoadTimeSlots(
  action: PayloadAction<{serviceId: string; date: string; durationMinutes: number}>,
) {
  try {
    const {serviceId, date, durationMinutes} = action.payload;
    const availability: ServiceAvailability[] = yield select(
      (state: RootState) => state.booking.availability,
    );
    const bookedSlots: string[] = yield call(getBookedSlots, serviceId, date);
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    const slots = generateTimeSlots(
      availability,
      dayOfWeek,
      durationMinutes,
      bookedSlots,
    );
    yield put(loadTimeSlotsSuccess(slots));
  } catch {
    yield put(loadTimeSlotsFailure());
  }
}

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

function* handleLoadProviderBookings() {
  try {
    const bookings: Booking[] = yield call(getProviderBookings);
    yield put(loadProviderBookingsSuccess(bookings));
  } catch {
    yield put(loadProviderBookingsSuccess([]));
  }
}

function* handleUpdateBookingStatus(
  action: PayloadAction<{bookingId: string; status: Booking['status']}>,
) {
  try {
    const {bookingId, status} = action.payload;
    yield put(updateBookingStatusSuccess({bookingId, status}));
    yield call(updateBookingStatusApi, bookingId, status);
  } catch {
    // Reload to revert optimistic update
    yield put(loadProviderBookings());
  }
}

export function* bookingSaga() {
  yield takeLatest(loadAvailability.type, handleLoadAvailability);
  yield takeLatest(loadTimeSlots.type, handleLoadTimeSlots);
  yield takeLatest(submitBooking.type, handleSubmitBooking);
  yield takeLatest(loadBookings.type, handleLoadBookings);
  yield takeLatest(loadProviderBookings.type, handleLoadProviderBookings);
  yield takeLatest(updateBookingStatus.type, handleUpdateBookingStatus);
}
