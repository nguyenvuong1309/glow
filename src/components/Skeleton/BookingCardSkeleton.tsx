import React from 'react';
import {View, StyleSheet} from 'react-native';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

interface Props {
  count?: number;
}

export default function BookingCardSkeleton({count = 5}: Props) {
  return (
    <View style={styles.container}>
      {Array.from({length: count}).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <Skeleton width="55%" height={16} borderRadius={4} />
            <Skeleton width={70} height={20} borderRadius={theme.radius.full} />
          </View>
          <View style={styles.cardBody}>
            <Skeleton width={120} height={14} borderRadius={4} />
            <Skeleton width={60} height={14} borderRadius={4} />
          </View>
          <Skeleton width="40%" height={13} borderRadius={4} style={styles.mt_sm} />
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
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardBody: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  mt_sm: {marginTop: theme.spacing.sm},
});
