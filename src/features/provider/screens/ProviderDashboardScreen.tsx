import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {loadStats, setMonth} from '../providerSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import DashboardSkeleton from '@/components/Skeleton/DashboardSkeleton';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function ProviderDashboardScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {stats, loading, selectedMonth, selectedYear} = useSelector(
    (state: RootState) => state.provider,
  );

  const refresh = useCallback(() => {
    dispatch(loadStats({month: selectedMonth, year: selectedYear}));
  }, [dispatch, selectedMonth, selectedYear]);

  useFocusEffect(refresh);

  const changeMonth = (delta: number) => {
    let m = selectedMonth + delta;
    let y = selectedYear;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    dispatch(setMonth({month: m, year: y}));
    dispatch(loadStats({month: m, year: y}));
  };

  const maxDayRevenue =
    stats?.revenueByDay.reduce((max, d) => Math.max(max, d.amount), 0) ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={theme.colors.primary}
        />
      }>
      {/* Month selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrow}>
          <Text style={styles.arrowText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrow}>
          <Text style={styles.arrowText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {loading && !stats ? (
        <DashboardSkeleton />
      ) : !stats ? (
        <Text style={styles.emptyText}>{t('dashboard.noData')}</Text>
      ) : (
        <>
          {/* Summary cards */}
          <View style={styles.grid}>
            <View style={[styles.statCard, styles.revenueCard]}>
              <Text style={[styles.statValue, styles.revenueText]}>
                ${stats.monthlyRevenue.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, styles.revenueLabel]}>
                {t('dashboard.revenue')}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.confirmedCount}</Text>
              <Text style={styles.statLabel}>{t('dashboard.confirmed')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingCount}</Text>
              <Text style={styles.statLabel}>{t('dashboard.pending')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.cancelledCount}</Text>
              <Text style={styles.statLabel}>{t('dashboard.cancelled')}</Text>
            </View>
          </View>

          {/* Revenue by day */}
          {stats.revenueByDay.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('dashboard.revenueByDay')}
              </Text>
              {stats.revenueByDay.map(day => (
                <View key={day.date} style={styles.barRow}>
                  <Text style={styles.barLabel}>{day.date.slice(5)}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width:
                            maxDayRevenue > 0
                              ? `${(day.amount / maxDayRevenue) * 100}%`
                              : '0%',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>${day.amount}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Top services */}
          {stats.topServices.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('dashboard.topServices')}
              </Text>
              {stats.topServices.map(svc => (
                <View key={svc.name} style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {svc.name}
                    </Text>
                    <Text style={styles.serviceCount}>
                      {svc.count} {t('dashboard.bookings')}
                    </Text>
                  </View>
                  <Text style={styles.serviceRevenue}>
                    ${svc.revenue.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Conversion Rate */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.conversionRate')}
            </Text>
            <View style={styles.conversionCard}>
              <Text style={styles.conversionRate}>
                {stats.conversionRate.toFixed(1)}%
              </Text>
              <Text style={styles.conversionDetail}>
                {stats.confirmedCount} / {stats.totalBookings}{' '}
                {t('dashboard.totalBookings')}
              </Text>
              <View style={styles.conversionBarTrack}>
                <View
                  style={[
                    styles.conversionBarFill,
                    {width: `${Math.min(stats.conversionRate, 100)}%`},
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Peak Hours */}
          {stats.peakHours.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('dashboard.peakHours')}
              </Text>
              {stats.peakHours.slice(0, 6).map(h => {
                const maxH = stats.peakHours[0].count;
                return (
                  <View key={h.hour} style={styles.barRow}>
                    <Text style={styles.barLabel}>{h.hour}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          styles.peakBarFill,
                          {
                            width:
                              maxH > 0
                                ? `${(h.count / maxH) * 100}%`
                                : '0%',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{h.count}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Busiest Days */}
          {stats.busiestDays.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('dashboard.busiestDays')}
              </Text>
              {stats.busiestDays.map(d => {
                const maxD = stats.busiestDays[0].count;
                return (
                  <View key={d.dayOfWeek} style={styles.barRow}>
                    <Text style={styles.barLabel}>{d.dayName.slice(0, 3)}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          styles.dayBarFill,
                          {
                            width:
                              maxD > 0
                                ? `${(d.count / maxD) * 100}%`
                                : '0%',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{d.count}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  centered: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 60,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  arrow: {
    padding: theme.spacing.sm,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
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
  revenueCard: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  revenueText: {
    color: '#fff',
  },
  revenueLabel: {
    color: 'rgba(255,255,255,0.8)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  barLabel: {
    width: 45,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  barValue: {
    width: 60,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'right',
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
    marginBottom: theme.spacing.sm,
  },
  serviceInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  serviceCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  serviceRevenue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  conversionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  conversionRate: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  conversionDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  conversionBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  conversionBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  peakBarFill: {
    backgroundColor: '#F59E0B',
  },
  dayBarFill: {
    backgroundColor: '#8B5CF6',
  },
});
