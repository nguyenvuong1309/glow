import React, {useEffect, useMemo, useState} from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {loadHome} from '../homeSlice';
import {selectService, setFilter, loadReviews} from '@/features/services/serviceSlice';
import {loadAvailability} from '@/features/booking/bookingSlice';
import {loadFavorites, toggleFavorite} from '@/features/favorites/favoritesSlice';
import {loadPromotions, loadUserCoupons} from '@/features/promotions/promotionSlice';
import {useRequireAuth} from '@/hooks/useRequireAuth';
import {logEvent, AnalyticsEvents} from '@/lib/analytics';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import CategoryGrid from '@/components/CategoryGrid/CategoryGrid';
import PromoBanner from '@/components/PromoBanner/PromoBanner';
import type {Banner} from '@/components/PromoBanner/PromoBanner';
import RecentBookingCard from '@/components/RecentBookingCard/RecentBookingCard';
import HomeScreenSkeleton from '@/components/Skeleton/HomeScreenSkeleton';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NavigationProp, CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList, TabParamList} from '@/navigation/types';

type HomeNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NavigationProp<TabParamList>
>;

interface Props {
  navigation: HomeNavProp;
}

export default function HomeScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const requireAuth = useRequireAuth();
  const {
    categories,
    newServices,
    topRatedServices,
    recentBooking,
    loading,
  } = useSelector((state: RootState) => state.home);
  const user = useSelector((state: RootState) => state.auth.user);
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const promotions = useSelector((state: RootState) => state.promotions.promotions);
  const userCoupons = useSelector((state: RootState) => state.promotions.userCoupons);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const welcomeCoupon = useMemo(
    () =>
      userCoupons.find(
        c =>
          c.promotion?.code === 'WELCOME20' &&
          !c.used_at,
      ),
    [userCoupons],
  );

  useEffect(() => {
    dispatch(loadHome());
    dispatch(loadFavorites());
    dispatch(loadPromotions());
    dispatch(loadUserCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && refreshing) {
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(loadHome());
    dispatch(loadFavorites());
    dispatch(loadPromotions());
    dispatch(loadUserCoupons());
  };

  const banners: Banner[] = promotions.length > 0
    ? promotions.map(p => ({
        id: p.id,
        color: p.color,
        title: p.title,
        subtitle: p.description ?? `${p.discount_type === 'percentage' ? p.discount_value + '%' : '$' + p.discount_value} OFF`,
      }))
    : [];

  const handleServicePress = (service: Service) => {
    dispatch(selectService(service));
    dispatch(loadReviews(service.id));
    navigation.navigate('ServiceDetail', {serviceId: service.id});
  };

  const handleCategoryPress = (categoryName: string) => {
    logEvent(AnalyticsEvents.SELECT_CATEGORY, {category: categoryName});
    dispatch(setFilter({categories: [categoryName]}));
    navigation.navigate('Services');
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;
    dispatch(setFilter({searchQuery: searchText.trim()}));
    navigation.navigate('Services');
  };

  const handleToggleFavorite = (serviceId: string) => {
    if (!requireAuth()) return;
    dispatch(toggleFavorite(serviceId));
  };

  const handleBookAgain = () => {
    if (!recentBooking) return;
    if (!requireAuth()) return;
    dispatch(loadAvailability(recentBooking.service_id));
    navigation.navigate('Booking', {serviceId: recentBooking.service_id});
  };

  if (loading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} testID="home-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }>

        {/* Greeting */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.greeting} testID="home-greeting">
            {t('home.greeting', {name: user?.name ?? t('home.defaultName')})}
          </Text>
          <Text style={styles.subtitle} testID="home-subtitle">{t('home.whatWouldYouLike')}</Text>
        </Animated.View>

        {/* Welcome Coupon Banner */}
        {welcomeCoupon && (
          <Animated.View entering={FadeInDown.duration(500).delay(25)}>
            <TouchableOpacity
              style={styles.welcomeBanner}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Services')}
              testID="home-welcome-banner">
              <View style={styles.welcomeBannerContent}>
                <Text style={styles.welcomeBannerEmoji}>{'\u{1F389}'}</Text>
                <View style={styles.welcomeBannerTextContainer}>
                  <Text style={styles.welcomeBannerTitle}>
                    {t('home.welcomeBanner')}
                  </Text>
                  <Text style={styles.welcomeBannerAction}>
                    {t('home.welcomeBannerAction')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Recent Booking */}
        {recentBooking && (
          <Animated.View entering={FadeInDown.duration(500).delay(50)}>
            <RecentBookingCard
              booking={recentBooking}
              onBookAgain={handleBookAgain}
            />
          </Animated.View>
        )}

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <TextInput
            style={styles.searchBar}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            testID="home-search-bar"
          />
        </Animated.View>

        {/* Promo Banner */}
        {banners.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(150)}>
            <PromoBanner banners={banners} />
          </Animated.View>
        )}

        {/* Categories */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={styles.sectionTitle} testID="home-categories-title">{t('home.categories')}</Text>
          <CategoryGrid categories={categories} onPress={handleCategoryPress} />
        </Animated.View>

        {/* New Services */}
        {newServices.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(250)}>
            <Text style={styles.sectionTitle} testID="home-new-services-title">{t('home.newServices')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}>
              {newServices.map(item => (
                <ServiceCard
                  key={item.id}
                  service={item}
                  onPress={() => handleServicePress(item)}
                  horizontal
                  isFavorite={favoriteIds.includes(item.id)}
                  onToggleFavorite={() => handleToggleFavorite(item.id)}
                  isOwner={item.provider_id === user?.id}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Top Rated */}
        {topRatedServices.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Text style={styles.sectionTitle} testID="home-top-rated-title">{t('home.topRated')}</Text>
            {topRatedServices.slice(0, 3).map(item => (
              <ServiceCard
                key={item.id}
                service={item}
                onPress={() => handleServicePress(item)}
                featured
                isFavorite={favoriteIds.includes(item.id)}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                isOwner={item.provider_id === user?.id}
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  horizontalList: {
    paddingBottom: theme.spacing.md,
  },
  welcomeBanner: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  welcomeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeBannerEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  welcomeBannerTextContainer: {
    flex: 1,
  },
  welcomeBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  welcomeBannerAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});
