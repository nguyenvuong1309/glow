import {takeLatest, put, call} from 'redux-saga/effects';
import {loadCategories, loadCategoriesSuccess} from './homeSlice';
import {getCategories} from '@/lib/supabase';
import type {Category} from '@/types';

function* handleLoadCategories() {
  const categories: Category[] = yield call(getCategories);
  yield put(loadCategoriesSuccess(categories));
}

export function* homeSaga() {
  yield takeLatest(loadCategories.type, handleLoadCategories);
}
