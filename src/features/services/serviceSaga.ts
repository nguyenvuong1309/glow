import {takeLatest, put, call, select} from 'redux-saga/effects';
import {
  loadServices, loadServicesSuccess, loadServicesFailure, loadFilteredServices,
  loadReviews, loadReviewsSuccess, loadReviewsFailure,
  submitReview, submitReviewSuccess, submitReviewFailure,
} from './serviceSlice';
import {getServices, getAvailableServices, getServiceReviews, createReview} from '@/lib/supabase';
import type {Service, ServiceFilter, Review, ReviewDraft} from '@/types';
import type {RootState} from '@/store';
import type {PayloadAction} from '@reduxjs/toolkit';

function* handleLoadServices() {
  try {
    const services: Service[] = yield call(getServices);
    yield put(loadServicesSuccess(services));
  } catch (e: any) {
    yield put(loadServicesFailure(e.message ?? 'Failed to load services'));
  }
}

function* handleLoadFilteredServices() {
  try {
    const filter: ServiceFilter = yield select(
      (state: RootState) => state.services.filter,
    );
    const services: Service[] = yield call(getAvailableServices, filter);
    yield put(loadServicesSuccess(services));
  } catch (e: any) {
    yield put(loadServicesFailure(e.message ?? 'Failed to load services'));
  }
}

function* handleLoadReviews(action: PayloadAction<string>) {
  try {
    const reviews: Review[] = yield call(getServiceReviews, action.payload);
    yield put(loadReviewsSuccess(reviews));
  } catch {
    yield put(loadReviewsFailure());
  }
}

function* handleSubmitReview(action: PayloadAction<ReviewDraft>) {
  try {
    const review: Review = yield call(createReview, action.payload);
    yield put(submitReviewSuccess(review));
  } catch {
    yield put(submitReviewFailure());
  }
}

export function* serviceSaga() {
  yield takeLatest(loadServices.type, handleLoadServices);
  yield takeLatest(loadFilteredServices.type, handleLoadFilteredServices);
  yield takeLatest(loadReviews.type, handleLoadReviews);
  yield takeLatest(submitReview.type, handleSubmitReview);
}
