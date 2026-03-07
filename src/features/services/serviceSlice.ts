import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Service, ServiceFilter, Review, ReviewDraft } from '@/types';

const initialFilter: ServiceFilter = {
  searchQuery: '',
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
  reviews: Review[];
  reviewsLoading: boolean;
  reviewSubmitting: boolean;
}

const initialState: ServiceState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filter: initialFilter,
  reviews: [],
  reviewsLoading: false,
  reviewSubmitting: false,
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
    setFilter(state, action: PayloadAction<Partial<ServiceFilter>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter(state) {
      state.filter = initialFilter;
    },
    loadFilteredServices(state) {
      state.loading = true;
      state.error = null;
    },
    loadReviews(state, _action: PayloadAction<string>) {
      state.reviewsLoading = true;
    },
    loadReviewsSuccess(state, action: PayloadAction<Review[]>) {
      state.reviews = action.payload;
      state.reviewsLoading = false;
    },
    loadReviewsFailure(state) {
      state.reviewsLoading = false;
    },
    submitReview(state, _action: PayloadAction<ReviewDraft>) {
      state.reviewSubmitting = true;
    },
    submitReviewSuccess(state, action: PayloadAction<Review>) {
      state.reviews.unshift(action.payload);
      state.reviewSubmitting = false;
    },
    submitReviewFailure(state) {
      state.reviewSubmitting = false;
    },
  },
});

export const {
  loadServices,
  loadServicesSuccess,
  loadServicesFailure,
  selectService,
  setFilter,
  clearFilter,
  loadFilteredServices,
  loadReviews,
  loadReviewsSuccess,
  loadReviewsFailure,
  submitReview,
  submitReviewSuccess,
  submitReviewFailure,
} = serviceSlice.actions;
export default serviceSlice.reducer;
