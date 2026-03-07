import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { getDateLocale } from '@/i18n';
import { loadBookings, cancelBooking } from '../bookingSlice';
import { theme } from '@/utils/theme';
import type { RootState } from '@/store';
import type { Booking } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '@/navigation/types';
import BookingCardSkeleton from '@/components/Skeleton/BookingCardSkeleton';

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: '#FF9800',
  confirmed: theme.colors.success,
  cancelled: '#E53935',
  completed: '#2196F3',
};

interface Props {
  navigation: NativeStackNavigationProp<BookingStackParamList>;
}

export default function BookingHistoryScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const bookings = useSelector((state: RootState) => state.booking.history);
  const loading = useSelector((state: RootState) => state.booking.loading);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() =>
              setViewMode(v => (v === 'list' ? 'calendar' : 'list'))
            }
            style={styles.headerBtn}
          >
            <Text style={styles.headerButton}>
              {viewMode === 'list'
                ? t('bookingHistory.calendarView')
                : t('bookingHistory.listView')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Spending')}>
            <Text style={styles.headerButton}>{t('spending.title')}</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, t, viewMode]);

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

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      t('bookingHistory.confirmCancel'),
      t('bookingHistory.confirmCancelMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('bookingHistory.cancelBooking'),
          style: 'destructive',
          onPress: () => dispatch(cancelBooking(bookingId)),
        },
      ],
    );
  };

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    bookings.forEach(b => {
      const existing = marks[b.date];
      const dot = { key: b.id, color: STATUS_COLORS[b.status] };
      if (existing) {
        existing.dots.push(dot);
      } else {
        marks[b.date] = { dots: [dot] };
      }
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }
    return marks;
  }, [bookings, selectedDate]);

  const displayBookings =
    viewMode === 'calendar' && selectedDate
      ? bookings.filter(b => b.date === selectedDate)
      : bookings;

  const handleDayPress = (day: DateData) => {
    setSelectedDate(prev => (prev === day.dateString ? null : day.dateString));
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.service_name ?? item.service_id}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
          >
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
      {(item.status === 'pending' || item.status === 'confirmed') && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.cancelButtonText}>
            {t('bookingHistory.cancelBooking')}
          </Text>
        </TouchableOpacity>
      )}
      {item.status === 'completed' && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() =>
            navigation.navigate('Review', {
              bookingId: item.id,
              serviceId: item.service_id,
            })
          }
        >
          <Text style={styles.reviewButtonText}>
            {t('bookingHistory.writeReview')}
          </Text>
        </TouchableOpacity>
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
        displayBookings.length === 0 && viewMode === 'list'
          ? styles.centered
          : styles.listContent
      }
      data={displayBookings}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => dispatch(loadBookings())}
          tintColor={theme.colors.primary}
        />
      }
      ListHeaderComponent={
        viewMode === 'calendar' ? (
          <Calendar
            markedDates={markedDates}
            markingType="multi-dot"
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: theme.colors.background,
              calendarBackground: theme.colors.surface,
              todayTextColor: theme.colors.primaryDark,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#fff',
              arrowColor: theme.colors.primaryDark,
              monthTextColor: theme.colors.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
            }}
            style={styles.calendar}
          />
        ) : null
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {viewMode === 'calendar' && selectedDate
            ? t('bookingHistory.noBookingsOnDate')
            : t('bookingHistory.empty')}
        </Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  headerBtn: {},
  calendar: {
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
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
  cancelButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#E53935',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
  },
  reviewButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  headerButton: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
});
