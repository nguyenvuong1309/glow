import type {Service} from '@/types';

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
};

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
  Search: undefined;
};

export type BookingStackParamList = {
  BookingHistory: undefined;
  Review: {bookingId: string; serviceId: string};
  Spending: undefined;
  Reschedule: {bookingId: string; serviceId: string};
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
  EditProfile: undefined;
  Promotions: undefined;
  MyCoupons: undefined;
  Availability: {serviceId: string};
  Subscription: undefined;
  Paywall: {feature: string; requiredPlan: 'basic' | 'pro'};
};

export type TabParamList = {
  Home: undefined;
  Services: undefined;
  Bookings: undefined;
  Profile: undefined;
};
