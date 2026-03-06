import {all, fork} from 'redux-saga/effects';
import {authSaga} from '@/features/auth/authSaga';
import {homeSaga} from '@/features/home/homeSaga';
import {serviceSaga} from '@/features/services/serviceSaga';
import {bookingSaga} from '@/features/booking/bookingSaga';
import {postServiceSaga} from '@/features/postService/postServiceSaga';
import {providerSaga} from '@/features/provider/providerSaga';
import {favoritesSaga} from '@/features/favorites/favoritesSaga';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(homeSaga), fork(serviceSaga), fork(bookingSaga), fork(postServiceSaga), fork(providerSaga), fork(favoritesSaga)]);
}
