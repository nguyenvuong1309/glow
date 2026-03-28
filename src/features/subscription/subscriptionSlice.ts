import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {SubscriptionPlan, SubscriptionStatus, SubscriptionPeriod} from './subscriptionTypes';

interface SubscriptionState {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  productId: string | null;
  expirationDate: string | null;
  isTrialActive: boolean;
  availablePackages: any[];
  loading: boolean;
  purchasing: boolean;
  restoring: boolean;
  error: string | null;
  period: SubscriptionPeriod;
}

const initialState: SubscriptionState = {
  plan: 'free',
  status: 'unknown',
  productId: null,
  expirationDate: null,
  isTrialActive: false,
  availablePackages: [],
  loading: false,
  purchasing: false,
  restoring: false,
  error: null,
  period: 'monthly',
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    initSubscription(state) {
      state.loading = true;
      state.error = null;
    },
    initSubscriptionSuccess(
      state,
      action: PayloadAction<{
        plan: SubscriptionPlan;
        status: SubscriptionStatus;
        productId: string | null;
        expirationDate: string | null;
        isTrialActive: boolean;
      }>,
    ) {
      state.plan = action.payload.plan;
      state.status = action.payload.status;
      state.productId = action.payload.productId;
      state.expirationDate = action.payload.expirationDate;
      state.isTrialActive = action.payload.isTrialActive;
      state.loading = false;
    },
    initSubscriptionFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    loadOfferings(state) {
      state.loading = true;
      state.error = null;
    },
    loadOfferingsSuccess(state, action: PayloadAction<any[]>) {
      state.availablePackages = action.payload;
      state.loading = false;
    },
    purchasePackage(state, _action: PayloadAction<string>) {
      state.purchasing = true;
      state.error = null;
    },
    purchaseSuccess(
      state,
      action: PayloadAction<{
        plan: SubscriptionPlan;
        status: SubscriptionStatus;
        productId: string | null;
        expirationDate: string | null;
        isTrialActive: boolean;
      }>,
    ) {
      state.plan = action.payload.plan;
      state.status = action.payload.status;
      state.productId = action.payload.productId;
      state.expirationDate = action.payload.expirationDate;
      state.isTrialActive = action.payload.isTrialActive;
      state.purchasing = false;
    },
    purchaseFailure(state, action: PayloadAction<string>) {
      state.purchasing = false;
      state.error = action.payload;
    },
    restorePurchases(state) {
      state.restoring = true;
      state.error = null;
    },
    restoreSuccess(
      state,
      action: PayloadAction<{
        plan: SubscriptionPlan;
        status: SubscriptionStatus;
        productId: string | null;
        expirationDate: string | null;
        isTrialActive: boolean;
      }>,
    ) {
      state.plan = action.payload.plan;
      state.status = action.payload.status;
      state.productId = action.payload.productId;
      state.expirationDate = action.payload.expirationDate;
      state.isTrialActive = action.payload.isTrialActive;
      state.restoring = false;
    },
    restoreFailure(state, action: PayloadAction<string>) {
      state.restoring = false;
      state.error = action.payload;
    },
    subscriptionUpdated(
      state,
      action: PayloadAction<{
        plan: SubscriptionPlan;
        status: SubscriptionStatus;
        productId: string | null;
        expirationDate: string | null;
        isTrialActive: boolean;
      }>,
    ) {
      state.plan = action.payload.plan;
      state.status = action.payload.status;
      state.productId = action.payload.productId;
      state.expirationDate = action.payload.expirationDate;
      state.isTrialActive = action.payload.isTrialActive;
    },
    setPeriod(state, action: PayloadAction<SubscriptionPeriod>) {
      state.period = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  initSubscription,
  initSubscriptionSuccess,
  initSubscriptionFailure,
  loadOfferings,
  loadOfferingsSuccess,
  purchasePackage,
  purchaseSuccess,
  purchaseFailure,
  restorePurchases,
  restoreSuccess,
  restoreFailure,
  subscriptionUpdated,
  setPeriod,
  clearError,
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
