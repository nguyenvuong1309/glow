import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {loadSpending, setSpendingMonth} from '../bookingSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function SpendingScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {spending, spendingLoading, spendingMonth, spendingYear} = useSelector(
    (state: RootState) => state.booking,
  );

  const refresh = useCallback(() => {
    dispatch(loadSpending({month: spendingMonth, year: spendingYear}));
  }, [dispatch, spendingMonth, spendingYear]);

  useFocusEffect(refresh);

  const changeMonth = (delta: number) => {
    let m = spendingMonth + delta;
    let y = spendingYear;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    dispatch(setSpendingMonth({month: m, year: y}));
    dispatch(loadSpending({month: m, year: y}));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={spendingLoading}
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
          {MONTH_NAMES[spendingMonth - 1]} {spendingYear}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrow}>
          <Text style={styles.arrowText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {spendingLoading && !spending ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : !spending ? (
        <Text style={styles.emptyText}>{t('spending.noData')}</Text>
      ) : (
        <>
          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.totalCard]}>
              <Text style={[styles.summaryValue, styles.totalText]}>
                ${spending.total.toLocaleString()}
              </Text>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>
                {t('spending.totalSpent')}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{spending.completedCount}</Text>
              <Text style={styles.summaryLabel}>
                {t('spending.bookings')}
              </Text>
            </View>
          </View>

          {/* By service */}
          {spending.byService.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('spending.byService')}
              </Text>
              {spending.byService.map(svc => (
                <View key={svc.name} style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {svc.name}
                    </Text>
                    <Text style={styles.serviceCount}>
                      {svc.count}x
                    </Text>
                  </View>
                  <Text style={styles.serviceTotal}>
                    ${svc.total.toLocaleString()}
                  </Text>
                </View>
              ))}
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
  totalCard: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalText: {
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
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
  serviceTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
});
