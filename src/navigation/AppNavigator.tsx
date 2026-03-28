import React, {useCallback, useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import OnboardingScreen from '@/features/onboarding/screens/OnboardingScreen';
import {useAuthListener} from '@/features/auth/useAuthListener';
import {useDevAuthDeepLink} from '@/features/auth/useDevAuthDeepLink';
import {mmkvStorage} from '@/lib/storage';
import {logScreenView} from '@/lib/analytics';
import {navigationRef} from './navigationRef';
import type {RootStackParamList} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  useAuthListener();
  useDevAuthDeepLink();
  const routeNameRef = useRef<string | undefined>();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    mmkvStorage.getItem('onboarding_completed').then(value => {
      setHasSeenOnboarding(value === 'true');
    });
  }, []);

  const onNavigationReady = useCallback(() => {
    const currentRoute = navigationRef.getCurrentRoute();
    routeNameRef.current = currentRoute?.name;
    if (currentRoute?.name) {
      logScreenView(currentRoute.name);
    }
  }, []);

  const onNavigationStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current;
    const currentRoute = navigationRef.getCurrentRoute();
    const currentRouteName = currentRoute?.name;

    if (currentRouteName && currentRouteName !== previousRouteName) {
      logScreenView(currentRouteName);
    }
    routeNameRef.current = currentRouteName;
  }, []);

  if (hasSeenOnboarding === null) {
    return null;
  }

  if (!hasSeenOnboarding) {
    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={onNavigationReady}
        onStateChange={onNavigationStateChange}>
        <OnboardingScreen onComplete={() => setHasSeenOnboarding(true)} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigationReady}
      onStateChange={onNavigationStateChange}>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        <RootStack.Screen name="MainTabs" component={MainNavigator} />
        <RootStack.Group screenOptions={{presentation: 'modal'}}>
          <RootStack.Screen name="Login" component={LoginScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
