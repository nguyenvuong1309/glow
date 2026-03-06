import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {loadReviews} from '../serviceSlice';
import {toggleFavorite} from '@/features/favorites/favoritesSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Review} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ServiceStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList>;
}

export default function ServiceDetailScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const service = useSelector((state: RootState) => state.services.selected);
  const reviews = useSelector((state: RootState) => state.services.reviews);
  const reviewsLoading = useSelector(
    (state: RootState) => state.services.reviewsLoading,
  );
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const isFavorite = service ? favoriteIds.includes(service.id) : false;

  useEffect(() => {
    if (service) {
      dispatch(loadReviews(service.id));
    }
  }, [dispatch, service]);

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{t('services.serviceNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>
      <Animated.Image
        source={{uri: service.image_url}}
        style={styles.heroImage}
        sharedTransitionTag={`service-image-${service.id}`}
      />
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Animated.Text
            style={[styles.name, styles.nameFlex]}
            sharedTransitionTag={`service-name-${service.id}`}>
            {service.name}
          </Animated.Text>
          <TouchableOpacity
            onPress={() => dispatch(toggleFavorite(service.id))}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={[styles.detailHeart, isFavorite && styles.detailHeartFilled]}>
              {isFavorite ? '\u2764' : '\u2661'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.metaRow}>
          <Animated.Text
            style={styles.price}
            sharedTransitionTag={`service-price-${service.id}`}>
            {t('services.price', {price: service.price})}
          </Animated.Text>
          <Text style={styles.dot}>{'\u00b7'}</Text>
          <Animated.Text
            style={styles.duration}
            sharedTransitionTag={`service-duration-${service.id}`}>
            {t('services.duration', {minutes: service.duration_minutes})}
          </Animated.Text>
          <Text style={styles.dot}>{'\u00b7'}</Text>
          <Animated.Text
            style={styles.rating}
            sharedTransitionTag={`service-rating-${service.id}`}>
            {t('services.rating', {rating: service.rating})}
          </Animated.Text>
        </View>
        <Text style={styles.category}>{service.category}</Text>
        <Text style={styles.description}>{service.description}</Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate('Booking', {serviceId: service.id})
          }>
          <Text style={styles.bookButtonText}>{t('services.bookNow')}</Text>
        </TouchableOpacity>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>
            {t('review.reviews')} ({reviews.length})
          </Text>
          {reviewsLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.reviewsLoader}
            />
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
    width: '100%',
    height: 280,
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
  dot: {
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
