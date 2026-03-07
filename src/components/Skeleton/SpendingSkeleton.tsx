import React from 'react';
import {View, StyleSheet} from 'react-native';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

export default function SpendingSkeleton() {
  return (
    <View style={styles.container}>
      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Skeleton width={100} height={22} borderRadius={4} />
          <Skeleton width={70} height={13} borderRadius={4} style={styles.mt_xs} />
        </View>
        <View style={styles.summaryCard}>
          <Skeleton width={40} height={22} borderRadius={4} />
          <Skeleton width={60} height={13} borderRadius={4} style={styles.mt_xs} />
        </View>
      </View>

      {/* By service section */}
      <Skeleton width={120} height={16} borderRadius={4} style={styles.mt_xl} />
      {Array.from({length: 4}).map((_, i) => (
        <View key={i} style={styles.serviceRow}>
          <View style={styles.serviceInfo}>
            <Skeleton width="60%" height={15} borderRadius={4} />
            <Skeleton width={30} height={13} borderRadius={4} style={styles.mt_xs} />
          </View>
          <Skeleton width={60} height={16} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
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
