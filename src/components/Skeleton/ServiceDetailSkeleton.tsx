import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

export default function ServiceDetailSkeleton() {
  const {width: screenWidth} = useWindowDimensions();
  return (
    <View style={styles.container}>
      {/* Hero image */}
      <Skeleton width={screenWidth} height={280} borderRadius={0} />

      <View style={styles.body}>
        {/* Name */}
        <Skeleton width="75%" height={26} borderRadius={6} />

        {/* Meta row */}
        <View style={styles.metaRow}>
          <Skeleton width={70} height={18} borderRadius={4} />
          <Skeleton width={80} height={15} borderRadius={4} />
          <Skeleton width={50} height={15} borderRadius={4} />
        </View>

        {/* Category */}
        <Skeleton width={80} height={14} borderRadius={4} style={styles.mt_sm} />

        {/* Provider row */}
        <View style={styles.providerRow}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <Skeleton width={120} height={15} borderRadius={4} />
        </View>

        {/* Description */}
        <Skeleton width="100%" height={14} borderRadius={4} style={styles.mt_md} />
        <Skeleton width="100%" height={14} borderRadius={4} style={styles.mt_xs} />
        <Skeleton width="60%" height={14} borderRadius={4} style={styles.mt_xs} />

        {/* Book button */}
        <Skeleton width="100%" height={50} borderRadius={theme.radius.md} style={styles.mt_xl} />

        {/* Reviews */}
        <Skeleton width={120} height={18} borderRadius={6} style={styles.mt_xl} />
        {Array.from({length: 3}).map((_, i) => (
          <View key={i} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Skeleton width={90} height={16} borderRadius={4} />
              <Skeleton width={70} height={12} borderRadius={4} />
            </View>
            <Skeleton width="90%" height={14} borderRadius={4} style={styles.mt_sm} />
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
  body: {
    padding: theme.spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mt_xs: {marginTop: theme.spacing.xs},
  mt_sm: {marginTop: theme.spacing.sm},
  mt_md: {marginTop: theme.spacing.md},
  mt_xl: {marginTop: theme.spacing.xl},
});
