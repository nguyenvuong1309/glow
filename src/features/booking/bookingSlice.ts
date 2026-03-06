import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Booking, BookingDraft, ServiceAvailability} from '@/types';

interface BookingState {
  draft: BookingDraft | null;
  history: Booking[];
  loading: boolean;
  error: string | null;
  availability: ServiceAvailability[];
  availableDates: string[];
  availableTimeSlots: string[];
  loadingAvailability: boolean;
  loadingTimeSlots: boolean;
  providerBookings: Booking[];
  providerLoading: boolean;
}

const initialState: BookingState = {
  draft: null,
  history: [],
  loading: false,
  error: null,
  availability: [],
  availableDates: [],
  availableTimeSlots: [],
  loadingAvailability: false,
  loadingTimeSlots: false,
  providerBookings: [],
  providerLoading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setDraft(state, action: PayloadAction<BookingDraft>) {
      state.draft = action.payload;
    },
    clearDraft(state) {
      state.draft = null;
    },
    loadAvailability(state, _action: PayloadAction<string>) {
      state.loadingAvailability = true;
      state.availability = [];
      state.availableDates = [];
      state.availableTimeSlots = [];
    },
    loadAvailabilitySuccess(
      state,
      action: PayloadAction<{
        availability: ServiceAvailability[];
        dates: string[];
      }>,
    ) {
      state.availability = action.payload.availability;
      state.availableDates = action.payload.dates;
      state.loadingAvailability = false;
    },
    loadAvailabilityFailure(state, action: PayloadAction<string | undefined>) {
      state.loadingAvailability = false;
      state.error = action.payload ?? 'Failed to load availability';
    },
    loadTimeSlots(
      state,
      _action: PayloadAction<{serviceId: string; date: string; durationMinutes: number}>,
    ) {
      state.loadingTimeSlots = true;
      state.availableTimeSlots = [];
    },
    loadTimeSlotsSuccess(state, action: PayloadAction<string[]>) {
      state.availableTimeSlots = action.payload;
      state.loadingTimeSlots = false;
    },
    loadTimeSlotsFailure(state, action: PayloadAction<string | undefined>) {
      state.loadingTimeSlots = false;
      state.error = action.payload ?? 'Failed to load time slots';
    },
    submitBooking(state) {
      state.loading = true;
      state.error = null;
    },
    submitBookingSuccess(state, action: PayloadAction<Booking>) {
      state.history.unshift(action.payload);
      state.draft = null;
      state.loading = false;
    },
    submitBookingFailure(state, action: PayloadAction<string | undefined>) {
      state.loading = false;
      state.error = action.payload ?? 'Failed to submit booking';
    },
    loadBookings(state) {
      state.loading = true;
    },
    loadBookingsSuccess(state, action: PayloadAction<Booking[]>) {
      state.history = action.payload;
      state.loading = false;
    },
    loadProviderBookings(state) {
      state.providerLoading = true;
    },
    loadProviderBookingsSuccess(state, action: PayloadAction<Booking[]>) {
      state.providerBookings = action.payload;
      state.providerLoading = false;
    },
    updateBookingStatus(
      state,
      _action: PayloadAction<{bookingId: string; status: Booking['status']}>,
    ) {
      // saga handles the side effect
    },
    updateBookingStatusSuccess(
      state,
      action: PayloadAction<{bookingId: string; status: Booking['status']}>,
    ) {
      const {bookingId, status} = action.payload;
      const booking = state.providerBookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = status;
      }
    },
  },
});

export const {
  setDraft,
  clearDraft,
  loadAvailability,
  loadAvailabilitySuccess,
  loadAvailabilityFailure,
  loadTimeSlots,
  loadTimeSlotsSuccess,
  loadTimeSlotsFailure,
  submitBooking,
  submitBookingSuccess,
  submitBookingFailure,
  loadBookings,
  loadBookingsSuccess,
  loadProviderBookings,
  loadProviderBookingsSuccess,
  updateBookingStatus,
  updateBookingStatusSuccess,
} = bookingSlice.actions;
export default bookingSlice.reducer;
