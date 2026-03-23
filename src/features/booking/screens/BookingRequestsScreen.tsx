import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {getDateLocale} from '@/i18n';
import {loadProviderBookings, updateBookingStatus, completeBooking} from '../bookingSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Booking} from '@/types';
import BookingCardSkeleton from '@/components/Skeleton/BookingCardSkeleton';

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: '#FF9800',
  confirmed: theme.colors.success,
  cancelled: '#E53935',
  completed: '#2196F3',
};

export default function BookingRequestsScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const bookings = useSelector(
    (state: RootState) => state.booking.providerBookings,
  );
  const loading = useSelector(
    (state: RootState) => state.booking.providerLoading,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(loadProviderBookings());
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

  const handleApprove = (bookingId: string) => {
    Alert.alert(
      t('bookingRequests.confirmApprove'),
      t('bookingRequests.confirmApproveMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('bookingRequests.approve'),
          onPress: () =>
            dispatch(updateBookingStatus({bookingId, status: 'confirmed'})),
        },
      ],
    );
  };

  const handleReject = (bookingId: string) => {
    Alert.alert(
      t('bookingRequests.confirmReject'),
      t('bookingRequests.confirmRejectMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('bookingRequests.reject'),
          style: 'destructive',
          onPress: () =>
            dispatch(updateBookingStatus({bookingId, status: 'cancelled'})),
        },
      ],
    );
  };

  const handleComplete = (bookingId: string) => {
    Alert.alert(
      t('bookingRequests.confirmComplete'),
      t('bookingRequests.confirmCompleteMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('bookingRequests.complete'),
          onPress: () => dispatch(completeBooking(bookingId)),
        },
      ],
    );
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
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            testID={`booking-requests-approve-${item.id}`}
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}>
            <Text style={styles.approveText}>
              {t('bookingRequests.approve')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={`booking-requests-reject-${item.id}`}
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}>
            <Text style={styles.rejectText}>
              {t('bookingRequests.reject')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'confirmed' && (
        <View style={styles.actions}>
          <TouchableOpacity
            testID={`booking-requests-complete-${item.id}`}
            style={styles.completeButton}
            onPress={() => handleComplete(item.id)}>
            <Text style={styles.completeText}>
              {t('bookingRequests.complete')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading && bookings.length === 0) {
    return <BookingCardSkeleton />;
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
          onRefresh={() => dispatch(loadProviderBookings())}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('bookingRequests.empty')}</Text>
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  approveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
  },
  approveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: '#E53935',
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
