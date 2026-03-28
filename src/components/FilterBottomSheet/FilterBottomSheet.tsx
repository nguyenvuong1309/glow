import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {getDateLocale} from '@/i18n';
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

const PICKER_TITLE_KEYS: Record<PickerField, string> = {
  dateFrom: 'filterSheet.dateFrom',
  dateTo: 'filterSheet.dateTo',
  timeFrom: 'filterSheet.timeFrom',
  timeTo: 'filterSheet.timeTo',
};

const FilterBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({categories, filter}, ref) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const snapPoints = useMemo(() => ['70%'], []);

    const [activePicker, setActivePicker] = useState<PickerField | null>(null);
    const [tempPickerValue, setTempPickerValue] = useState<Date>(new Date());

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
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
        return t('filterSheet.selectDate');
      }
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString(getDateLocale(), {
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
            <Text style={styles.title}>{t('filterSheet.title')}</Text>

            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* Category Multi-Select */}
              <Text style={styles.sectionLabel}>{t('filterSheet.category')}</Text>
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
              <Text style={styles.sectionLabel}>{t('filterSheet.dateFrom')}</Text>
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
              <Text style={styles.sectionLabel}>{t('filterSheet.dateTo')}</Text>
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
              <Text style={styles.sectionLabel}>{t('filterSheet.timeFrom')}</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => openPicker('timeFrom')}>
                <Text
                  style={[
                    styles.dateFieldText,
                    filter.timeFrom && styles.dateFieldTextActive,
                  ]}>
                  {filter.timeFrom || t('filterSheet.selectTime')}
                </Text>
              </TouchableOpacity>

              {/* Time To */}
              <Text style={styles.sectionLabel}>{t('filterSheet.timeTo')}</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => openPicker('timeTo')}>
                <Text
                  style={[
                    styles.dateFieldText,
                    filter.timeTo && styles.dateFieldTextActive,
                  ]}>
                  {filter.timeTo || t('filterSheet.selectTime')}
                </Text>
              </TouchableOpacity>
              {/* Price Range */}
              <Text style={styles.sectionLabel}>{t('filterSheet.priceRange')}</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('filterSheet.minPrice')}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  value={filter.priceMin?.toString() ?? ''}
                  onChangeText={v => {
                    const n = v ? Number(v) : null;
                    dispatch(setFilter({priceMin: n}));
                  }}
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('filterSheet.maxPrice')}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  value={filter.priceMax?.toString() ?? ''}
                  onChangeText={v => {
                    const n = v ? Number(v) : null;
                    dispatch(setFilter({priceMax: n}));
                  }}
                />
              </View>

              {/* Minimum Rating */}
              <Text style={styles.sectionLabel}>{t('filterSheet.minRating')}</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    style={[
                      styles.ratingChip,
                      filter.minRating === star && styles.chipSelected,
                    ]}
                    onPress={() =>
                      dispatch(setFilter({minRating: filter.minRating === star ? null : star}))
                    }>
                    <Text
                      style={[
                        styles.ratingChipText,
                        filter.minRating === star && styles.chipTextSelected,
                      ]}>
                      {'\u2605'.repeat(star)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort By */}
              <Text style={styles.sectionLabel}>{t('filterSheet.sortBy')}</Text>
              <View style={styles.chipsWrap}>
                {([
                  {key: 'default', label: t('filterSheet.sortDefault')},
                  {key: 'price_asc', label: t('filterSheet.sortPriceAsc')},
                  {key: 'price_desc', label: t('filterSheet.sortPriceDesc')},
                  {key: 'rating', label: t('filterSheet.sortRating')},
                  {key: 'newest', label: t('filterSheet.sortNewest')},
                ] as const).map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.chip,
                      filter.sortBy === item.key && styles.chipSelected,
                    ]}
                    onPress={() => dispatch(setFilter({sortBy: item.key}))}>
                    <Text
                      style={[
                        styles.chipText,
                        filter.sortBy === item.key && styles.chipTextSelected,
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BottomSheetScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <View style={styles.actionButtonWrap}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApply}>
                  <Text style={styles.applyText}>{t('common.apply')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actionButtonWrap}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}>
                  <Text style={styles.clearText}>{t('common.clear')}</Text>
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
          locale={getDateLocale()}
          title={activePicker ? t(PICKER_TITLE_KEYS[activePicker]) : ''}
          confirmText={t('common.done')}
          cancelText={t('common.cancel')}
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 14,
    color: theme.colors.text,
  },
  priceSeparator: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  ratingChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ratingChipText: {
    fontSize: 12,
    color: '#FF9800',
  },
});

export default FilterBottomSheet;
