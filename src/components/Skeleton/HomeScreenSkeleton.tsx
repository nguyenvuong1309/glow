import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Skeleton from './Skeleton';
import {theme} from '@/utils/theme';

export default function HomeScreenSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Greeting */}
        <Skeleton width={200} height={28} borderRadius={6} />
        <Skeleton width={260} height={16} borderRadius={6} style={styles.mt_xs} />

        {/* Search bar */}
        <Skeleton width="100%" height={44} borderRadius={999} style={styles.mt_lg} />

        {/* Banner */}
        <Skeleton width="100%" height={160} borderRadius={theme.radius.lg} style={styles.mt_lg} />

        {/* Categories */}
        <Skeleton width={100} height={20} borderRadius={6} style={styles.mt_lg} />
        <View style={styles.categoryRow}>
          {Array.from({length: 5}).map((_, i) => (
            <View key={i} style={styles.categoryItem}>
              <Skeleton width={56} height={56} borderRadius={28} />
              <Skeleton width={48} height={12} borderRadius={4} style={styles.mt_xs} />
            </View>
          ))}
        </View>

        {/* Cards */}
        <Skeleton width={120} height={20} borderRadius={6} style={styles.mt_lg} />
        <View style={styles.cardRow}>
          {Array.from({length: 2}).map((_, i) => (
            <View key={i} style={styles.card}>
              <Skeleton width={200} height={120} borderRadius={theme.radius.md} />
              <Skeleton width={140} height={14} borderRadius={4} style={styles.mt_sm} />
              <Skeleton width={100} height={12} borderRadius={4} style={styles.mt_xs} />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  mt_xs: {marginTop: theme.spacing.xs},
  mt_sm: {marginTop: theme.spacing.sm},
  mt_lg: {marginTop: theme.spacing.lg},
  categoryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  card: {
    width: 200,
  },
});
