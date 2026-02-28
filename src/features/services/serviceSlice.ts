import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Service} from '@/types';

interface ServiceState {
  list: Service[];
  selected: Service | null;
  loading: boolean;
}

const initialState: ServiceState = {
  list: [],
  selected: null,
  loading: false,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    loadServices(state) {
      state.loading = true;
    },
    loadServicesSuccess(state, action: PayloadAction<Service[]>) {
      state.list = action.payload;
      state.loading = false;
    },
    selectService(state, action: PayloadAction<Service>) {
      state.selected = action.payload;
    },
    clearSelectedService(state) {
      state.selected = null;
    },
  },
});

export const {loadServices, loadServicesSuccess, selectService, clearSelectedService} =
  serviceSlice.actions;
export default serviceSlice.reducer;
