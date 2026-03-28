import { takeLatest, put, call } from 'redux-saga/effects';
import { logEvent, AnalyticsEvents } from '@/lib/analytics';
import {
  loadPromotions,
  loadPromotionsSuccess,
  loadPromotionsFailure,
  loadUserCoupons,
  loadUserCouponsSuccess,
  loadUserCouponsFailure,
  claimCoupon,
  claimCouponSuccess,
  claimCouponFailure,
} from './promotionSlice';
import {
  getActivePromotions,
  getUserCoupons,
  claimCoupon as claimCouponApi,
} from '@/lib/supabase';
import type { Promotion, UserCoupon } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

function* handleLoadPromotions() {
  try {
    const promotions: Promotion[] = yield call(getActivePromotions);
    yield put(loadPromotionsSuccess(promotions));
    yield call(logEvent, AnalyticsEvents.VIEW_PROMOTIONS, {
      count: promotions.length,
    });
  } catch (e: any) {
    yield put(loadPromotionsFailure(e.message));
  }
}

function* handleLoadUserCoupons() {
  try {
    const coupons: UserCoupon[] = yield call(getUserCoupons);
    yield put(loadUserCouponsSuccess(coupons));
  } catch {
    yield put(loadUserCouponsFailure());
  }
}

function* handleClaimCoupon(action: PayloadAction<string>) {
  try {
    const coupon: UserCoupon = yield call(claimCouponApi, action.payload);
    yield put(claimCouponSuccess(coupon));
    yield call(logEvent, AnalyticsEvents.CLAIM_COUPON, {
      promotion_id: action.payload,
    });
  } catch (e: any) {
    yield put(claimCouponFailure(e.message));
  }
}

export function* promotionSaga() {
  yield takeLatest(loadPromotions.type, handleLoadPromotions);
  yield takeLatest(loadUserCoupons.type, handleLoadUserCoupons);
  yield takeLatest(claimCoupon.type, handleClaimCoupon);
}
