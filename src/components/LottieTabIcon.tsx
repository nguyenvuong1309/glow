import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieTabIconProps {
  name: 'home' | 'services' | 'bookings' | 'profile';
  focused: boolean;
}

const iconMap = {
  home: require('@/assets/lottie/tab-home.json'),
  services: require('@/assets/lottie/tab-services.json'),
  bookings: require('@/assets/lottie/tab-bookings.json'),
  profile: require('@/assets/lottie/tab-profile.json'),
};

export default function LottieTabIcon({ name, focused }: LottieTabIconProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (focused && animationRef.current) {
      // Play animation when tab becomes focused
      animationRef.current.play();
    }
  }, [focused]);

  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        ref={animationRef}
        source={iconMap[name]}
        autoPlay={focused}
        loop={false}
        style={{ width: 28, height: 28 }}
      />
    </View>
  );
}
