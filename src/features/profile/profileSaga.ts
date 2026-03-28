import { takeLatest, put, call } from 'redux-saga/effects';
import { logEvent, AnalyticsEvents } from '@/lib/analytics';
import {
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  uploadAvatarRequest,
  uploadAvatarSuccess,
  uploadAvatarFailure,
} from './profileSlice';
import { loginSuccess } from '@/features/auth/authSlice';
import {
  updateProfile,
  uploadAvatar,
  updateProfileAvatar,
  supabase,
} from '@/lib/supabase';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ProfileUpdatePayload } from '@/types';

function* handleUpdateProfile(action: PayloadAction<ProfileUpdatePayload>) {
  try {
    yield call(updateProfile, action.payload);
    // Refresh user data in auth state
    const { data: { user } }: any = yield call([supabase.auth, supabase.auth.getUser]);
    if (user) {
      const { data: profile }: any = yield call(
        async () => supabase.from('profiles').select('*').eq('id', user.id).single(),
      );
      if (profile) {
        yield put(loginSuccess({
          id: user.id,
          name: profile.name,
          email: user.email ?? '',
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          bio: profile.bio,
          address: profile.address,
        }));
      }
    }
    yield put(updateProfileSuccess());
    yield call(logEvent, AnalyticsEvents.UPDATE_PROFILE);
  } catch (e: any) {
    yield put(updateProfileFailure(e.message));
  }
}

function* handleUploadAvatar(action: PayloadAction<{ uri: string; fileName: string; type: string }>) {
  try {
    const { uri, fileName, type } = action.payload;
    const avatarUrl: string = yield call(uploadAvatar, uri, fileName, type);
    yield call(updateProfileAvatar, avatarUrl);
    // Refresh user data
    const { data: { user } }: any = yield call([supabase.auth, supabase.auth.getUser]);
    if (user) {
      const { data: profile }: any = yield call(
        async () => supabase.from('profiles').select('*').eq('id', user.id).single(),
      );
      if (profile) {
        yield put(loginSuccess({
          id: user.id,
          name: profile.name,
          email: user.email ?? '',
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          bio: profile.bio,
          address: profile.address,
        }));
      }
    }
    yield put(uploadAvatarSuccess());
    yield call(logEvent, AnalyticsEvents.UPLOAD_AVATAR);
  } catch (e: any) {
    yield put(uploadAvatarFailure(e.message));
  }
}

export function* profileSaga() {
  yield takeLatest(updateProfileRequest.type, handleUpdateProfile);
  yield takeLatest(uploadAvatarRequest.type, handleUploadAvatar);
}
