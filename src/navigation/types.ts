import type {Service} from '@/types';

export type HomeStackParamList = {
  HomeMain: undefined;
  ServiceDetail: {serviceId: string};
  Booking: {serviceId: string};
  BookingConfirm: undefined;
  ProviderProfile: {userId: string};
  PostService: {service?: Service} | undefined;
};

export type ServiceStackParamList = {
  ServiceList: undefined;
  ServiceDetail: {serviceId: string};
  Booking: {serviceId: string};
  BookingConfirm: undefined;
  ProviderProfile: {userId: string};
  PostService: {service?: Service} | undefined;
};

export type BookingStackParamList = {
  BookingHistory: undefined;
  Review: {bookingId: string; serviceId: string};
  Spending: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Dashboard: undefined;
  Favorites: undefined;
  MyServices: undefined;
  PostService: {service?: Service} | undefined;
  BookingRequests: undefined;
  ServiceDetail: {serviceId: string};
  ProviderProfile: {userId: string};
};

export type TabParamList = {
  Home: undefined;
  Services: undefined;
  Bookings: undefined;
  Profile: undefined;
};
