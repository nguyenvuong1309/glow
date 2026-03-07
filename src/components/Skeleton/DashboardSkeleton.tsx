import React from 'react';
import {View, StyleSheet} from 'react-native';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

export default function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Stats grid */}
      <View style={styles.grid}>
        {Array.from({length: 4}).map((_, i) => (
          <View key={i} style={styles.statCard}>
            <Skeleton width={80} height={22} borderRadius={4} />
            <Skeleton width={60} height={13} borderRadius={4} style={styles.mt_xs} />
          </View>
        ))}
      </View>

      {/* Bar chart section */}
      <Skeleton width={140} height={16} borderRadius={4} style={styles.mt_xl} />
      {Array.from({length: 5}).map((_, i) => (
        <View key={i} style={styles.barRow}>
          <Skeleton width={45} height={13} borderRadius={4} />
          <View style={styles.barTrack}>
            <Skeleton
              width={`${70 - i * 12}%`}
              height={20}
              borderRadius={theme.radius.sm}
            />
          </View>
          <Skeleton width={50} height={13} borderRadius={4} />
        </View>
      ))}

      {/* Top services */}
      <Skeleton width={120} height={16} borderRadius={4} style={styles.mt_xl} />
      {Array.from({length: 3}).map((_, i) => (
        <View key={i} style={styles.serviceRow}>
          <View style={styles.serviceInfo}>
            <Skeleton width="60%" height={15} borderRadius={4} />
            <Skeleton width={80} height={13} borderRadius={4} style={styles.mt_xs} />
          </View>
          <Skeleton width={60} height={16} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  barTrack: {
    flex: 1,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  serviceInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  mt_xs: {marginTop: theme.spacing.xs},
  mt_xl: {marginTop: theme.spacing.xl},
});
