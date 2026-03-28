import {takeLatest, put, call, take, fork} from 'redux-saga/effects';
import {eventChannel, type EventChannel} from 'redux-saga';
import messaging, {
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '@/lib/supabase';
import {navigationRef} from '@/navigation/navigationRef';
import {
  initNotifications,
  requestPermission,
  permissionGranted,
  permissionDenied,
  setFcmToken,
  registerToken,
  unregisterToken,
  showForegroundNotification,
  handleNotificationTap,
} from './notificationSlice';
import {loginSuccess, logout} from '@/features/auth/authSlice';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {NotificationPayload} from '@/types';

function* handleRequestPermission() {
  try {
    const authStatus: FirebaseMessagingTypes.AuthorizationStatus = yield call([
      messaging(),
      messaging().requestPermission,
    ]);
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      yield put(permissionGranted());
      const token: string = yield call([messaging(), messaging().getToken]);
      yield put(setFcmToken(token));
      yield put(registerToken(token));
    } else {
      yield put(permissionDenied());
    }
  } catch {
    yield put(permissionDenied());
  }
}

function* handleRegisterToken(action: PayloadAction<string>) {
  try {
    yield call(registerDeviceToken, action.payload, Platform.OS);
  } catch {
    // Best effort — token registration is non-critical
  }
}

function* handleUnregisterToken() {
  try {
    const token: string = yield call([messaging(), messaging().getToken]);
    yield call(unregisterDeviceToken, token);
    yield call([messaging(), messaging().deleteToken]);
  } catch {
    // Best effort cleanup
  }
}

function createForegroundChannel(): EventChannel<FirebaseMessagingTypes.RemoteMessage> {
  return eventChannel(emit => {
    const unsubscribe = messaging().onMessage(remoteMessage => {
      emit(remoteMessage);
    });
    return unsubscribe;
  });
}

function createTokenRefreshChannel(): EventChannel<string> {
  return eventChannel(emit => {
    const unsubscribe = messaging().onTokenRefresh(token => {
      emit(token);
    });
    return unsubscribe;
  });
}

function* watchForegroundMessages() {
  const channel: EventChannel<FirebaseMessagingTypes.RemoteMessage> =
    yield call(createForegroundChannel);
  while (true) {
    const message: FirebaseMessagingTypes.RemoteMessage = yield take(channel);
    yield put(
      showForegroundNotification({
        title: message.notification?.title ?? '',
        body: message.notification?.body ?? '',
        data: message.data as unknown as NotificationPayload,
      }),
    );
  }
}

function* watchTokenRefresh() {
  const channel: EventChannel<string> = yield call(createTokenRefreshChannel);
  while (true) {
    const newToken: string = yield take(channel);
    yield put(setFcmToken(newToken));
    yield put(registerToken(newToken));
  }
}

function* handleNotificationNavigation(
  action: PayloadAction<NotificationPayload>,
) {
  const data = action.payload;
  if (!navigationRef.isReady()) {
    return;
  }

  if (data?.screen === 'BookingRequests') {
    (navigationRef as any).navigate('MainTabs', {
      screen: 'Profile',
      params: {screen: 'BookingRequests'},
    });
  } else if (data?.screen === 'BookingHistory') {
    (navigationRef as any).navigate('MainTabs', {
      screen: 'Bookings',
      params: {screen: 'BookingHistory'},
    });
  }
}

function* handleInit() {
  try {
    // Check if app was opened from a killed-state notification tap
    const initialNotification: FirebaseMessagingTypes.RemoteMessage | null =
      yield call([messaging(), messaging().getInitialNotification]);
    if (initialNotification?.data) {
      yield put(
        handleNotificationTap(
          initialNotification.data as unknown as NotificationPayload,
        ),
      );
    }

    // Fork foreground and token refresh watchers
    yield fork(watchForegroundMessages);
    yield fork(watchTokenRefresh);
  } catch {
    // Non-critical init failure
  }
}

function* handleLoginSuccess() {
  yield put(requestPermission());
}

function* handleLogout() {
  yield put(unregisterToken());
}

export function* notificationSaga() {
  yield takeLatest(initNotifications.type, handleInit);
  yield takeLatest(requestPermission.type, handleRequestPermission);
  yield takeLatest(registerToken.type, handleRegisterToken);
  yield takeLatest(unregisterToken.type, handleUnregisterToken);
  yield takeLatest(handleNotificationTap.type, handleNotificationNavigation);
  yield takeLatest(loginSuccess.type, handleLoginSuccess);
  yield takeLatest(logout.type, handleLogout);
}
