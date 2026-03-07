import {takeLatest, put, call} from 'redux-saga/effects';
import {
  submitService,
  submitServiceSuccess,
  submitServiceFailure,
  loadMyServices,
  loadMyServicesSuccess,
  updateServiceRequest,
  updateServiceSuccess,
  updateServiceFailure,
} from './postServiceSlice';
import type {UpdateServicePayload} from './postServiceSlice';
import {
  createService,
  uploadServiceMedia,
  deleteServiceMedia,
  getMyServices,
  updateService,
} from '@/lib/supabase';
import {loadServices} from '@/features/services/serviceSlice';
import type {Service, SubmitServicePayload} from '@/types';
import type {PayloadAction} from '@reduxjs/toolkit';

function* handleSubmitService(action: PayloadAction<SubmitServicePayload>) {
  const uploadedUrls: string[] = [];
  try {
    const {localMedia, ...rest} = action.payload;

    for (const file of localMedia) {
      const publicUrl: string = yield call(
        uploadServiceMedia,
        file.uri,
        file.fileName,
        file.type,
      );
      uploadedUrls.push(publicUrl);
    }

    const service: Service = yield call(createService, rest, uploadedUrls);
    yield put(submitServiceSuccess(service));
    yield put(loadServices());
  } catch (e: any) {
    if (uploadedUrls.length > 0) {
      yield call(deleteServiceMedia, uploadedUrls);
    }
    yield put(submitServiceFailure(e.message ?? 'Failed to create service'));
  }
}

function* handleLoadMyServices() {
  try {
    const services: Service[] = yield call(getMyServices);
    yield put(loadMyServicesSuccess(services));
  } catch {
    yield put(loadMyServicesSuccess([]));
  }
}

function* handleUpdateService(action: PayloadAction<UpdateServicePayload>) {
  const newUploadedUrls: string[] = [];
  try {
    const {id, localMedia, existingImageUrls, originalImageUrls, ...rest} = action.payload;

    for (const file of localMedia) {
      const publicUrl: string = yield call(
        uploadServiceMedia,
        file.uri,
        file.fileName,
        file.type,
      );
      newUploadedUrls.push(publicUrl);
    }

    const allUrls = [...existingImageUrls, ...newUploadedUrls];
    yield call(updateService, id, rest, allUrls);

    const removedUrls = originalImageUrls.filter(url => !existingImageUrls.includes(url));
    if (removedUrls.length > 0) {
      yield call(deleteServiceMedia, removedUrls);
    }

    yield put(updateServiceSuccess());
    yield put(loadServices());
  } catch (e: any) {
    if (newUploadedUrls.length > 0) {
      yield call(deleteServiceMedia, newUploadedUrls);
    }
    yield put(updateServiceFailure(e.message ?? 'Failed to update service'));
  }
}

export function* postServiceSaga() {
  yield takeLatest(submitService.type, handleSubmitService);
  yield takeLatest(loadMyServices.type, handleLoadMyServices);
  yield takeLatest(updateServiceRequest.type, handleUpdateService);
}
