import {combineReducers} from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import homeReducer from '@/features/home/homeSlice';
import serviceReducer from '@/features/services/serviceSlice';
import bookingReducer from '@/features/booking/bookingSlice';
import postServiceReducer from '@/features/postService/postServiceSlice';
import providerReducer from '@/features/provider/providerSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  services: serviceReducer,
  booking: bookingReducer,
  postService: postServiceReducer,
  provider: providerReducer,
  favorites: favoritesReducer,
});

export default rootReducer;
