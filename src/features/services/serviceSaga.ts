import {takeLatest, put, call} from 'redux-saga/effects';
import {loadServices, loadServicesSuccess} from './serviceSlice';
import {getServices} from '@/lib/supabase';
import type {Service} from '@/types';

function* handleLoadServices() {
  const services: Service[] = yield call(getServices);
  yield put(loadServicesSuccess(services));
}

export function* serviceSaga() {
  yield takeLatest(loadServices.type, handleLoadServices);
}
