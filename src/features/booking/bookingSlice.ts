import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Booking, BookingDraft} from '@/types';

interface BookingState {
  draft: BookingDraft | null;
  history: Booking[];
  loading: boolean;
}

const initialState: BookingState = {
  draft: null,
  history: [],
  loading: false,
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
    submitBooking(state) {
      state.loading = true;
    },
    submitBookingSuccess(state, action: PayloadAction<Booking>) {
      state.history.unshift(action.payload);
      state.draft = null;
      state.loading = false;
    },
    submitBookingFailure(state) {
      state.loading = false;
    },
    loadBookings(state) {
      state.loading = true;
    },
    loadBookingsSuccess(state, action: PayloadAction<Booking[]>) {
      state.history = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setDraft,
  clearDraft,
  submitBooking,
  submitBookingSuccess,
  submitBookingFailure,
  loadBookings,
  loadBookingsSuccess,
} = bookingSlice.actions;
export default bookingSlice.reducer;
