import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NavigationProp} from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

export default function ServiceDetailScreen({navigation}: Props) {
  const service = useSelector((state: RootState) => state.services.selected);

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Service not found</Text>
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
        <Animated.Text
          style={styles.name}
          sharedTransitionTag={`service-name-${service.id}`}>
          {service.name}
        </Animated.Text>
        <View style={styles.metaRow}>
          <Animated.Text
            style={styles.price}
            sharedTransitionTag={`service-price-${service.id}`}>
            ${service.price}
          </Animated.Text>
          <Text style={styles.dot}>·</Text>
          <Animated.Text
            style={styles.duration}
            sharedTransitionTag={`service-duration-${service.id}`}>
            {service.duration_minutes} min
          </Animated.Text>
          <Text style={styles.dot}>·</Text>
          <Animated.Text
            style={styles.rating}
            sharedTransitionTag={`service-rating-${service.id}`}>
            ★ {service.rating}
          </Animated.Text>
        </View>
        <Text style={styles.category}>{service.category}</Text>
        <Text style={styles.description}>{service.description}</Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate('Booking', {serviceId: service.id})
          }>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
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
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
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
});
