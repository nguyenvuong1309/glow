import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {loadServices, selectService, setFilter, loadReviews} from '../serviceSlice';
import {toggleFavorite} from '@/features/favorites/favoritesSlice';
import {useRequireAuth} from '@/hooks/useRequireAuth';
import FilterBottomSheet from '@/components/FilterBottomSheet/FilterBottomSheet';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ServiceStackParamList} from '@/navigation/types';
import ServiceListSkeleton from '@/components/Skeleton/ServiceListSkeleton';

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList>;
}

export default function ServiceListScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const requireAuth = useRequireAuth();
  const {list: services, loading, filter} = useSelector(
    (state: RootState) => state.services,
  );
  const {categories} = useSelector((state: RootState) => state.home);
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(filter.searchQuery ?? '');
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (services.length === 0) {
      dispatch(loadServices());
    }
  }, [dispatch, services.length]);

  useEffect(() => {
    setSearchText(filter.searchQuery ?? '');
  }, [filter.searchQuery]);

  const handleServicePress = (service: Service) => {
    dispatch(selectService(service));
    dispatch(loadReviews(service.id));
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

  const handleSearch = () => {
    dispatch(setFilter({searchQuery: searchText.trim()}));
  };

  const handleToggleFavorite = (serviceId: string) => {
    if (!requireAuth()) return;
    dispatch(toggleFavorite(serviceId));
  };

  // Client-side filter by selected category chip and search query
  const filteredServices = useMemo(() => {
    let result = services;
    if (selectedCategory) {
      result = result.filter(s => s.category === selectedCategory);
    }
    const q = searchText.trim().toLowerCase();
    if (q) {
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [services, selectedCategory, searchText]);

  const renderItem = useCallback(({item, index}: {item: Service; index: number}) => (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 60)}
      exiting={FadeOutUp.duration(200)}>
      <ServiceCard
        service={item}
        onPress={() => handleServicePress(item)}
        isFavorite={favoriteIds.includes(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        isOwner={item.provider_id === user?.id}
      />
    </Animated.View>
  ), [dispatch, favoriteIds, handleServicePress, user?.id]);

  const hasActiveFilter =
    filter.categories.length > 0 ||
    filter.dateFrom !== null ||
    filter.dateTo !== null ||
    filter.timeFrom !== null ||
    filter.timeTo !== null;

  if (loading) {
    return <ServiceListSkeleton />;
  }

  return (
    <View style={styles.container} testID="service-list-screen">
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder={t('home.searchPlaceholder')}
        placeholderTextColor={theme.colors.textSecondary}
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        testID="service-list-search-bar"
      />

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
            onPress={() => setSelectedCategory(null)}
            testID="service-list-category-all">
            <Text
              style={[
                styles.chipText,
                selectedCategory === null && styles.chipTextSelected,
              ]}>
              {t('services.all')}
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                selectedCategory === cat.name && styles.chipSelected,
              ]}
              onPress={() => handleCategoryPress(cat.name)}
              testID={`service-list-category-${cat.name}`}>
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
          onPress={handleOpenFilter}
          testID="service-list-filter-button">
          <Text
            style={[
              styles.filterButtonText,
              hasActiveFilter && styles.filterButtonTextActive,
            ]}>
            {t('services.filter')}{hasActiveFilter ? ' \u25CF' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Service List */}
      {filteredServices.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText} testID="service-list-empty">{t('services.noServicesFound')}</Text>
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
          renderItem={renderItem}
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
  searchBar: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
