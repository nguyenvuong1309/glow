import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {User} from '@/types';

type LoginProvider = 'google' | 'apple';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loadingProvider: LoginProvider | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loadingProvider: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    googleLoginRequest(state) {
      state.loadingProvider = 'google';
      state.error = null;
    },
    appleLoginRequest(state) {
      state.loadingProvider = 'apple';
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loadingProvider = null;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loadingProvider = null;
      state.error = action.payload;
    },
    logoutRequest() {},
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loadingProvider = null;
      state.error = null;
    },
    deleteAccountRequest() {},
    deleteAccountSuccess(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loadingProvider = null;
      state.error = null;
    },
    deleteAccountFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const {
  googleLoginRequest,
  appleLoginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logout,
  deleteAccountRequest,
  deleteAccountSuccess,
  deleteAccountFailure,
} = authSlice.actions;
export default authSlice.reducer;
