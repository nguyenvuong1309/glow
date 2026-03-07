import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingScreen from '@/features/onboarding/screens/OnboardingScreen';
import {useAuthListener} from '@/features/auth/useAuthListener';
import {mmkvStorage} from '@/lib/storage';
import type {RootState} from '@/store';

export default function AppNavigator() {
  useAuthListener();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    mmkvStorage.getItem('onboarding_completed').then(value => {
      setHasSeenOnboarding(value === 'true');
    });
  }, []);

  if (hasSeenOnboarding === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
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
      <MainNavigator />
    </NavigationContainer>
  );
}
