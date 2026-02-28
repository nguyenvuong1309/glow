import {combineReducers} from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import homeReducer from '@/features/home/homeSlice';
import serviceReducer from '@/features/services/serviceSlice';
import bookingReducer from '@/features/booking/bookingSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  services: serviceReducer,
  booking: bookingReducer,
});

export default rootReducer;
