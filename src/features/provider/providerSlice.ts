import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ProviderProfile} from '@/types';

interface RevenueByDay {
  date: string;
  amount: number;
}

interface TopService {
  name: string;
  count: number;
  revenue: number;
}

export interface PeakHour {
  hour: string;
  count: number;
}

export interface BusiestDay {
  dayOfWeek: number;
  dayName: string;
  count: number;
}

export interface ProviderStats {
  monthlyRevenue: number;
  confirmedCount: number;
  cancelledCount: number;
  pendingCount: number;
  revenueByDay: RevenueByDay[];
  topServices: TopService[];
  conversionRate: number;
  totalBookings: number;
  peakHours: PeakHour[];
  busiestDays: BusiestDay[];
}

interface ProviderState {
  stats: ProviderStats | null;
  loading: boolean;
  selectedMonth: number;
  selectedYear: number;
  profile: ProviderProfile | null;
  profileLoading: boolean;
}

const now = new Date();

const initialState: ProviderState = {
  stats: null,
  loading: false,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  profile: null,
  profileLoading: false,
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    loadStats(
      state,
      _action: PayloadAction<{month: number; year: number}>,
    ) {
      state.loading = true;
    },
    loadStatsSuccess(state, action: PayloadAction<ProviderStats>) {
      state.stats = action.payload;
      state.loading = false;
    },
    loadStatsFailure(state) {
      state.loading = false;
    },
    setMonth(state, action: PayloadAction<{month: number; year: number}>) {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
    },
    loadProviderProfile(state, _action: PayloadAction<string>) {
      state.profileLoading = true;
    },
    loadProviderProfileSuccess(state, action: PayloadAction<ProviderProfile>) {
      state.profile = action.payload;
      state.profileLoading = false;
    },
    loadProviderProfileFailure(state) {
      state.profileLoading = false;
    },
  },
});

export const {
  loadStats,
  loadStatsSuccess,
  loadStatsFailure,
  setMonth,
  loadProviderProfile,
  loadProviderProfileSuccess,
  loadProviderProfileFailure,
} = providerSlice.actions;
export default providerSlice.reducer;
