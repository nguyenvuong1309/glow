import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {NotificationPayload} from '@/types';

interface ForegroundNotification {
  title: string;
  body: string;
  data?: NotificationPayload;
}

interface NotificationState {
  fcmToken: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  foregroundNotification: ForegroundNotification | null;
}

const initialState: NotificationState = {
  fcmToken: null,
  permissionStatus: 'undetermined',
  foregroundNotification: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    initNotifications() {},
    requestPermission() {},
    permissionGranted(state) {
      state.permissionStatus = 'granted';
    },
    permissionDenied(state) {
      state.permissionStatus = 'denied';
    },
    setFcmToken(state, action: PayloadAction<string>) {
      state.fcmToken = action.payload;
    },
    registerToken(_state, _action: PayloadAction<string>) {},
    unregisterToken() {},
    showForegroundNotification(
      state,
      action: PayloadAction<ForegroundNotification>,
    ) {
      state.foregroundNotification = action.payload;
    },
    dismissForegroundNotification(state) {
      state.foregroundNotification = null;
    },
    handleNotificationTap(
      _state,
      _action: PayloadAction<NotificationPayload>,
    ) {},
  },
});

export const {
  initNotifications,
  requestPermission,
  permissionGranted,
  permissionDenied,
  setFcmToken,
  registerToken,
  unregisterToken,
  showForegroundNotification,
  dismissForegroundNotification,
  handleNotificationTap,
} = notificationSlice.actions;
export default notificationSlice.reducer;
