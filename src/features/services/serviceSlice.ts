import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Service, ServiceFilter} from '@/types';

const initialFilter: ServiceFilter = {
  categories: [],
  dateFrom: null,
  dateTo: null,
  timeFrom: null,
  timeTo: null,
};

interface ServiceState {
  list: Service[];
  selected: Service | null;
  loading: boolean;
  error: string | null;
  filter: ServiceFilter;
}

const initialState: ServiceState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filter: initialFilter,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    loadServices(state) {
      state.loading = true;
      state.error = null;
    },
    loadServicesSuccess(state, action: PayloadAction<Service[]>) {
      state.list = action.payload;
      state.loading = false;
    },
    loadServicesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    selectService(state, action: PayloadAction<Service>) {
      state.selected = action.payload;
    },
    clearSelectedService(state) {
      state.selected = null;
    },
    setFilter(state, action: PayloadAction<Partial<ServiceFilter>>) {
      state.filter = {...state.filter, ...action.payload};
    },
    clearFilter(state) {
      state.filter = initialFilter;
    },
    loadFilteredServices(state) {
      state.loading = true;
      state.error = null;
    },
  },
});

export const {
  loadServices,
  loadServicesSuccess,
  loadServicesFailure,
  selectService,
  clearSelectedService,
  setFilter,
  clearFilter,
  loadFilteredServices,
} = serviceSlice.actions;
export default serviceSlice.reducer;
