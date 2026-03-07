import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import type {
  HomeStackParamList,
  ServiceStackParamList,
  BookingStackParamList,
  ProfileStackParamList,
  TabParamList,
} from './types';
import HomeScreen from '@/features/home/screens/HomeScreen';
import ServiceListScreen from '@/features/services/screens/ServiceListScreen';
import ServiceDetailScreen from '@/features/services/screens/ServiceDetailScreen';
import BookingScreen from '@/features/booking/screens/BookingScreen';
import BookingConfirmScreen from '@/features/booking/screens/BookingConfirmScreen';
import BookingHistoryScreen from '@/features/booking/screens/BookingHistoryScreen';
import ProfileScreen from '@/features/profile/ProfileScreen';
import PostServiceScreen from '@/features/postService/screens/PostServiceScreen';
import BookingRequestsScreen from '@/features/booking/screens/BookingRequestsScreen';
import MyServicesScreen from '@/features/postService/screens/MyServicesScreen';
import ProviderDashboardScreen from '@/features/provider/screens/ProviderDashboardScreen';
import ReviewScreen from '@/features/booking/screens/ReviewScreen';
import SpendingScreen from '@/features/booking/screens/SpendingScreen';
import FavoritesScreen from '@/features/favorites/screens/FavoritesScreen';
import ProviderProfileScreen from '@/features/provider/screens/ProviderProfileScreen';
import {theme} from '@/utils/theme';

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ServiceStack = createNativeStackNavigator<ServiceStackParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackScreen() {
  const {t} = useTranslation();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: '600'},
      }}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{title: t('navigation.serviceDetails')}}
      />
      <HomeStack.Screen
        name="Booking"
        component={BookingScreen}
        options={{title: t('navigation.bookAppointment')}}
      />
      <HomeStack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ProviderProfile"
        component={ProviderProfileScreen}
        options={{title: t('navigation.profile')}}
      />
      <HomeStack.Screen
        name="PostService"
        component={PostServiceScreen}
        options={{title: t('navigation.postService')}}
      />
    </HomeStack.Navigator>
  );
}

function ServiceStackScreen() {
  const {t} = useTranslation();
  return (
    <ServiceStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: '600'},
      }}>
      <ServiceStack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={{title: t('navigation.services')}}
      />
      <ServiceStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{title: t('navigation.serviceDetails')}}
      />
      <ServiceStack.Screen
        name="Booking"
        component={BookingScreen}
        options={{title: t('navigation.bookAppointment')}}
      />
      <ServiceStack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{headerShown: false}}
      />
      <ServiceStack.Screen
        name="ProviderProfile"
        component={ProviderProfileScreen}
        options={{title: t('navigation.profile')}}
      />
      <ServiceStack.Screen
        name="PostService"
        component={PostServiceScreen}
        options={{title: t('navigation.postService')}}
      />
    </ServiceStack.Navigator>
  );
}

function BookingStackScreen() {
  const {t} = useTranslation();
  return (
    <BookingStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: '600'},
      }}>
      <BookingStack.Screen
        name="BookingHistory"
        component={BookingHistoryScreen}
        options={{title: t('navigation.myBookings')}}
      />
      <BookingStack.Screen
        name="Review"
        component={ReviewScreen}
        options={{title: t('navigation.writeReview')}}
      />
      <BookingStack.Screen
        name="Spending"
        component={SpendingScreen}
        options={{title: t('navigation.spending')}}
      />
    </BookingStack.Navigator>
  );
}

function ProfileStackScreen() {
  const {t} = useTranslation();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: '600'},
      }}>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{title: t('navigation.profile')}}
      />
      <ProfileStack.Screen
        name="Dashboard"
        component={ProviderDashboardScreen}
        options={{title: t('navigation.dashboard')}}
      />
      <ProfileStack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{title: t('navigation.favorites')}}
      />
      <ProfileStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{title: t('navigation.serviceDetails')}}
      />
      <ProfileStack.Screen
        name="MyServices"
        component={MyServicesScreen}
        options={{title: t('navigation.myServices')}}
      />
      <ProfileStack.Screen
        name="PostService"
        component={PostServiceScreen}
        options={{title: t('navigation.postService')}}
      />
      <ProfileStack.Screen
        name="BookingRequests"
        component={BookingRequestsScreen}
        options={{title: t('navigation.bookingRequests')}}
      />
      <ProfileStack.Screen
        name="ProviderProfile"
        component={ProviderProfileScreen}
        options={{title: t('navigation.profile')}}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
  const {t} = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryDark,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{tabBarLabel: t('navigation.home')}}
      />
      <Tab.Screen
        name="Services"
        component={ServiceStackScreen}
        options={{tabBarLabel: t('navigation.services')}}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingStackScreen}
        options={{tabBarLabel: t('navigation.myBookings')}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: t('navigation.profile'),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
