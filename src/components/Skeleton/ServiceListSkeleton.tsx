import React from 'react';
import {View, StyleSheet} from 'react-native';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

export default function ServiceListSkeleton() {
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <Skeleton width="100%" height={44} borderRadius={theme.radius.full} style={styles.searchBar} />

      {/* Category chips */}
      <View style={styles.chipRow}>
        {Array.from({length: 5}).map((_, i) => (
          <Skeleton key={i} width={70} height={32} borderRadius={theme.radius.full} />
        ))}
      </View>

      {/* Service cards */}
      <View style={styles.list}>
        {Array.from({length: 4}).map((_, i) => (
          <View key={i} style={styles.card}>
            <Skeleton width="100%" height={160} borderRadius={theme.radius.md} />
            <View style={styles.cardBody}>
              <Skeleton width="70%" height={18} borderRadius={6} />
              <Skeleton width="40%" height={14} borderRadius={4} style={styles.mt_sm} />
              <View style={styles.metaRow}>
                <Skeleton width={60} height={14} borderRadius={4} />
                <Skeleton width={80} height={14} borderRadius={4} />
                <Skeleton width={50} height={14} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  cardBody: {
    padding: theme.spacing.md,
  },
  mt_sm: {marginTop: theme.spacing.sm},
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
});
