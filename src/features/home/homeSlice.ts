import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Category} from '@/types';

interface HomeState {
  categories: Category[];
  selectedCategory: string | null;
  loading: boolean;
}

const initialState: HomeState = {
  categories: [],
  selectedCategory: null,
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
    selectCategory(state, action: PayloadAction<string | null>) {
      state.selectedCategory = action.payload;
    },
  },
});

export const {loadCategories, loadCategoriesSuccess, selectCategory} =
  homeSlice.actions;
export default homeSlice.reducer;
