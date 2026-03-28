import {takeLatest, put, call, select} from 'redux-saga/effects';
import Purchases, {CustomerInfo, PurchasesOffering} from 'react-native-purchases';
import {Platform} from 'react-native';
import {
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
} from './subscriptionSlice';
import {REVENUECAT_API_KEY_IOS, ENTITLEMENT_IDS} from './subscriptionConfig';
import {syncSubscription} from '@/lib/supabase';
import type {SubscriptionPlan} from './subscriptionTypes';
import type {RootState} from '@/store';
import type {PayloadAction} from '@reduxjs/toolkit';

function extractPlanFromCustomerInfo(customerInfo: CustomerInfo): {
  plan: SubscriptionPlan;
  status: string;
  productId: string | null;
  expirationDate: string | null;
  isTrialActive: boolean;
} {
  if (customerInfo.entitlements.active[ENTITLEMENT_IDS.pro]) {
    const ent = customerInfo.entitlements.active[ENTITLEMENT_IDS.pro];
    return {
      plan: 'pro',
      status: 'active',
      productId: ent.productIdentifier,
      expirationDate: ent.expirationDate,
      isTrialActive: ent.periodType === 'TRIAL',
    };
  }
  if (customerInfo.entitlements.active[ENTITLEMENT_IDS.basic]) {
    const ent = customerInfo.entitlements.active[ENTITLEMENT_IDS.basic];
    return {
      plan: 'basic',
      status: 'active',
      productId: ent.productIdentifier,
      expirationDate: ent.expirationDate,
      isTrialActive: ent.periodType === 'TRIAL',
    };
  }
  return {
    plan: 'free',
    status: 'active',
    productId: null,
    expirationDate: null,
    isTrialActive: false,
  };
}

function* handleInitSubscription() {
  try {
    if (Platform.OS === 'ios') {
      yield call([Purchases, Purchases.configure], {apiKey: REVENUECAT_API_KEY_IOS});
    }

    const userId: string = yield select(
      (state: RootState) => state.auth.user?.id,
    );
    if (userId) {
      yield call([Purchases, Purchases.logIn], userId);
    }

    const customerInfo: CustomerInfo = yield call([
      Purchases,
      Purchases.getCustomerInfo,
    ]);
    const planInfo = extractPlanFromCustomerInfo(customerInfo);
    yield put(initSubscriptionSuccess(planInfo));
  } catch (e: any) {
    yield put(initSubscriptionFailure(e.message ?? 'Failed to init subscription'));
  }
}

function* handleLoadOfferings() {
  try {
    const offerings: {current: PurchasesOffering | null} = yield call([
      Purchases,
      Purchases.getOfferings,
    ]);
    const packages = offerings.current?.availablePackages ?? [];
    yield put(loadOfferingsSuccess(packages));
  } catch {
    yield put(loadOfferingsSuccess([]));
  }
}

function* handlePurchasePackage(action: PayloadAction<string>) {
  try {
    const packageId = action.payload;
    const packages: any[] = yield select(
      (state: RootState) => state.subscription.availablePackages,
    );
    const pkg = packages.find((p: any) => p.identifier === packageId);
    if (!pkg) {
      yield put(purchaseFailure('Package not found'));
      return;
    }

    const {customerInfo}: {customerInfo: CustomerInfo} = yield call(
      [Purchases, Purchases.purchasePackage],
      pkg,
    );
    const planInfo = extractPlanFromCustomerInfo(customerInfo);
    yield call(syncSubscription, planInfo);
    yield put(purchaseSuccess(planInfo));
  } catch (e: any) {
    if (e.userCancelled) {
      yield put(purchaseFailure('Purchase cancelled'));
    } else {
      yield put(purchaseFailure(e.message ?? 'Purchase failed'));
    }
  }
}

function* handleRestorePurchases() {
  try {
    const customerInfo: CustomerInfo = yield call([
      Purchases,
      Purchases.restorePurchases,
    ]);
    const planInfo = extractPlanFromCustomerInfo(customerInfo);
    yield put(restoreSuccess(planInfo));
  } catch (e: any) {
    yield put(restoreFailure(e.message ?? 'Restore failed'));
  }
}

function* watchSubscription() {
  yield takeLatest(initSubscription.type, handleInitSubscription);
  yield takeLatest(loadOfferings.type, handleLoadOfferings);
  yield takeLatest(purchasePackage.type, handlePurchasePackage);
  yield takeLatest(restorePurchases.type, handleRestorePurchases);
}

export function* subscriptionSaga() {
  yield watchSubscription();
}
