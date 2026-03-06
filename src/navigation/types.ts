import type {Service} from '@/types';

export type HomeStackParamList = {
  HomeMain: undefined;
  ServiceDetail: {serviceId: string};
  Booking: {serviceId: string};
  BookingConfirm: undefined;
};

export type ServiceStackParamList = {
  ServiceList: undefined;
  ServiceDetail: {serviceId: string};
  Booking: {serviceId: string};
  BookingConfirm: undefined;
};

export type BookingStackParamList = {
  BookingHistory: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  MyServices: undefined;
  PostService: {service?: Service} | undefined;
  BookingRequests: undefined;
};

export type TabParamList = {
  Home: undefined;
  Services: undefined;
  Bookings: undefined;
  Profile: undefined;
};
