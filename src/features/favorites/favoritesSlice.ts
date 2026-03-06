import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface FavoritesState {
  ids: string[];
  loading: boolean;
}

const initialState: FavoritesState = {
  ids: [],
  loading: false,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    loadFavorites(state) {
      state.loading = true;
    },
    loadFavoritesSuccess(state, action: PayloadAction<string[]>) {
      state.ids = action.payload;
      state.loading = false;
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter(i => i !== id);
      } else {
        state.ids.push(id);
      }
    },
    toggleFavoriteFailure(state, action: PayloadAction<string[]>) {
      state.ids = action.payload;
    },
  },
});

export const {
  loadFavorites,
  loadFavoritesSuccess,
  toggleFavorite,
  toggleFavoriteFailure,
} = favoritesSlice.actions;
export default favoritesSlice.reducer;
