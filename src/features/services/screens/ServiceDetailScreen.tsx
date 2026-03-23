import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ViewToken,
  useWindowDimensions,
} from 'react-native';
import Animated from 'react-native-reanimated';
import ImageViewing from 'react-native-image-viewing';
import Skeleton from '@/components/Skeleton/Skeleton';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toggleFavorite } from '@/features/favorites/favoritesSlice';
import { loadAvailability } from '@/features/booking/bookingSlice';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { theme } from '@/utils/theme';
import type { RootState } from '@/store';
import type { Review } from '@/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ServiceStackParamList } from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList>;
}

export default function ServiceDetailScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const requireAuth = useRequireAuth();
  const { width: screenWidth } = useWindowDimensions();
  const service = useSelector((state: RootState) => state.services.selected);
  const reviews = useSelector((state: RootState) => state.services.reviews);
  const reviewsLoading = useSelector(
    (state: RootState) => state.services.reviewsLoading,
  );
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = service?.provider_id === user?.id;
  const isFavorite = service ? favoriteIds.includes(service.id) : false;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveImageIndex(viewableItems[0].index);
      }
    },
    [],
  );
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderImageItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setGalleryIndex(index);
          setGalleryVisible(true);
        }}
      >
        {index === 0 ? (
          <Animated.Image
            source={{ uri: item }}
            style={[styles.heroImage, { width: screenWidth }]}
            sharedTransitionTag={`service-image-${service?.id}`}
          />
        ) : (
          <Animated.Image
            source={{ uri: item }}
            style={[styles.heroImage, { width: screenWidth }]}
          />
        )}
      </TouchableOpacity>
    ),
    [screenWidth, service?.id],
  );

  const handleToggleFavorite = () => {
    if (!service) return;
    if (!requireAuth()) return;
    dispatch(toggleFavorite(service.id));
  };

  const handleBookNow = () => {
    if (!service) return;
    if (!requireAuth()) return;
    dispatch(loadAvailability(service.id));
    navigation.navigate('Booking', { serviceId: service.id });
  };

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{t('services.serviceNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="service-detail-screen">
      {service.image_urls.length > 0 && (
        <View>
          <FlatList
            data={service.image_urls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={renderImageItem}
          />
          {service.image_urls.length > 1 && (
            <View style={styles.dotRow}>
              {service.image_urls.map((url, i) => (
                <View
                  key={url}
                  style={[
                    styles.dot,
                    i === activeImageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Animated.Text
            style={[styles.name, styles.nameFlex]}
            sharedTransitionTag={`service-name-${service.id}`}
          >
            {service.name}
          </Animated.Text>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="service-detail-favorite-button"
          >
            <Text
              style={[
                styles.detailHeart,
                isFavorite && styles.detailHeartFilled,
              ]}
            >
              {isFavorite ? '\u2764' : '\u2661'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.metaRow}>
          <Animated.Text
            style={styles.price}
            sharedTransitionTag={`service-price-${service.id}`}
          >
            {t('services.price', { price: service.price })}
          </Animated.Text>
          <Text style={styles.metaDot}>{'\u00b7'}</Text>
          <Animated.Text
            style={styles.duration}
            sharedTransitionTag={`service-duration-${service.id}`}
          >
            {t('services.duration', { minutes: service.duration_minutes })}
          </Animated.Text>
          <Text style={styles.metaDot}>{'\u00b7'}</Text>
          <Animated.Text
            style={styles.rating}
            sharedTransitionTag={`service-rating-${service.id}`}
          >
            {t('services.rating', { rating: service.rating })}
          </Animated.Text>
        </View>
        <Text style={styles.category} testID="service-detail-category">{service.category}</Text>

        {service.provider_id && (
          <TouchableOpacity
            style={styles.providerRow}
            onPress={() =>
              navigation.navigate('ProviderProfile', {
                userId: service.provider_id!,
              })
            }
            activeOpacity={0.7}
            testID="service-detail-provider-button"
          >
            {service.provider_avatar ? (
              <Image
                source={{ uri: service.provider_avatar }}
                style={styles.providerAvatar}
              />
            ) : (
              <View style={styles.providerAvatarFallback}>
                <Text style={styles.providerAvatarText}>
                  {service.provider_name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
            <Text style={styles.providerName} numberOfLines={1}>
              {service.provider_name}
            </Text>
            <Text style={styles.providerChevron}>{'>'}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.description} testID="service-detail-description">{service.description}</Text>

        {isOwner ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('PostService', { service })}
          >
            <Text style={styles.editButtonText}>
              {t('services.editService')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookNow}
            testID="service-detail-book-button"
          >
            <Text style={styles.bookButtonText}>{t('services.bookNow')}</Text>
          </TouchableOpacity>
        )}

        {/* Reviews */}
        <View style={styles.reviewsSection} testID="service-detail-reviews-section">
          <Text style={styles.reviewsTitle} testID="service-detail-reviews-title">
            {t('review.reviews')} ({reviews.length})
          </Text>
          {reviewsLoading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Skeleton width={90} height={16} borderRadius={4} />
                    <Skeleton width={70} height={12} borderRadius={4} />
                  </View>
                  <Skeleton
                    width="90%"
                    height={14}
                    borderRadius={4}
                    style={{ marginTop: theme.spacing.sm }}
                  />
                </View>
              ))}
            </>
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviews}>{t('review.noReviews')}</Text>
          ) : (
            reviews.map((review: Review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewStars}>
                    {'\u2605'.repeat(review.rating)}
                    {'\u2606'.repeat(5 - review.rating)}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </View>

      <ImageViewing
        images={service.image_urls.map(url => ({ uri: url }))}
        imageIndex={galleryIndex}
        visible={galleryVisible}
        onRequestClose={() => setGalleryVisible(false)}
      />
    </ScrollView>
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
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  heroImage: {
    height: 280,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  body: {
    padding: theme.spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameFlex: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
  },
  detailHeart: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  detailHeartFilled: {
    color: '#E53935',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  metaDot: {
    marginHorizontal: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  duration: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  rating: {
    fontSize: 15,
    color: theme.colors.text,
  },
  category: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: theme.spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  providerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: theme.spacing.sm,
  },
  providerAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  providerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  providerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  providerChevron: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  bookButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  editButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  reviewsSection: {
    marginTop: theme.spacing.xl,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  reviewsLoader: {
    marginTop: theme.spacing.md,
  },
  noReviews: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStars: {
    fontSize: 16,
    color: '#FFC107',
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reviewComment: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
});
