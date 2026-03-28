import { takeLatest, put, call } from 'redux-saga/effects';
import {
  loadAvailabilityForService,
  loadAvailabilityForServiceSuccess,
  loadAvailabilityForServiceFailure,
  saveAvailability,
  saveAvailabilitySuccess,
  saveAvailabilityFailure,
  addBlockedDateRequest,
  addBlockedDateSuccess,
  addBlockedDateFailure,
  removeBlockedDateRequest,
  removeBlockedDateSuccess,
  removeBlockedDateFailure,
} from './availabilitySlice';
import {
  getServiceAvailability,
  getBlockedDates,
  upsertAvailability,
  addBlockedDate,
  removeBlockedDate,
} from '@/lib/supabase';
import type { ServiceAvailability, BlockedDate } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

function* handleLoadAvailability(action: PayloadAction<string>) {
  try {
    const serviceId = action.payload;
    const slots: ServiceAvailability[] = yield call(getServiceAvailability, serviceId);
    const blockedDates: BlockedDate[] = yield call(getBlockedDates, serviceId);
    yield put(loadAvailabilityForServiceSuccess({ slots, blockedDates }));
  } catch (e: any) {
    yield put(loadAvailabilityForServiceFailure(e.message));
  }
}

function* handleSaveAvailability(
  action: PayloadAction<{ serviceId: string; slots: Omit<ServiceAvailability, 'id'>[] }>,
) {
  try {
    const { serviceId, slots } = action.payload;
    const saved: ServiceAvailability[] = yield call(upsertAvailability, serviceId, slots);
    yield put(saveAvailabilitySuccess(saved));
  } catch (e: any) {
    yield put(saveAvailabilityFailure(e.message));
  }
}

function* handleAddBlockedDate(
  action: PayloadAction<{ serviceId: string; date: string; reason?: string }>,
) {
  try {
    const { serviceId, date, reason } = action.payload;
    const blocked: BlockedDate = yield call(addBlockedDate, serviceId, date, reason);
    yield put(addBlockedDateSuccess(blocked));
  } catch {
    yield put(addBlockedDateFailure());
  }
}

function* handleRemoveBlockedDate(action: PayloadAction<string>) {
  try {
    yield call(removeBlockedDate, action.payload);
    yield put(removeBlockedDateSuccess(action.payload));
  } catch {
    yield put(removeBlockedDateFailure());
  }
}

export function* availabilitySaga() {
  yield takeLatest(loadAvailabilityForService.type, handleLoadAvailability);
  yield takeLatest(saveAvailability.type, handleSaveAvailability);
  yield takeLatest(addBlockedDateRequest.type, handleAddBlockedDate);
  yield takeLatest(removeBlockedDateRequest.type, handleRemoveBlockedDate);
}
