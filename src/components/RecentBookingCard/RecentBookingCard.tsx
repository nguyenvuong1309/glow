import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {theme} from '@/utils/theme';
import type {Booking} from '@/types';

interface Props {
  booking: Booking;
  onBookAgain: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: theme.colors.success,
  completed: theme.colors.primary,
  pending: '#FF9800',
};

export default function RecentBookingCard({booking, onBookAgain}: Props) {
  const {t} = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {booking.service_name}
            </Text>
            <Text style={styles.meta}>
              {booking.date} · {booking.time_slot}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: STATUS_COLORS[booking.status] ?? theme.colors.textSecondary},
            ]}>
            <Text style={styles.statusText}>
              {t(`bookingHistory.status.${booking.status}`)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={onBookAgain} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{t('home.bookAgain')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  accent: {
    width: 4,
    backgroundColor: theme.colors.primary,
  },
  body: {
    flex: 1,
    padding: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  button: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
