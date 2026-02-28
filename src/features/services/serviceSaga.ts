import {takeLatest, put, call, select} from 'redux-saga/effects';
import {loadServices, loadServicesSuccess, loadFilteredServices} from './serviceSlice';
import {getServices, getAvailableServices} from '@/lib/supabase';
import type {Service, ServiceFilter} from '@/types';
import type {RootState} from '@/store';

function* handleLoadServices() {
  const services: Service[] = yield call(getServices);
  yield put(loadServicesSuccess(services));
}

function* handleLoadFilteredServices() {
  const filter: ServiceFilter = yield select(
    (state: RootState) => state.services.filter,
  );
  const services: Service[] = yield call(getAvailableServices, filter);
  yield put(loadServicesSuccess(services));
}

export function* serviceSaga() {
  yield takeLatest(loadServices.type, handleLoadServices);
  yield takeLatest(loadFilteredServices.type, handleLoadFilteredServices);
}
