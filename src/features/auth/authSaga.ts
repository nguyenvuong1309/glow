import {takeLatest, put, call} from 'redux-saga/effects';
import {
  googleLoginRequest,
  appleLoginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logout,
} from './authSlice';
import {supabase} from '@/lib/supabase';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import type {User} from '@/types';
import type {Session} from '@supabase/supabase-js';

GoogleSignin.configure({
  webClientId:
    '26026437449-3l2kjie93jqjruie44t32jcsg7p1h833.apps.googleusercontent.com',
  iosClientId:
    '26026437449-2nm5l5duuuitm5079odokq5vriep3tuv.apps.googleusercontent.com',
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
  } catch (err: any) {
    yield put(loginFailure(err?.message ?? 'Apple sign-in failed'));
  }
}

function* handleLogout() {
  try {
    yield call([supabase.auth, supabase.auth.signOut]);
    yield put(logout());
  } catch {
    yield put(logout());
  }
}

export function* authSaga() {
  yield takeLatest(googleLoginRequest.type, handleGoogleLogin);
  yield takeLatest(appleLoginRequest.type, handleAppleLogin);
  yield takeLatest(logoutRequest.type, handleLogout);
}
