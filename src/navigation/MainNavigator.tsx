import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '@/features/home/screens/HomeScreen';
import ServiceListScreen from '@/features/services/screens/ServiceListScreen';
import ServiceDetailScreen from '@/features/services/screens/ServiceDetailScreen';
import BookingScreen from '@/features/booking/screens/BookingScreen';
import BookingConfirmScreen from '@/features/booking/screens/BookingConfirmScreen';
import ProfileScreen from '@/features/profile/ProfileScreen';
import {theme} from '@/utils/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ServiceStack = createNativeStackNavigator();

function HomeStackScreen() {
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
        options={{title: 'Service Details'}}
      />
      <HomeStack.Screen
        name="Booking"
        component={BookingScreen}
        options={{title: 'Book Appointment'}}
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
        options={{title: 'Services'}}
      />
      <ServiceStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{title: 'Service Details'}}
      />
      <ServiceStack.Screen
        name="Booking"
        component={BookingScreen}
        options={{title: 'Book Appointment'}}
      />
      <ServiceStack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{headerShown: false}}
      />
    </ServiceStack.Navigator>
  );
}

export default function MainNavigator() {
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
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Services"
        component={ServiceStackScreen}
        options={{tabBarLabel: 'Services'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: true,
          headerTitle: 'Profile',
          headerStyle: {backgroundColor: theme.colors.surface},
        }}
      />
    </Tab.Navigator>
  );
}
