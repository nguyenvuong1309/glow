import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServiceAvailability, BlockedDate } from '@/types';

interface AvailabilityState {
  slots: ServiceAvailability[];
  blockedDates: BlockedDate[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AvailabilityState = {
  slots: [],
  blockedDates: [],
  loading: false,
  saving: false,
  error: null,
};

const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    loadAvailabilityForService(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    loadAvailabilityForServiceSuccess(
      state,
      action: PayloadAction<{ slots: ServiceAvailability[]; blockedDates: BlockedDate[] }>,
    ) {
      state.slots = action.payload.slots;
      state.blockedDates = action.payload.blockedDates;
      state.loading = false;
    },
    loadAvailabilityForServiceFailure(state, action: PayloadAction<string | undefined>) {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load availability';
    },
    saveAvailability(
      state,
      _action: PayloadAction<{
        serviceId: string;
        slots: Omit<ServiceAvailability, 'id'>[];
      }>,
    ) {
      state.saving = true;
      state.error = null;
    },
    saveAvailabilitySuccess(state, action: PayloadAction<ServiceAvailability[]>) {
      state.slots = action.payload;
      state.saving = false;
    },
    saveAvailabilityFailure(state, action: PayloadAction<string | undefined>) {
      state.saving = false;
      state.error = action.payload ?? 'Failed to save availability';
    },
    addBlockedDateRequest(
      state,
      _action: PayloadAction<{ serviceId: string; date: string; reason?: string }>,
    ) {
      state.saving = true;
    },
    addBlockedDateSuccess(state, action: PayloadAction<BlockedDate>) {
      state.blockedDates.push(action.payload);
      state.saving = false;
    },
    addBlockedDateFailure(state) {
      state.saving = false;
    },
    removeBlockedDateRequest(state, _action: PayloadAction<string>) {
      state.saving = true;
    },
    removeBlockedDateSuccess(state, action: PayloadAction<string>) {
      state.blockedDates = state.blockedDates.filter(d => d.id !== action.payload);
      state.saving = false;
    },
    removeBlockedDateFailure(state) {
      state.saving = false;
    },
  },
});

export const {
  loadAvailabilityForService,
  loadAvailabilityForServiceSuccess,
  loadAvailabilityForServiceFailure,
  saveAvailability,
  saveAvailabilitySuccess,
  saveAvailabilityFailure,
  addBlockedDateRequest,
  addBlockedDateSuccess,
  addBlockedDateFailure,
  removeBlockedDateRequest,
  removeBlockedDateSuccess,
  removeBlockedDateFailure,
} = availabilitySlice.actions;
export default availabilitySlice.reducer;
