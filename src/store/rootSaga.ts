import {all, fork} from 'redux-saga/effects';
import {authSaga} from '@/features/auth/authSaga';
import {homeSaga} from '@/features/home/homeSaga';
import {serviceSaga} from '@/features/services/serviceSaga';
import {bookingSaga} from '@/features/booking/bookingSaga';
import {postServiceSaga} from '@/features/postService/postServiceSaga';
import {providerSaga} from '@/features/provider/providerSaga';
import {favoritesSaga} from '@/features/favorites/favoritesSaga';
import {notificationSaga} from '@/features/notifications/notificationSaga';
import {promotionSaga} from '@/features/promotions/promotionSaga';
import {profileSaga} from '@/features/profile/profileSaga';
import {availabilitySaga} from '@/features/availability/availabilitySaga';
import {subscriptionSaga} from '@/features/subscription/subscriptionSaga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(homeSaga),
    fork(serviceSaga),
    fork(bookingSaga),
    fork(postServiceSaga),
    fork(providerSaga),
    fork(favoritesSaga),
    fork(notificationSaga),
    fork(promotionSaga),
    fork(profileSaga),
    fork(availabilitySaga),
    fork(subscriptionSaga),
  ]);
}
