import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Category, Service, Booking} from '@/types';

interface HomeState {
  categories: Category[];
  newServices: Service[];
  topRatedServices: Service[];
  recentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  categories: [],
  newServices: [],
  topRatedServices: [],
  recentBooking: null,
  loading: false,
  error: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    loadHome(state) {
      state.loading = true;
      state.error = null;
    },
    loadHomeSuccess(
      state,
      action: PayloadAction<{
        categories: Category[];
        newServices: Service[];
        topRatedServices: Service[];
        recentBooking: Booking | null;
      }>,
    ) {
      state.categories = action.payload.categories;
      state.newServices = action.payload.newServices;
      state.topRatedServices = action.payload.topRatedServices;
      state.recentBooking = action.payload.recentBooking;
      state.loading = false;
    },
    loadHomeFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {loadHome, loadHomeSuccess, loadHomeFailure} = homeSlice.actions;
export default homeSlice.reducer;
