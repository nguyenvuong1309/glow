import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import OnboardingScreen from '@/features/onboarding/screens/OnboardingScreen';
import {useAuthListener} from '@/features/auth/useAuthListener';
import {useDevAuthDeepLink} from '@/features/auth/useDevAuthDeepLink';
import {mmkvStorage} from '@/lib/storage';
import type {RootStackParamList} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  useAuthListener();
  useDevAuthDeepLink();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    mmkvStorage.getItem('onboarding_completed').then(value => {
      setHasSeenOnboarding(value === 'true');
    });
  }, []);

  if (hasSeenOnboarding === null) {
    return null;
  }

  if (!hasSeenOnboarding) {
    return (
      <NavigationContainer>
        <OnboardingScreen onComplete={() => setHasSeenOnboarding(true)} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        <RootStack.Screen name="MainTabs" component={MainNavigator} />
        <RootStack.Group screenOptions={{presentation: 'modal'}}>
          <RootStack.Screen name="Login" component={LoginScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
