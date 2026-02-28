import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {googleLoginRequest, appleLoginRequest} from '../authSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const {loading, error} = useSelector((state: RootState) => state.auth);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withTiming(1, {duration: 800});
    translateY.value = withTiming(0, {duration: 800});
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  const buttonOpacity = useSharedValue(0);
  useEffect(() => {
    buttonOpacity.value = withDelay(400, withTiming(1, {duration: 600}));
  }, [buttonOpacity]);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, animatedStyle]}>
        <Text style={styles.logo}>Glow</Text>
        <Text style={styles.tagline}>Your beauty, your schedule</Text>
      </Animated.View>

      <Animated.View style={[styles.buttons, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={() => dispatch(googleLoginRequest())}
          disabled={loading}>
          <Text style={styles.googleText}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.button, styles.appleButton]}
            onPress={() => dispatch(appleLoginRequest())}
            disabled={loading}>
            <Text style={styles.appleText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  buttons: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  appleButton: {
    backgroundColor: theme.colors.text,
  },
  appleText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  errorContainer: {
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#E53935',
    textAlign: 'center',
  },
});
