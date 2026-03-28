import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {
  loadAvailabilityForService,
  saveAvailability,
  addBlockedDateRequest,
  removeBlockedDateRequest,
} from '../availabilitySlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {ServiceAvailability} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {ProfileStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList>;
  route: RouteProp<ProfileStackParamList, 'Availability'>;
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

interface DaySlot {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

function parseTimeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function formatBlockedDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AvailabilityScreen({route}: Props) {
  const {serviceId} = route.params;
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const {slots, blockedDates, loading, saving} = useSelector(
    (state: RootState) => state.availability,
  );

  const [schedule, setSchedule] = useState<DaySlot[]>(
    Array.from({length: 7}, () => ({
      enabled: false,
      start_time: DEFAULT_START,
      end_time: DEFAULT_END,
    })),
  );

  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerDay, setTimePickerDay] = useState(0);
  const [timePickerField, setTimePickerField] = useState<
    'start_time' | 'end_time'
  >('start_time');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(loadAvailabilityForService(serviceId));
  }, [dispatch, serviceId]);

  useEffect(() => {
    const newSchedule: DaySlot[] = Array.from({length: 7}, () => ({
      enabled: false,
      start_time: DEFAULT_START,
      end_time: DEFAULT_END,
    }));
    slots.forEach(slot => {
      if (slot.day_of_week >= 0 && slot.day_of_week <= 6) {
        newSchedule[slot.day_of_week] = {
          enabled: true,
          start_time: slot.start_time,
          end_time: slot.end_time,
        };
      }
    });
    setSchedule(newSchedule);
  }, [slots]);

  const timePickerDate = useMemo(() => {
    const day = schedule[timePickerDay];
    return parseTimeToDate(day[timePickerField]);
  }, [schedule, timePickerDay, timePickerField]);

  const toggleDay = (dayIndex: number) => {
    setSchedule(prev =>
      prev.map((day, i) =>
        i === dayIndex ? {...day, enabled: !day.enabled} : day,
      ),
    );
    setSaved(false);
  };

  const openTimePicker = (
    dayIndex: number,
    field: 'start_time' | 'end_time',
  ) => {
    setTimePickerDay(dayIndex);
    setTimePickerField(field);
    setTimePickerOpen(true);
  };

  const handleTimeConfirm = (date: Date) => {
    setTimePickerOpen(false);
    const timeString = formatTime(date);
    setSchedule(prev =>
      prev.map((day, i) =>
        i === timePickerDay ? {...day, [timePickerField]: timeString} : day,
      ),
    );
    setSaved(false);
  };

  const handleSave = () => {
    const slotsToSave: Omit<ServiceAvailability, 'id'>[] = schedule
      .map((day, index) => ({
        service_id: serviceId,
        day_of_week: index,
        start_time: day.start_time,
        end_time: day.end_time,
        enabled: day.enabled,
      }))
      .filter(s => s.enabled)
      .map(({enabled: _, ...rest}) => rest);

    dispatch(saveAvailability({serviceId, slots: slotsToSave}));
    setSaved(true);
  };

  const handleAddBlockedDate = (date: Date) => {
    setDatePickerOpen(false);
    const iso = date.toISOString().split('T')[0];
    dispatch(addBlockedDateRequest({serviceId, date: iso}));
  };

  const handleRemoveBlockedDate = (id: string) => {
    Alert.alert(
      t('common.cancel'),
      '',
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.done'),
          style: 'destructive',
          onPress: () => dispatch(removeBlockedDateRequest(id)),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      {/* Weekly Schedule */}
      <Text style={styles.sectionTitle}>{t('availability.weeklySchedule')}</Text>
      <View style={styles.scheduleCard}>
        {schedule.map((day, index) => (
          <View key={index} style={styles.dayRow}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>
                {t(`availability.days.${DAY_KEYS[index]}`)}
              </Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>
                  {day.enabled
                    ? t('availability.on')
                    : t('availability.off')}
                </Text>
                <Switch
                  value={day.enabled}
                  onValueChange={() => toggleDay(index)}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.surface}
                />
              </View>
            </View>
            {day.enabled && (
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => openTimePicker(index, 'start_time')}>
                  <Text style={styles.timeText}>
                    {formatDisplayTime(day.start_time)}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.timeSeparator}>-</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => openTimePicker(index, 'end_time')}>
                  <Text style={styles.timeText}>
                    {formatDisplayTime(day.end_time)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {index < 6 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* Blocked Dates */}
      <Text style={styles.sectionTitle}>{t('availability.blockedDates')}</Text>
      <View style={styles.scheduleCard}>
        {blockedDates.length === 0 ? (
          <Text style={styles.emptyText}>
            {t('availability.noBlockedDates')}
          </Text>
        ) : (
          blockedDates.map(item => (
            <View key={item.id} style={styles.blockedRow}>
              <View style={styles.blockedInfo}>
                <Text style={styles.blockedDate}>
                  {formatBlockedDate(item.blocked_date)}
                </Text>
                {item.reason ? (
                  <Text style={styles.blockedReason}>{item.reason}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveBlockedDate(item.id)}>
                <Text style={styles.deleteText}>x</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <TouchableOpacity
          style={styles.addBlockedButton}
          onPress={() => setDatePickerOpen(true)}>
          <Text style={styles.addBlockedText}>
            {t('availability.addBlockedDate')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>
            {saved ? t('availability.saved') : t('availability.save')}
          </Text>
        )}
      </TouchableOpacity>

      {/* Time Picker Modal */}
      <DatePicker
        modal
        open={timePickerOpen}
        date={timePickerDate}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerOpen(false)}
      />

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={datePickerOpen}
        date={new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={handleAddBlockedDate}
        onCancel={() => setDatePickerOpen(false)}
      />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  scheduleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayRow: {
    paddingVertical: theme.spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  toggleLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  timeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  timeSeparator: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  blockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  blockedInfo: {
    flex: 1,
  },
  blockedDate: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  blockedReason: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: '#E5393520',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  addBlockedButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addBlockedText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
