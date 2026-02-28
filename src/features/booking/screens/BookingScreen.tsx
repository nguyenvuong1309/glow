import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useDispatch, useSelector} from 'react-redux';
import {setDraft, submitBooking} from '../bookingSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NavigationProp} from '@react-navigation/native';

const bookingSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  timeSlot: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function getNextDays(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const AVAILABLE_DATES = getNextDays(5);
const AVAILABLE_TIMES = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00'];

interface Props {
  navigation: NavigationProp<any>;
}

export default function BookingScreen({navigation}: Props) {
  const dispatch = useDispatch();
  const service = useSelector((state: RootState) => state.services.selected);
  const loading = useSelector((state: RootState) => state.booking.loading);

  const {control, handleSubmit, setValue, watch, formState: {errors}} = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {date: '', timeSlot: '', notes: ''},
  });

  const selectedDate = watch('date');
  const selectedTime = watch('timeSlot');

  const onSubmit = (data: BookingFormData) => {
    if (!service) {return;}
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
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {service && (
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceMeta}>
            ${service.price} · {service.duration_minutes} min
          </Text>
        </View>
      )}

      <Text style={styles.label}>Select Date</Text>
      {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        {AVAILABLE_DATES.map(date => (
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

      <Text style={styles.label}>Select Time</Text>
      {errors.timeSlot && (
        <Text style={styles.error}>{errors.timeSlot.message}</Text>
      )}
      <View style={styles.timeGrid}>
        {AVAILABLE_TIMES.map(time => (
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

      <Text style={styles.label}>Notes (optional)</Text>
      <Controller
        control={control}
        name="notes"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={styles.textInput}
            placeholder="Any special requests?"
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
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
          <Text style={styles.submitText}>Confirm Booking</Text>
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
