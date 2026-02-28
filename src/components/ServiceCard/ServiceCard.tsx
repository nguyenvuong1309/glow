import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated from 'react-native-reanimated';
import {theme} from '@/utils/theme';
import type {Service} from '@/types';

interface Props {
  service: Service;
  onPress: () => void;
  horizontal?: boolean;
}

export default function ServiceCard({service, onPress, horizontal}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.cardHorizontal]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Animated.Image
        source={{uri: service.image_url}}
        style={[styles.image, horizontal && styles.imageHorizontal]}
        sharedTransitionTag={`service-image-${service.id}`}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {service.name}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.price}>${service.price}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.duration}>{service.duration_minutes} min</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.rating}>★ {service.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
});
