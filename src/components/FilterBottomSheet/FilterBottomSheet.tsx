import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';
import {useDispatch} from 'react-redux';
import {
  setFilter,
  clearFilter,
  loadFilteredServices,
  loadServices,
} from '@/features/services/serviceSlice';
import {theme} from '@/utils/theme';
import type {Category, ServiceFilter} from '@/types';

interface Props {
  categories: Category[];
  filter: ServiceFilter;
}

type PickerField = 'dateFrom' | 'dateTo' | 'timeFrom' | 'timeTo';

const PICKER_TITLES: Record<PickerField, string> = {
  dateFrom: 'Date From',
  dateTo: 'Date To',
  timeFrom: 'Time From',
  timeTo: 'Time To',
};

const FilterBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({categories, filter}, ref) => {
    const dispatch = useDispatch();
    const snapPoints = useMemo(() => ['70%'], []);

    const [activePicker, setActivePicker] = useState<PickerField | null>(null);
    const [tempPickerValue, setTempPickerValue] = useState<Date>(new Date());

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const toggleCategory = (name: string) => {
      const current = filter.categories;
      const updated = current.includes(name)
        ? current.filter(c => c !== name)
        : [...current, name];
      dispatch(setFilter({categories: updated}));
    };

    const getDateValue = (field: PickerField): Date => {
      if (field === 'dateFrom' || field === 'dateTo') {
        const iso = field === 'dateFrom' ? filter.dateFrom : filter.dateTo;
        if (iso) {
          return new Date(iso + 'T00:00:00');
        }
        return new Date();
      }
      const timeStr = field === 'timeFrom' ? filter.timeFrom : filter.timeTo;
      const d = new Date();
      if (timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        d.setHours(h, m, 0, 0);
      } else {
        d.setHours(9, 0, 0, 0);
      }
      return d;
    };

    const openPicker = (field: PickerField) => {
      setTempPickerValue(getDateValue(field));
      setActivePicker(field);
    };

    const commitValue = (field: PickerField, date: Date) => {
      if (field === 'dateFrom' || field === 'dateTo') {
        const iso = date.toISOString().split('T')[0];
        dispatch(setFilter({[field]: iso}));
      } else {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        dispatch(setFilter({[field]: `${hours}:${minutes}`}));
      }
    };

    const handleConfirm = (date: Date) => {
      if (activePicker) {
        commitValue(activePicker, date);
      }
      setActivePicker(null);
    };

    const handleCancel = () => {
      setActivePicker(null);
    };

    const handleApply = () => {
      dispatch(loadFilteredServices());
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };

    const handleClear = () => {
      dispatch(clearFilter());
      dispatch(loadServices());
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };

    const formatDate = (iso: string | null) => {
      if (!iso) {
        return 'Select date';
      }
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const isDateField = activePicker === 'dateFrom' || activePicker === 'dateTo';

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.handleIndicator}>
          <BottomSheetView style={styles.contentContainer}>
            <Text style={styles.title}>Filter Services</Text>

            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* Category Multi-Select */}
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.chipsWrap}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      filter.categories.includes(cat.name) &&
                        styles.chipSelected,
                    ]}
                    onPress={() => toggleCategory(cat.name)}>
                    <Text
                      style={[
                        styles.chipText,
                        filter.categories.includes(cat.name) &&
                          styles.chipTextSelected,
                      ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date From */}
              <Text style={styles.sectionLabel}>Date From</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => openPicker('dateFrom')}>
                <Text
                  style={[
                    styles.dateFieldText,
                    filter.dateFrom && styles.dateFieldTextActive,
                  ]}>
                  {formatDate(filter.dateFrom)}
                </Text>
              </TouchableOpacity>

              {/* Date To */}
              <Text style={styles.sectionLabel}>Date To</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => openPicker('dateTo')}>
                <Text
                  style={[
                    styles.dateFieldText,
                    filter.dateTo && styles.dateFieldTextActive,
                  ]}>
                  {formatDate(filter.dateTo)}
                </Text>
              </TouchableOpacity>

              {/* Time From */}
              <Text style={styles.sectionLabel}>Time From</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => openPicker('timeFrom')}>
                <Text
                  style={[
                    styles.dateFieldText,
                    filter.timeFrom && styles.dateFieldTextActive,
                  ]}>
                  {filter.timeFrom || 'Select time'}
                </Text>
              </TouchableOpacity>

              {/* Time To */}
              <Text style={styles.sectionLabel}>Time To</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => openPicker('timeTo')}>
                <Text
                  style={[
                    styles.dateFieldText,
                    filter.timeTo && styles.dateFieldTextActive,
                  ]}>
                  {filter.timeTo || 'Select time'}
                </Text>
              </TouchableOpacity>
            </BottomSheetScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <View style={styles.actionButtonWrap}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApply}>
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actionButtonWrap}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* DatePicker modal — native modal, outside BottomSheet gesture context */}
        <DatePicker
          modal
          open={activePicker !== null}
          date={tempPickerValue}
          mode={isDateField ? 'date' : 'time'}
          minimumDate={
            activePicker === 'dateTo' && filter.dateFrom
              ? new Date(filter.dateFrom + 'T00:00:00')
              : isDateField
                ? new Date()
                : undefined
          }
          minuteInterval={!isDateField ? 15 : undefined}
          is24hourSource="locale"
          title={activePicker ? PICKER_TITLES[activePicker] : ''}
          confirmText="Done"
          cancelText="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: theme.colors.border,
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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
    fontSize: 13,
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  dateField: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  dateFieldText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dateFieldTextActive: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  actionButtonWrap: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  clearButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

export default FilterBottomSheet;
