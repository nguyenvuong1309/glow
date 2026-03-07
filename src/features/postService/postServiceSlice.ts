import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Service, SubmitServicePayload} from '@/types';

interface UpdateServicePayload {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: number;
  duration_minutes: number;
  localMedia: {uri: string; fileName: string; type: string}[];
  existingImageUrls: string[];
  originalImageUrls: string[];
}

interface PostServiceState {
  loading: boolean;
  error: string | null;
  posted: Service | null;
  myServices: Service[];
  myServicesLoading: boolean;
}

const initialState: PostServiceState = {
  loading: false,
  error: null,
  posted: null,
  myServices: [],
  myServicesLoading: false,
};

const postServiceSlice = createSlice({
  name: 'postService',
  initialState,
  reducers: {
    submitService(state, _action: PayloadAction<SubmitServicePayload>) {
      state.loading = true;
      state.error = null;
    },
    submitServiceSuccess(state, action: PayloadAction<Service>) {
      state.posted = action.payload;
      state.loading = false;
      state.error = null;
    },
    submitServiceFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearPostService(state) {
      state.loading = false;
      state.error = null;
      state.posted = null;
    },
    loadMyServices(state) {
      state.myServicesLoading = true;
    },
    loadMyServicesSuccess(state, action: PayloadAction<Service[]>) {
      state.myServices = action.payload;
      state.myServicesLoading = false;
    },
    updateServiceRequest(state, _action: PayloadAction<UpdateServicePayload>) {
      state.loading = true;
      state.error = null;
    },
    updateServiceSuccess(state) {
      state.loading = false;
      state.posted = {} as Service; // signal success
    },
    updateServiceFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  submitService,
  submitServiceSuccess,
  submitServiceFailure,
  clearPostService,
  loadMyServices,
  loadMyServicesSuccess,
  updateServiceRequest,
  updateServiceSuccess,
  updateServiceFailure,
} = postServiceSlice.actions;
export type {UpdateServicePayload};
export default postServiceSlice.reducer;
