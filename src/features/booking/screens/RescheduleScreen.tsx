import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {getDateLocale} from '@/i18n';
import {loadAvailability, loadTimeSlots, rescheduleBooking} from '../bookingSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {BookingStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<BookingStackParamList>;
  route: RouteProp<BookingStackParamList, 'Reschedule'>;
}

export default function RescheduleScreen({navigation, route}: Props) {
  const {bookingId, serviceId} = route.params;
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const booking = useSelector((state: RootState) =>
    state.booking.history.find(b => b.id === bookingId),
  );
  const availableDates = useSelector(
    (state: RootState) => state.booking.availableDates,
  );
  const availableTimeSlots = useSelector(
    (state: RootState) => state.booking.availableTimeSlots,
  );
  const loading = useSelector((state: RootState) => state.booking.loading);
  const loadingAvailability = useSelector(
    (state: RootState) => state.booking.loadingAvailability,
  );
  const loadingTimeSlots = useSelector(
    (state: RootState) => state.booking.loadingTimeSlots,
  );
  const service = useSelector((state: RootState) =>
    state.services.list.find(s => s.id === serviceId),
  );

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    dispatch(loadAvailability(serviceId));
  }, [serviceId, dispatch]);

  useEffect(() => {
    if (selectedDate && service) {
      setSelectedTime('');
      dispatch(
        loadTimeSlots({
          serviceId: service.id,
          date: selectedDate,
          durationMinutes: service.duration_minutes,
        }),
      );
    }
  }, [selectedDate, service, dispatch]);

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(getDateLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {return;}
    Alert.alert(
      t('reschedule.confirmTitle'),
      t('reschedule.confirmMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('reschedule.confirm'),
          onPress: () => {
            dispatch(
              rescheduleBooking({
                bookingId,
                newDate: selectedDate,
                newTimeSlot: selectedTime,
              }),
            );
            Alert.alert(
              t('reschedule.success'),
              t('reschedule.successMessage'),
              [
                {
                  text: t('common.ok'),
                  onPress: () => navigation.goBack(),
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {booking && (
        <View style={styles.originalInfo}>
          <Text style={styles.originalLabel}>
            {t('reschedule.originalDate')}
          </Text>
          <Text style={styles.originalValue}>{formatDate(booking.date)}</Text>
          <Text style={styles.originalLabel}>
            {t('reschedule.originalTime')}
          </Text>
          <Text style={styles.originalValue}>{booking.time_slot}</Text>
        </View>
      )}

      <Text style={styles.label}>{t('reschedule.newDate')}</Text>
      {loadingAvailability ? (
        <ActivityIndicator
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : availableDates.length === 0 ? (
        <Text style={styles.emptyText}>{t('booking.noAvailableDates')}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {availableDates.map(date => (
            <TouchableOpacity
              key={date}
              testID={`reschedule-date-chip-${date}`}
              style={[
                styles.chip,
                selectedDate === date && styles.chipSelected,
              ]}
              onPress={() => setSelectedDate(date)}>
              <Text
                style={[
                  styles.chipText,
                  selectedDate === date && styles.chipTextSelected,
                ]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.label}>{t('reschedule.newTime')}</Text>
      {!selectedDate ? (
        <Text style={styles.emptyText}>{t('booking.selectDateFirst')}</Text>
      ) : loadingTimeSlots ? (
        <ActivityIndicator
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : availableTimeSlots.length === 0 ? (
        <Text style={styles.emptyText}>{t('booking.noAvailableSlots')}</Text>
      ) : (
        <View style={styles.timeGrid}>
          {availableTimeSlots.map(time => (
            <TouchableOpacity
              key={time}
              testID={`reschedule-time-chip-${time}`}
              style={[
                styles.timeChip,
                selectedTime === time && styles.chipSelected,
              ]}
              onPress={() => setSelectedTime(time)}>
              <Text
                style={[
                  styles.chipText,
                  selectedTime === time && styles.chipTextSelected,
                ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        testID="reschedule-confirm-button"
        style={[
          styles.submitButton,
          (!selectedDate || !selectedTime) && styles.submitButtonDisabled,
        ]}
        onPress={handleConfirm}
        disabled={loading || !selectedDate || !selectedTime}>
        {loading ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <Text style={styles.submitText}>{t('reschedule.confirm')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  originalInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  originalLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  originalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.sm,
  },
  loader: {
    paddingVertical: theme.spacing.md,
  },
  chips: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});
