import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import {theme} from '@/utils/theme';
import type {Service} from '@/types';

interface Props {
  service: Service;
  onPress: () => void;
  horizontal?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function ServiceCard({service, onPress, horizontal, isFavorite, onToggleFavorite}: Props) {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.cardHorizontal]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View>
        <Animated.Image
          source={{uri: service.image_url}}
          style={[styles.image, horizontal && styles.imageHorizontal]}
          sharedTransitionTag={`service-image-${service.id}`}
        />
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.heartButton}
            onPress={onToggleFavorite}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={[styles.heart, isFavorite && styles.heartFilled]}>
              {isFavorite ? '\u2764' : '\u2661'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.info}>
        <Animated.Text
          style={styles.name}
          numberOfLines={1}
          sharedTransitionTag={`service-name-${service.id}`}>
          {service.name}
        </Animated.Text>
        <View style={styles.meta}>
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
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(ServiceCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  cardHorizontal: {
    width: 200,
    marginRight: theme.spacing.md,
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 160,
  },
  imageHorizontal: {
    height: 120,
  },
  info: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  dot: {
    marginHorizontal: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  duration: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  rating: {
    fontSize: 13,
    color: theme.colors.text,
  },
  heartButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  heartFilled: {
    color: '#E53935',
  },
});
