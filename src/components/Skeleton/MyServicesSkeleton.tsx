import React from 'react';
import {View, StyleSheet} from 'react-native';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

export default function MyServicesSkeleton() {
  return (
    <View style={styles.container}>
      {Array.from({length: 5}).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton width={80} height={80} borderRadius={0} />
          <View style={styles.cardContent}>
            <Skeleton width="70%" height={16} borderRadius={4} />
            <Skeleton width="40%" height={13} borderRadius={4} style={styles.mt_xs} />
            <View style={styles.meta}>
              <Skeleton width={50} height={14} borderRadius={4} />
              <Skeleton width={60} height={14} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  meta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  mt_xs: {marginTop: theme.spacing.xs},
});
