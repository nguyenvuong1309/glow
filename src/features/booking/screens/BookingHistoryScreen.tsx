import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {getDateLocale} from '@/i18n';
import {loadBookings} from '../bookingSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Booking} from '@/types';

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: '#FF9800',
  confirmed: theme.colors.success,
  cancelled: '#E53935',
};

export default function BookingHistoryScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const bookings = useSelector((state: RootState) => state.booking.history);
  const loading = useSelector((state: RootState) => state.booking.loading);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadBookings());
    }, [dispatch]),
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(getDateLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({item}: {item: Booking}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.service_name ?? item.service_id}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: STATUS_COLORS[item.status] + '20'},
          ]}>
          <Text
            style={[
              styles.statusText,
              {color: STATUS_COLORS[item.status]},
            ]}>
            {t(`bookingHistory.status.${item.status}`)}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.infoText}>{formatDate(item.date)}</Text>
        <Text style={styles.infoText}>{item.time_slot}</Text>
      </View>
      {item.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}
    </View>
  );

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        bookings.length === 0 ? styles.centered : styles.listContent
      }
      data={bookings}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => dispatch(loadBookings())}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('bookingHistory.empty')}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  notes: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
