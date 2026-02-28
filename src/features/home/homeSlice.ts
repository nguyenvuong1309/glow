import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Category} from '@/types';

interface HomeState {
  categories: Category[];
  loading: boolean;
}

const initialState: HomeState = {
  categories: [],
  loading: false,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    loadCategories(state) {
      state.loading = true;
    },
    loadCategoriesSuccess(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
      state.loading = false;
    },
  },
});

export const {loadCategories, loadCategoriesSuccess} = homeSlice.actions;
export default homeSlice.reducer;
