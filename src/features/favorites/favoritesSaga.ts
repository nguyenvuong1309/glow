import {takeLatest, takeEvery, put, call, select} from 'redux-saga/effects';
import {
  loadFavorites,
  loadFavoritesSuccess,
  toggleFavorite,
  toggleFavoriteFailure,
} from './favoritesSlice';
import {getFavoriteIds, addFavorite, removeFavorite} from '@/lib/supabase';
import type {RootState} from '@/store';
import type {PayloadAction} from '@reduxjs/toolkit';

function* handleLoadFavorites() {
  try {
    const ids: string[] = yield call(getFavoriteIds);
    yield put(loadFavoritesSuccess(ids));
  } catch {
    yield put(loadFavoritesSuccess([]));
  }
}

function* handleToggleFavorite(action: PayloadAction<string>) {
  const serviceId = action.payload;
  // State already updated optimistically by reducer.
  // Check new state to decide API call direction.
  const ids: string[] = yield select((state: RootState) => state.favorites.ids);
  const wasAdded = ids.includes(serviceId);
  const previousIds = wasAdded
    ? ids.filter(i => i !== serviceId)
    : [...ids, serviceId];

  try {
    if (wasAdded) {
      yield call(addFavorite, serviceId);
    } else {
      yield call(removeFavorite, serviceId);
    }
  } catch {
    yield put(toggleFavoriteFailure(previousIds));
  }
}

export function* favoritesSaga() {
  yield takeLatest(loadFavorites.type, handleLoadFavorites);
  yield takeEvery(toggleFavorite.type, handleToggleFavorite);
}
