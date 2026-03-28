import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {SlideInUp, SlideOutUp} from 'react-native-reanimated';
import {useSelector, useDispatch} from 'react-redux';
import {
  dismissForegroundNotification,
  handleNotificationTap,
} from '@/features/notifications/notificationSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';

const AUTO_DISMISS_MS = 4000;

export default function NotificationBanner() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const notification = useSelector(
    (state: RootState) => state.notification.foregroundNotification,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (notification) {
      timerRef.current = setTimeout(() => {
        dispatch(dismissForegroundNotification());
      }, AUTO_DISMISS_MS);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notification, dispatch]);

  if (!notification) {
    return null;
  }

  const onPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (notification.data) {
      dispatch(handleNotificationTap(notification.data));
    }
    dispatch(dismissForegroundNotification());
  };

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={[styles.container, {paddingTop: insets.top + theme.spacing.sm}]}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.9}>
        <View style={styles.indicator} />
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    alignItems: 'center',
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    alignSelf: 'flex-start',
  },
  body: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
});
