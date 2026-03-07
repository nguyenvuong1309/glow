import React, {useEffect} from 'react';
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
import {getDateLocale} from '@/i18n';
import {setDraft, submitBooking, loadAvailability, loadTimeSlots} from '../bookingSlice';
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
    if (service) {
      dispatch(loadAvailability(service.id));
    }
  }, [dispatch, service]);

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

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(getDateLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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
              style={[
                styles.chip,
                selectedDate === date && styles.chipSelected,
              ]}
              onPress={() => setValue('date', date, {shouldValidate: true})}>
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
        <View style={styles.timeGrid}>
          {availableTimeSlots.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeChip,
                selectedTime === time && styles.chipSelected,
              ]}
              onPress={() => setValue('timeSlot', time, {shouldValidate: true})}>
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

      <Text style={styles.label}>{t('booking.notes')}</Text>
      <Controller
        control={control}
        name="notes"
        render={({field: {onChange, value}}) => (
          <TextInput
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
