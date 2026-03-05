import {combineReducers} from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import homeReducer from '@/features/home/homeSlice';
import serviceReducer from '@/features/services/serviceSlice';
import bookingReducer from '@/features/booking/bookingSlice';
import postServiceReducer from '@/features/postService/postServiceSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  services: serviceReducer,
  booking: bookingReducer,
  postService: postServiceReducer,
});

export default rootReducer;
