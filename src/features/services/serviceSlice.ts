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
  filter: ServiceFilter;
}

const initialState: ServiceState = {
  list: [],
  selected: null,
  loading: false,
  filter: initialFilter,
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
    setFilter(state, action: PayloadAction<Partial<ServiceFilter>>) {
      state.filter = {...state.filter, ...action.payload};
    },
    clearFilter(state) {
      state.filter = initialFilter;
    },
    loadFilteredServices(state) {
      state.loading = true;
    },
  },
});

export const {
  loadServices,
  loadServicesSuccess,
  selectService,
  clearSelectedService,
  setFilter,
  clearFilter,
  loadFilteredServices,
} = serviceSlice.actions;
export default serviceSlice.reducer;
