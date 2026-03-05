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
  getMyServices,
  updateService,
} from '@/lib/supabase';
import {loadServices} from '@/features/services/serviceSlice';
import type {Service, SubmitServicePayload} from '@/types';
import type {PayloadAction} from '@reduxjs/toolkit';

function* handleSubmitService(action: PayloadAction<SubmitServicePayload>) {
  try {
    const {localMedia, ...rest} = action.payload;

    const urls: string[] = [];
    for (const file of localMedia) {
      const publicUrl: string = yield call(
        uploadServiceMedia,
        file.uri,
        file.fileName,
        file.type,
      );
      urls.push(publicUrl);
    }

    const service: Service = yield call(createService, {
      ...rest,
      image_url: urls[0] || '',
    });
    yield put(submitServiceSuccess(service));
    yield put(loadServices());
  } catch (e: any) {
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
  try {
    const {id, localMedia, existingImageUrl, ...rest} = action.payload;

    let imageUrl = existingImageUrl;
    if (localMedia.length > 0) {
      imageUrl = yield call(
        uploadServiceMedia,
        localMedia[0].uri,
        localMedia[0].fileName,
        localMedia[0].type,
      );
    }

    yield call(updateService, id, {...rest, image_url: imageUrl});
    yield put(updateServiceSuccess());
    yield put(loadServices());
  } catch (e: any) {
    yield put(updateServiceFailure(e.message ?? 'Failed to update service'));
  }
}

export function* postServiceSaga() {
  yield takeLatest(submitService.type, handleSubmitService);
  yield takeLatest(loadMyServices.type, handleLoadMyServices);
  yield takeLatest(updateServiceRequest.type, handleUpdateService);
}
