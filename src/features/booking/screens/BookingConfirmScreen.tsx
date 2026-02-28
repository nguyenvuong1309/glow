import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NavigationProp} from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

export default function BookingConfirmScreen({navigation}: Props) {
  const latestBooking = useSelector(
    (state: RootState) => state.booking.history[0],
  );
  const service = useSelector((state: RootState) => state.services.selected);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {damping: 8, stiffness: 120});
    opacity.value = withDelay(300, withTiming(1, {duration: 500}));
  }, [scale, opacity]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const detailsStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.checkCircle, checkmarkStyle]}>
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>

      <Animated.View style={[styles.details, detailsStyle]}>
        <Text style={styles.title}>Booking Confirmed!</Text>

        {service && (
          <Text style={styles.serviceName}>{service.name}</Text>
        )}

        {latestBooking && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(latestBooking.date)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{latestBooking.time_slot}</Text>
            </View>
            {latestBooking.notes && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{latestBooking.notes}</Text>
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
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
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  checkmark: {
    fontSize: 36,
    color: theme.colors.surface,
    fontWeight: '700',
  },
  details: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  serviceName: {
    fontSize: 18,
    color: theme.colors.primaryDark,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  doneButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});
