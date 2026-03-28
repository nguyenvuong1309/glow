import {takeLatest, put, call} from 'redux-saga/effects';
import {
  googleLoginRequest,
  appleLoginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logout,
  deleteAccountRequest,
  deleteAccountSuccess,
  deleteAccountFailure,
} from './authSlice';
import {unregisterToken} from '@/features/notifications/notificationSlice';
import {loadUserCoupons} from '@/features/promotions/promotionSlice';
import {initSubscription} from '@/features/subscription/subscriptionSlice';
import {supabase, deleteUserAccount} from '@/lib/supabase';
import {logEvent, AnalyticsEvents} from '@/lib/analytics';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID} from '@env';
import type {User} from '@/types';
import type {Session} from '@supabase/supabase-js';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
});

function mapSessionToUser(session: Session): User {
  const {user} = session;
  return {
    id: user.id,
    name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split('@')[0] ??
      'User',
    email: user.email ?? '',
    avatar_url: user.user_metadata?.avatar_url,
  };
}

function* handleGoogleLogin() {
  try {
    yield call([GoogleSignin, GoogleSignin.hasPlayServices]);
    const response: Awaited<ReturnType<typeof GoogleSignin.signIn>> =
      yield call([GoogleSignin, GoogleSignin.signIn]);

    if (!response.data?.idToken) {
      yield put(loginFailure('Google sign-in failed: no ID token'));
      return;
    }

    const {data, error}: Awaited<
      ReturnType<typeof supabase.auth.signInWithIdToken>
    > = yield call([supabase.auth, supabase.auth.signInWithIdToken], {
      provider: 'google',
      token: response.data.idToken,
    });

    if (error || !data.session) {
      yield put(loginFailure(error?.message ?? 'Google sign-in failed'));
      return;
    }

    yield put(loginSuccess(mapSessionToUser(data.session)));
    yield put(loadUserCoupons());
    yield put(initSubscription());
    yield call(logEvent, AnalyticsEvents.LOGIN, {method: 'google'});
  } catch (err: any) {
    yield put(loginFailure(err?.message ?? 'Google sign-in failed'));
  }
}

function* handleAppleLogin() {
  try {
    const appleAuthResponse: Awaited<
      ReturnType<typeof appleAuth.performRequest>
    > = yield call([appleAuth, appleAuth.performRequest], {
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    if (!appleAuthResponse.identityToken) {
      yield put(loginFailure('Apple sign-in failed: no identity token'));
      return;
    }

    const {data, error}: Awaited<
      ReturnType<typeof supabase.auth.signInWithIdToken>
    > = yield call([supabase.auth, supabase.auth.signInWithIdToken], {
      provider: 'apple',
      token: appleAuthResponse.identityToken,
      nonce: appleAuthResponse.nonce,
    });

    if (error || !data.session) {
      yield put(loginFailure(error?.message ?? 'Apple sign-in failed'));
      return;
    }

    const user = mapSessionToUser(data.session);
    // Apple only provides the name on first sign-in
    if (appleAuthResponse.fullName) {
      const {givenName, familyName} = appleAuthResponse.fullName;
      if (givenName || familyName) {
        user.name = [givenName, familyName].filter(Boolean).join(' ');
      }
    }

    yield put(loginSuccess(user));
    yield put(loadUserCoupons());
    yield put(initSubscription());
    yield call(logEvent, AnalyticsEvents.LOGIN, {method: 'apple'});
  } catch (err: any) {
    yield put(loginFailure(err?.message ?? 'Apple sign-in failed'));
  }
}

function* handleLogout() {
  try {
    yield call(logEvent, AnalyticsEvents.LOGOUT);
    yield call([supabase.auth, supabase.auth.signOut]);
    yield put(logout());
  } catch {
    yield put(logout());
  }
}

function* handleDeleteAccount() {
  try {
    yield call(logEvent, AnalyticsEvents.DELETE_ACCOUNT);
    yield put(unregisterToken());
    yield call(deleteUserAccount);
    yield call([supabase.auth, supabase.auth.signOut]);
    yield put(deleteAccountSuccess());
  } catch (err: any) {
    yield put(deleteAccountFailure(err?.message ?? 'Failed to delete account'));
  }
}

export function* authSaga() {
  yield takeLatest(googleLoginRequest.type, handleGoogleLogin);
  yield takeLatest(appleLoginRequest.type, handleAppleLogin);
  yield takeLatest(logoutRequest.type, handleLogout);
  yield takeLatest(deleteAccountRequest.type, handleDeleteAccount);
}
