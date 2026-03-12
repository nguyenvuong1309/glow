import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {googleLoginRequest, appleLoginRequest} from '../authSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';

const googleIcon = require('@/assets/icons/google.png');
const appleIcon = require('@/assets/icons/apple.png');

export default function LoginScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {loadingProvider, error, isAuthenticated} = useSelector(
    (state: RootState) => state.auth,
  );
  const loading = loadingProvider !== null;

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

  useEffect(() => {
    if (isAuthenticated) {
      navigation.goBack();
    }
  }, [isAuthenticated, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {!loading && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.closeText}>{'\u2715'}</Text>
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.header, animatedStyle]}>
        <Text style={styles.logo}>{t('auth.appName')}</Text>
        <Text style={styles.tagline}>{t('auth.tagline')}</Text>
      </Animated.View>

      <Animated.View style={[styles.buttons, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.googleButton,
            loading && loadingProvider !== 'google' && styles.buttonDisabled,
          ]}
          onPress={() => dispatch(googleLoginRequest())}
          disabled={loading}>
          {loadingProvider === 'google' ? (
            <ActivityIndicator size="small" color={theme.colors.text} />
          ) : (
            <Image source={googleIcon} style={styles.buttonIcon} />
          )}
          <Text style={styles.googleText}>
            {loadingProvider === 'google'
              ? t('auth.signingIn')
              : t('auth.continueWithGoogle')}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.appleButton,
              loading && loadingProvider !== 'apple' && styles.buttonDisabled,
            ]}
            onPress={() => dispatch(appleLoginRequest())}
            disabled={loading}>
            {loadingProvider === 'apple' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Image
                source={appleIcon}
                style={styles.buttonIcon}
                tintColor="#FFFFFF"
              />
            )}
            <Text style={styles.appleText}>
              {loadingProvider === 'apple'
                ? t('auth.signingIn')
                : t('auth.continueWithApple')}
            </Text>
          </TouchableOpacity>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.skipText}>{t('auth.skipForNow')}</Text>
          </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.text,
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
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
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
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  skipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
