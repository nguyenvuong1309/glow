import {combineReducers} from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import homeReducer from '@/features/home/homeSlice';
import serviceReducer from '@/features/services/serviceSlice';
import bookingReducer from '@/features/booking/bookingSlice';
import postServiceReducer from '@/features/postService/postServiceSlice';
import providerReducer from '@/features/provider/providerSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';
import notificationReducer from '@/features/notifications/notificationSlice';
import promotionReducer from '@/features/promotions/promotionSlice';
import profileReducer from '@/features/profile/profileSlice';
import availabilityReducer from '@/features/availability/availabilitySlice';
import subscriptionReducer from '@/features/subscription/subscriptionSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  services: serviceReducer,
  booking: bookingReducer,
  postService: postServiceReducer,
  provider: providerReducer,
  favorites: favoritesReducer,
  notification: notificationReducer,
  promotions: promotionReducer,
  profile: profileReducer,
  availability: availabilityReducer,
  subscription: subscriptionReducer,
});

export default rootReducer;
