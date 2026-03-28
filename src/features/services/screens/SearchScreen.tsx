import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ScrollView} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {setFilter, clearFilter, loadFilteredServices, selectService, loadReviews} from '../serviceSlice';
import {toggleFavorite} from '@/features/favorites/favoritesSlice';
import {logEvent, AnalyticsEvents} from '@/lib/analytics';
import {useRequireAuth} from '@/hooks/useRequireAuth';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import {mmkvStorage} from '@/lib/storage';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ServiceStackParamList} from '@/navigation/types';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

const SORT_OPTIONS = [
  {key: 'default', i18nKey: 'search.sortDefault'},
  {key: 'price_asc', i18nKey: 'search.sortPriceAsc'},
  {key: 'price_desc', i18nKey: 'search.sortPriceDesc'},
  {key: 'rating', i18nKey: 'search.sortRating'},
  {key: 'newest', i18nKey: 'search.sortNewest'},
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['key'];

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList>;
}

export default function SearchScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const requireAuth = useRequireAuth();
  const inputRef = useRef<TextInput>(null);

  const {list: services, loading, filter} = useSelector(
    (state: RootState) => state.services,
  );
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const user = useSelector((state: RootState) => state.auth.user);

  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter local state
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('default');

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Load search history from MMKV
  useEffect(() => {
    const loadHistory = async () => {
      const raw = await mmkvStorage.getItem(SEARCH_HISTORY_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSearchHistory(parsed.slice(0, MAX_HISTORY));
          }
        } catch {
          // ignore malformed data
        }
      }
    };
    loadHistory();
  }, []);

  const saveToHistory = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      const updated = [
        trimmed,
        ...searchHistory.filter(item => item !== trimmed),
      ].slice(0, MAX_HISTORY);
      setSearchHistory(updated);
      mmkvStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    },
    [searchHistory],
  );

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    mmkvStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
  }, []);

  const executeSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      setSearchText(trimmed);
      setHasSearched(true);
      saveToHistory(trimmed);
      dispatch(setFilter({searchQuery: trimmed}));
      dispatch(loadFilteredServices());
    },
    [dispatch, saveToHistory],
  );

  const handleSubmit = useCallback(() => {
    executeSearch(searchText);
  }, [executeSearch, searchText]);

  const handleHistoryPress = useCallback(
    (query: string) => {
      executeSearch(query);
      inputRef.current?.blur();
    },
    [executeSearch],
  );

  const handleApplyFilters = useCallback(() => {
    logEvent(AnalyticsEvents.APPLY_FILTER, {
      price_min: priceMin || '0',
      price_max: priceMax || 'any',
      min_rating: String(minRating ?? 0),
      sort_by: sortBy,
    });
    dispatch(
      setFilter({
        priceMin: priceMin ? Number(priceMin) : null,
        priceMax: priceMax ? Number(priceMax) : null,
        minRating,
        sortBy,
      }),
    );
    dispatch(loadFilteredServices());
    setHasSearched(true);
    setFiltersExpanded(false);
  }, [dispatch, priceMin, priceMax, minRating, sortBy]);

  const handleServicePress = useCallback(
    (service: Service) => {
      dispatch(selectService(service));
      dispatch(loadReviews(service.id));
      navigation.navigate('ServiceDetail', {serviceId: service.id});
    },
    [dispatch, navigation],
  );

  const handleToggleFavorite = useCallback(
    (serviceId: string) => {
      if (!requireAuth()) {
        return;
      }
      dispatch(toggleFavorite(serviceId));
    },
    [dispatch, requireAuth],
  );

  // Filter results client-side based on current search text
  const filteredServices = useMemo(() => {
    if (!hasSearched) {
      return [];
    }
    const q = searchText.trim().toLowerCase();
    let result = services;
    if (q) {
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [services, searchText, hasSearched]);

  const showHistory = searchText.trim().length === 0 && !hasSearched;

  const renderServiceItem = useCallback(
    ({item, index}: {item: Service; index: number}) => (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <ServiceCard
          service={item}
          onPress={() => handleServicePress(item)}
          isFavorite={favoriteIds.includes(item.id)}
          onToggleFavorite={() => handleToggleFavorite(item.id)}
          isOwner={item.provider_id === user?.id}
        />
      </Animated.View>
    ),
    [favoriteIds, handleServicePress, handleToggleFavorite, user?.id],
  );

  const renderHeader = () => (
    <>
      {/* Filters Section */}
      <TouchableOpacity
        style={styles.filtersToggle}
        onPress={() => setFiltersExpanded(prev => !prev)}
        activeOpacity={0.7}
        testID="search-filters-toggle">
        <Text style={styles.filtersToggleText}>{t('search.filters')}</Text>
        <Text style={styles.filtersArrow}>{filtersExpanded ? '\u25B2' : '\u25BC'}</Text>
      </TouchableOpacity>

      {filtersExpanded && (
        <Animated.View
          entering={FadeInDown.duration(250)}
          style={styles.filtersContainer}>
          {/* Price Range */}
          <Text style={styles.filterLabel}>{t('search.priceRange')}</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              placeholder={t('search.minPrice')}
              placeholderTextColor={theme.colors.textSecondary}
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="numeric"
              testID="search-price-min"
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder={t('search.maxPrice')}
              placeholderTextColor={theme.colors.textSecondary}
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="numeric"
              testID="search-price-max"
            />
          </View>

          {/* Minimum Rating */}
          <Text style={styles.filterLabel}>{t('search.minRating')}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                style={[
                  styles.starButton,
                  minRating === star && styles.starButtonActive,
                ]}
                onPress={() =>
                  setMinRating(prev => (prev === star ? null : star))
                }
                testID={`search-rating-${star}`}>
                <Text
                  style={[
                    styles.starText,
                    minRating !== null && star <= minRating && styles.starTextActive,
                  ]}>
                  {'\u2605'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <Text style={styles.filterLabel}>{t('search.sortBy')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortChip,
                  sortBy === option.key && styles.sortChipActive,
                ]}
                onPress={() => setSortBy(option.key)}
                testID={`search-sort-${option.key}`}>
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === option.key && styles.sortChipTextActive,
                  ]}>
                  {t(option.i18nKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
            activeOpacity={0.8}
            testID="search-apply-filters">
            <Text style={styles.applyButtonText}>{t('search.apply')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );

  return (
    <View style={styles.container} testID="search-screen">
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          ref={inputRef}
          style={styles.searchBar}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={text => {
            setSearchText(text);
            if (text.trim().length === 0) {
              setHasSearched(false);
            }
          }}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          testID="search-input"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchText('');
              setHasSearched(false);
              inputRef.current?.focus();
            }}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            testID="search-clear">
            <Text style={styles.clearButtonText}>{'\u2715'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search History */}
      {showHistory && searchHistory.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(250)}
          style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{t('search.history')}</Text>
            <TouchableOpacity
              onPress={clearHistory}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              testID="search-clear-history">
              <Text style={styles.clearHistoryText}>
                {t('search.clearHistory')}
              </Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={styles.historyItem}
              onPress={() => handleHistoryPress(item)}
              testID={`search-history-item-${index}`}>
              <Text style={styles.historyIcon}>{'\uD83D\uDD52'}</Text>
              <Text style={styles.historyText} numberOfLines={1}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Results Area */}
      {!showHistory && (
        <FlatList
          data={filteredServices}
          keyExtractor={item => item.id}
          renderItem={renderServiceItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText} testID="search-no-results">
                  {t('search.noResults')}
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  searchBar: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearButton: {
    position: 'absolute',
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  // History
  historyContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clearHistoryText: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  historyIcon: {
    fontSize: 14,
    marginRight: theme.spacing.sm,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },

  // Filters
  filtersToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filtersToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filtersArrow: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },

  // Price Range
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priceInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priceSeparator: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  // Rating
  ratingRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  starButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  starText: {
    fontSize: 18,
    color: theme.colors.border,
  },
  starTextActive: {
    color: theme.colors.surface,
  },

  // Sort
  sortRow: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  sortChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortChipText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  sortChipTextActive: {
    color: theme.colors.surface,
    fontWeight: '600',
  },

  // Apply
  applyButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  applyButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '600',
  },

  // Results
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    paddingTop: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
});
