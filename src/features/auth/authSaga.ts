import {takeLatest, put, delay} from 'redux-saga/effects';
import {loginRequest, loginSuccess} from './authSlice';
import type {User} from '@/types';

function* handleLogin() {
  yield delay(800);
  const mockUser: User = {
    id: 'u1',
    name: 'Sarah',
    email: 'sarah@example.com',
  };
  yield put(loginSuccess(mockUser));
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
}
