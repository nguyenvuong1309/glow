import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useDispatch, useSelector} from 'react-redux';
import {loadServices, selectService} from '../serviceSlice';
import FilterBottomSheet from '@/components/FilterBottomSheet/FilterBottomSheet';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NavigationProp} from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

export default function ServiceListScreen({navigation}: Props) {
  const dispatch = useDispatch();
  const {list: services, loading, filter} = useSelector(
    (state: RootState) => state.services,
  );
  const {categories} = useSelector((state: RootState) => state.home);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (services.length === 0) {
      dispatch(loadServices());
    }
  }, [dispatch, services.length]);

  const handleServicePress = (service: Service) => {
    dispatch(selectService(service));
    navigation.navigate('ServiceDetail', {serviceId: service.id});
  };

  const handleOpenFilter = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(prev =>
      prev === categoryName ? null : categoryName,
    );
  };

  // Client-side filter by selected category chip
  const filteredServices = useMemo(() => {
    if (!selectedCategory) {
      return services;
    }
    return services.filter(s => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const hasActiveFilter =
    filter.categories.length > 0 ||
    filter.dateFrom !== null ||
    filter.dateTo !== null ||
    filter.timeFrom !== null ||
    filter.timeTo !== null;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Chips + Filter Button */}
      <View style={styles.categoryRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChips}>
          <TouchableOpacity
            style={[
              styles.chip,
              selectedCategory === null && styles.chipSelected,
            ]}
            onPress={() => setSelectedCategory(null)}>
            <Text
              style={[
                styles.chipText,
                selectedCategory === null && styles.chipTextSelected,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                selectedCategory === cat.name && styles.chipSelected,
              ]}
              onPress={() => handleCategoryPress(cat.name)}>
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat.name && styles.chipTextSelected,
                ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilter && styles.filterButtonActive,
          ]}
          onPress={handleOpenFilter}>
          <Text
            style={[
              styles.filterButtonText,
              hasActiveFilter && styles.filterButtonTextActive,
            ]}>
            Filter{hasActiveFilter ? ' \u25CF' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Service List */}
      {filteredServices.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No services found</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredServices}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          itemLayoutAnimation={LinearTransition.springify()
            .damping(18)
            .stiffness(120)}
          renderItem={({item, index}) => (
            <Animated.View
              entering={FadeInDown.duration(300).delay(index * 60)}
              exiting={FadeOutUp.duration(200)}>
              <ServiceCard
                service={item}
                onPress={() => handleServicePress(item)}
              />
            </Animated.View>
          )}
        />
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        ref={bottomSheetRef}
        categories={categories}
        filter={filter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryChips: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
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
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterButtonTextActive: {
    color: theme.colors.surface,
  },
  list: {
    padding: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
