import {takeLatest, put, call, select} from 'redux-saga/effects';
import {logEvent, AnalyticsEvents} from '@/lib/analytics';
import {
  loadServices, loadServicesSuccess, loadServicesFailure, loadFilteredServices,
  loadReviews, loadReviewsSuccess, loadReviewsFailure,
  submitReview, submitReviewSuccess, submitReviewFailure,
} from './serviceSlice';
import {getServices, getAvailableServices, getServiceReviews, createReview, fetchServiceBookingCounts} from '@/lib/supabase';
import type {Service, ServiceFilter, Review, ReviewDraft} from '@/types';
import type {RootState} from '@/store';
import type {PayloadAction} from '@reduxjs/toolkit';

function* handleLoadServices() {
  try {
    const services: Service[] = yield call(getServices);
    const ids = services.map(s => s.id);
    const counts: Record<string, number> = yield call(fetchServiceBookingCounts, ids);
    const servicesWithCounts = services.map(s => ({
      ...s,
      booking_count: counts[s.id] ?? 0,
    }));
    yield put(loadServicesSuccess(servicesWithCounts));
  } catch (e: any) {
    yield put(loadServicesFailure(e.message ?? 'Failed to load services'));
  }
}

function* handleLoadFilteredServices() {
  try {
    const filter: ServiceFilter = yield select(
      (state: RootState) => state.services.filter,
    );
    yield call(logEvent, AnalyticsEvents.SEARCH, {
      search_query: filter.searchQuery ?? '',
      category: filter.categories?.join(',') ?? '',
      min_rating: filter.minRating ?? 0,
      sort_by: filter.sortBy ?? 'default',
    });
    const services: Service[] = yield call(getAvailableServices, filter);
    const ids = services.map(s => s.id);
    const counts: Record<string, number> = yield call(fetchServiceBookingCounts, ids);
    const servicesWithCounts = services.map(s => ({
      ...s,
      booking_count: counts[s.id] ?? 0,
    }));
    yield put(loadServicesSuccess(servicesWithCounts));
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
    yield call(logEvent, AnalyticsEvents.SUBMIT_REVIEW, {
      service_id: action.payload.service_id,
      rating: action.payload.rating,
    });
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
