import React from 'react';
import {View, StyleSheet} from 'react-native';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

export default function ProviderProfileSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={88} height={88} borderRadius={44} />
        <Skeleton width={160} height={22} borderRadius={6} style={styles.mt_md} />
        <Skeleton width={220} height={14} borderRadius={4} style={styles.mt_sm} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {Array.from({length: 3}).map((_, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={styles.statDivider} />}
            <View style={styles.statItem}>
              <Skeleton width={40} height={20} borderRadius={4} />
              <Skeleton width={60} height={12} borderRadius={4} style={styles.mt_xs} />
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Services */}
      <Skeleton width={100} height={18} borderRadius={6} style={styles.sectionTitle} />
      {Array.from({length: 3}).map((_, i) => (
        <View key={i} style={styles.serviceCard}>
          <Skeleton width="100%" height={140} borderRadius={theme.radius.md} />
          <View style={styles.serviceBody}>
            <Skeleton width="65%" height={16} borderRadius={4} />
            <Skeleton width="40%" height={14} borderRadius={4} style={styles.mt_sm} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  serviceCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  serviceBody: {
    padding: theme.spacing.md,
  },
  mt_xs: {marginTop: theme.spacing.xs},
  mt_sm: {marginTop: theme.spacing.sm},
  mt_md: {marginTop: theme.spacing.md},
});
