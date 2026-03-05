import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
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
import {theme} from '@/utils/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ServiceStack = createNativeStackNavigator();
const BookingStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

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
