import {takeLatest, put, call} from 'redux-saga/effects';
import {loadCategories, loadCategoriesSuccess, loadCategoriesFailure} from './homeSlice';
import {getCategories} from '@/lib/supabase';
import type {Category} from '@/types';

function* handleLoadCategories() {
  try {
    const categories: Category[] = yield call(getCategories);
    yield put(loadCategoriesSuccess(categories));
  } catch (e: any) {
    yield put(loadCategoriesFailure(e.message ?? 'Failed to load categories'));
  }
}

export function* homeSaga() {
  yield takeLatest(loadCategories.type, handleLoadCategories);
}
