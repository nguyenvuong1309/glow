import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Category} from '@/types';

interface HomeState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  categories: [],
  loading: false,
  error: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    loadCategories(state) {
      state.loading = true;
      state.error = null;
    },
    loadCategoriesSuccess(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
      state.loading = false;
    },
    loadCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {loadCategories, loadCategoriesSuccess, loadCategoriesFailure} =
  homeSlice.actions;
export default homeSlice.reducer;
