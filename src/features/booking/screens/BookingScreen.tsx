import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Calendar, type DateData} from 'react-native-calendars';
import DatePicker from 'react-native-date-picker';
import {setDraft, submitBooking, loadTimeSlots} from '../bookingSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<HomeStackParamList>;
}

export default function BookingScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const service = useSelector((state: RootState) => state.services.selected);
  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = service?.provider_id === user?.id;
  const loading = useSelector((state: RootState) => state.booking.loading);
  const availableDates = useSelector((state: RootState) => state.booking.availableDates);
  const availableTimeSlots = useSelector((state: RootState) => state.booking.availableTimeSlots);
  const loadingAvailability = useSelector((state: RootState) => state.booking.loadingAvailability);
  const loadingTimeSlots = useSelector((state: RootState) => state.booking.loadingTimeSlots);

  const bookingSchema = z.object({
    date: z.string().min(1, t('booking.validationDate')).refine(
      v => new Date(v + 'T00:00:00') > new Date(),
      t('booking.validationDateFuture'),
    ),
    timeSlot: z.string().min(1, t('booking.validationTime')),
    notes: z.string().max(500).optional(),
  });

  type BookingFormData = z.infer<typeof bookingSchema>;

  const {control, handleSubmit, setValue, watch, formState: {errors}} = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {date: '', timeSlot: '', notes: ''},
  });

  const selectedDate = watch('date');
  const selectedTime = watch('timeSlot');

  useEffect(() => {
    if (selectedDate && service) {
      setValue('timeSlot', '', {shouldValidate: false});
      dispatch(
        loadTimeSlots({
          serviceId: service.id,
          date: selectedDate,
          durationMinutes: service.duration_minutes,
        }),
      );
    }
  }, [selectedDate, service, dispatch, setValue]);

  const onSubmit = (data: BookingFormData) => {
    if (!service) {return;}
    Alert.alert(
      t('booking.confirmTitle'),
      t('booking.confirmMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('booking.confirmBooking'),
          onPress: () => {
            dispatch(
              setDraft({
                service_id: service.id,
                date: data.date,
                time_slot: data.timeSlot,
                notes: data.notes,
              }),
            );
            dispatch(submitBooking());
            navigation.navigate('BookingConfirm');
          },
        },
      ],
    );
  };

  const today = new Date().toISOString().split('T')[0];

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    availableDates.forEach(date => {
      marks[date] = {
        marked: true,
        dotColor: theme.colors.primary,
      };
    });
    if (selectedDate && marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: theme.colors.surface,
      };
    }
    return marks;
  }, [availableDates, selectedDate]);

  const handleDayPress = (day: DateData) => {
    if (availableDates.includes(day.dateString)) {
      setValue('date', day.dateString, {shouldValidate: true});
    }
  };

  // Time picker state
  const [pickerTime, setPickerTime] = useState(new Date());
  const [timeOpen, setTimeOpen] = useState(false);

  const availableSet = useMemo(
    () => new Set(availableTimeSlots),
    [availableTimeSlots],
  );

  const formatTimeFromSlots = (slot: string) => {
    const [h, m] = slot.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatHHMM = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const findClosestSlot = useCallback(
    (d: Date): string | null => {
      if (availableTimeSlots.length === 0) return null;
      const mins = d.getHours() * 60 + d.getMinutes();
      let closest = availableTimeSlots[0];
      let minDiff = Infinity;
      for (const slot of availableTimeSlots) {
        const [h, m] = slot.split(':').map(Number);
        const diff = Math.abs(h * 60 + m - mins);
        if (diff < minDiff) {
          minDiff = diff;
          closest = slot;
        }
      }
      return closest;
    },
    [availableTimeSlots],
  );

  const handleTimeConfirm = (d: Date) => {
    setTimeOpen(false);
    const hhmm = formatHHMM(d);
    if (availableSet.has(hhmm)) {
      setPickerTime(d);
      setValue('timeSlot', hhmm, {shouldValidate: true});
    } else {
      const closest = findClosestSlot(d);
      if (closest) {
        const closestDate = formatTimeFromSlots(closest);
        setPickerTime(closestDate);
        setValue('timeSlot', closest, {shouldValidate: true});
      }
    }
  };

  if (isOwner) {
    return (
      <View style={styles.ownerBlock}>
        <Text style={styles.ownerBlockText}>{t('services.cannotBookOwn')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {service && (
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceMeta}>
            {t('booking.serviceMeta', {price: service.price, minutes: service.duration_minutes})}
          </Text>
        </View>
      )}

      <Text style={styles.label}>{t('booking.selectDate')}</Text>
      {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}
      {loadingAvailability ? (
        <ActivityIndicator
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : (
        <Calendar
          minDate={today}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          renderArrow={direction => (
            <Text style={{fontSize: 18, color: theme.colors.primaryDark}}>
              {direction === 'left' ? '‹' : '›'}
            </Text>
          )}
          theme={{
            todayTextColor: theme.colors.primaryDark,
            textDisabledColor: theme.colors.border,
            textDayFontSize: 15,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
          style={styles.calendar}
        />
      )}

      <Text style={styles.label}>{t('booking.selectTime')}</Text>
      {errors.timeSlot && (
        <Text style={styles.error}>{errors.timeSlot.message}</Text>
      )}
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
        <View style={styles.timePickerContainer}>
          <TouchableOpacity
            style={[
              styles.timePickerButton,
              selectedTime ? styles.timePickerButtonSelected : null,
            ]}
            onPress={() => setTimeOpen(true)}
            testID="booking-time-picker-button">
            <Text
              style={[
                styles.timePickerButtonText,
                selectedTime
                  ? styles.timePickerButtonTextSelected
                  : styles.timePickerButtonTextPlaceholder,
              ]}>
              {selectedTime || t('booking.tapToSelectTime')}
            </Text>
          </TouchableOpacity>
          {selectedTime && availableSet.has(selectedTime) && (
            <Text style={styles.timeAvailableHint}>
              {t('booking.slotAvailable')}
            </Text>
          )}
          <DatePicker
            modal
            open={timeOpen}
            date={pickerTime}
            mode="time"
            minuteInterval={15}
            onConfirm={handleTimeConfirm}
            onCancel={() => setTimeOpen(false)}
          />
        </View>
      )}

      <Text style={styles.label}>{t('booking.notes')}</Text>
      <Controller
        control={control}
        name="notes"
        render={({field: {onChange, value}}) => (
          <TextInput
            testID="booking-notes-input"
            style={styles.textInput}
            placeholder={t('booking.placeholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        )}
      />

      <TouchableOpacity
        testID="booking-confirm-button"
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <Text style={styles.submitText}>{t('booking.confirmBooking')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ownerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  ownerBlockText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  serviceInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  serviceMeta: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    marginTop: theme.spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  error: {
    fontSize: 13,
    color: '#E53935',
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.sm,
  },
  loader: {
    paddingVertical: theme.spacing.md,
  },
  calendar: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  timePickerContainer: {
    alignItems: 'center',
  },
  timePickerButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  timePickerButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  timePickerButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  timePickerButtonTextSelected: {
    color: theme.colors.surface,
  },
  timePickerButtonTextPlaceholder: {
    color: theme.colors.textSecondary,
  },
  timeAvailableHint: {
    fontSize: 13,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});
