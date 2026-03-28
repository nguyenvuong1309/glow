import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Promotion, UserCoupon } from '@/types';

interface PromotionState {
  promotions: Promotion[];
  userCoupons: UserCoupon[];
  loading: boolean;
  couponsLoading: boolean;
  claimingId: string | null;
  error: string | null;
}

const initialState: PromotionState = {
  promotions: [],
  userCoupons: [],
  loading: false,
  couponsLoading: false,
  claimingId: null,
  error: null,
};

const promotionSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    loadPromotions(state) {
      state.loading = true;
      state.error = null;
    },
    loadPromotionsSuccess(state, action: PayloadAction<Promotion[]>) {
      state.promotions = action.payload;
      state.loading = false;
    },
    loadPromotionsFailure(state, action: PayloadAction<string | undefined>) {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load promotions';
    },
    loadUserCoupons(state) {
      state.couponsLoading = true;
    },
    loadUserCouponsSuccess(state, action: PayloadAction<UserCoupon[]>) {
      state.userCoupons = action.payload;
      state.couponsLoading = false;
    },
    loadUserCouponsFailure(state) {
      state.couponsLoading = false;
    },
    claimCoupon(state, _action: PayloadAction<string>) {
      state.claimingId = _action.payload;
    },
    claimCouponSuccess(state, action: PayloadAction<UserCoupon>) {
      state.userCoupons.unshift(action.payload);
      state.claimingId = null;
    },
    claimCouponFailure(state, action: PayloadAction<string | undefined>) {
      state.claimingId = null;
      state.error = action.payload ?? 'Failed to claim coupon';
    },
  },
});

export const {
  loadPromotions,
  loadPromotionsSuccess,
  loadPromotionsFailure,
  loadUserCoupons,
  loadUserCouponsSuccess,
  loadUserCouponsFailure,
  claimCoupon,
  claimCouponSuccess,
  claimCouponFailure,
} = promotionSlice.actions;
export default promotionSlice.reducer;
