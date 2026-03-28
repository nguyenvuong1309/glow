import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {
  loadOfferings,
  purchasePackage,
  restorePurchases,
  setPeriod,
  clearError,
} from '../subscriptionSlice';
import {PLAN_FEATURES, PRODUCT_IDS} from '../subscriptionConfig';
import PlanCard from '../components/PlanCard';
import SubscriptionBadge from '../components/SubscriptionBadge';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {SubscriptionPeriod} from '../subscriptionTypes';

const FREE_FEATURES_KEYS = [
  'subscription.features.freeServices',
  'subscription.features.freePhotos',
  'subscription.features.freeAnalytics',
];

const BASIC_FEATURES_KEYS = [
  'subscription.features.basicServices',
  'subscription.features.basicPhotos',
  'subscription.features.fullAnalytics',
  'subscription.features.verifiedBadge',
  'subscription.features.basicPromos',
  'subscription.features.minorBoost',
];

const PRO_FEATURES_KEYS = [
  'subscription.features.unlimitedServices',
  'subscription.features.proPhotos',
  'subscription.features.fullAnalyticsPro',
  'subscription.features.proBadge',
  'subscription.features.unlimitedPromos',
  'subscription.features.significantBoost',
];

export default function SubscriptionScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const {
    plan,
    status,
    availablePackages,
    purchasing,
    restoring,
    loading,
    period,
    error,
    expirationDate,
  } = useSelector((state: RootState) => state.subscription);

  useEffect(() => {
    dispatch(loadOfferings());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('subscription.error'), error, [
        {text: t('subscription.ok'), onPress: () => dispatch(clearError())},
      ]);
    }
  }, [error, t, dispatch]);

  const handlePeriodToggle = useCallback(
    (newPeriod: SubscriptionPeriod) => {
      dispatch(setPeriod(newPeriod));
    },
    [dispatch],
  );

  const handleSelectPlan = useCallback(
    (selectedPlan: 'free' | 'basic' | 'pro') => {
      if (selectedPlan === 'free' || selectedPlan === plan) {
        return;
      }
      const productId =
        selectedPlan === 'basic'
          ? period === 'monthly'
            ? PRODUCT_IDS.basicMonthly
            : PRODUCT_IDS.basicYearly
          : period === 'monthly'
            ? PRODUCT_IDS.proMonthly
            : PRODUCT_IDS.proYearly;
      dispatch(purchasePackage(productId));
    },
    [dispatch, period, plan],
  );

  const handleRestore = useCallback(() => {
    dispatch(restorePurchases());
  }, [dispatch]);

  const formatExpiration = (dateStr: string | null) => {
    if (!dateStr) {
      return null;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const freeFeatures = FREE_FEATURES_KEYS.map(key => t(key));
  const basicFeatures = BASIC_FEATURES_KEYS.map(key => t(key));
  const proFeatures = PRO_FEATURES_KEYS.map(key => t(key));

  const basicPrice = period === 'monthly' ? '$4.99' : '$49.99';
  const proPrice = period === 'monthly' ? '$14.99' : '$149.99';

  const isActive = status === 'active' || status === 'grace_period';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header - Current Plan */}
        <View style={styles.header}>
          <View style={styles.currentPlanRow}>
            <Text style={styles.currentPlanLabel}>
              {t('subscription.yourPlan')}
            </Text>
            <SubscriptionBadge plan={plan} size="medium" />
          </View>
          <Text style={styles.currentPlanName}>
            {plan === 'free'
              ? 'Free'
              : plan === 'basic'
                ? 'Glow Basic'
                : 'Glow Pro'}
          </Text>
          {isActive && expirationDate && (
            <Text style={styles.expirationText}>
              {t('subscription.expiresOn', {
                date: formatExpiration(expirationDate),
              })}
            </Text>
          )}
        </View>

        {/* Period Toggle */}
        <View style={styles.periodSection}>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[
                styles.periodOption,
                period === 'monthly' && styles.periodOptionActive,
              ]}
              onPress={() => handlePeriodToggle('monthly')}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.periodOptionText,
                  period === 'monthly' && styles.periodOptionTextActive,
                ]}>
                {t('subscription.monthly')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodOption,
                period === 'yearly' && styles.periodOptionActive,
              ]}
              onPress={() => handlePeriodToggle('yearly')}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.periodOptionText,
                  period === 'yearly' && styles.periodOptionTextActive,
                ]}>
                {t('subscription.yearly')}
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>
                  {t('subscription.save17')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansSection}>
          <PlanCard
            plan="free"
            price="$0"
            period={period}
            features={freeFeatures}
            isCurrentPlan={plan === 'free'}
            onSelect={() => handleSelectPlan('free')}
            disabled={purchasing}
          />
          <PlanCard
            plan="basic"
            price={basicPrice}
            period={period}
            features={basicFeatures}
            isCurrentPlan={plan === 'basic'}
            onSelect={() => handleSelectPlan('basic')}
            disabled={purchasing}
          />
          <PlanCard
            plan="pro"
            price={proPrice}
            period={period}
            features={proFeatures}
            isCurrentPlan={plan === 'pro'}
            isPopular
            onSelect={() => handleSelectPlan('pro')}
            disabled={purchasing}
          />
        </View>

        {/* Feature Comparison Table */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>
            {t('subscription.featureComparison')}
          </Text>
          <View style={styles.comparisonCard}>
            {/* Table Header */}
            <View style={[styles.comparisonRow, styles.comparisonHeader]}>
              <Text style={[styles.comparisonCell, styles.comparisonFeatureCell]}>
                {t('subscription.feature')}
              </Text>
              <Text style={[styles.comparisonCell, styles.comparisonPlanCell]}>
                Free
              </Text>
              <Text style={[styles.comparisonCell, styles.comparisonPlanCell]}>
                Basic
              </Text>
              <Text style={[styles.comparisonCell, styles.comparisonPlanCell]}>
                Pro
              </Text>
            </View>
            {/* Table Rows */}
            {PLAN_FEATURES.map((feature, index) => (
              <View
                key={feature.key}
                style={[
                  styles.comparisonRow,
                  index < PLAN_FEATURES.length - 1 && styles.comparisonRowBorder,
                ]}>
                <Text
                  style={[styles.comparisonCell, styles.comparisonFeatureCell]}>
                  {t(feature.key)}
                </Text>
                <Text
                  style={[styles.comparisonCell, styles.comparisonPlanCell]}>
                  {renderFeatureValue(feature.free, t)}
                </Text>
                <Text
                  style={[styles.comparisonCell, styles.comparisonPlanCell]}>
                  {renderFeatureValue(feature.basic, t)}
                </Text>
                <Text
                  style={[styles.comparisonCell, styles.comparisonPlanCell]}>
                  {renderFeatureValue(feature.pro, t)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
          activeOpacity={0.7}>
          <Text style={styles.restoreButtonText}>
            {restoring
              ? t('subscription.restoring')
              : t('subscription.restorePurchases')}
          </Text>
        </TouchableOpacity>

        {/* Apple Disclaimer */}
        <Text style={styles.disclaimer}>
          {t('subscription.appleDisclaimer')}
        </Text>

        {/* Terms & Privacy */}
        <View style={styles.linksRow}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.linkText}>
              {t('subscription.termsOfService')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}>{'|'}</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.linkText}>
              {t('subscription.privacyPolicy')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Purchasing Overlay */}
      {(purchasing || (loading && availablePackages.length === 0)) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.overlayText}>
            {purchasing
              ? t('subscription.processing')
              : t('subscription.loadingPlans')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function renderFeatureValue(
  value: boolean | string,
  t: (key: string) => string,
): string {
  if (value === true) {
    return '\u2713';
  }
  if (value === false) {
    return '\u2014';
  }
  // If the value looks like a translation key, translate it
  if (value.startsWith('subscription.')) {
    return t(value);
  }
  return value;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  currentPlanLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  expirationText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  periodSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  periodOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  periodOptionTextActive: {
    color: '#FFFFFF',
  },
  saveBadge: {
    marginTop: 2,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  plansSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  comparisonSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  comparisonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  comparisonHeader: {
    backgroundColor: theme.colors.background,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.sm,
  },
  comparisonRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  comparisonCell: {
    fontSize: 12,
    color: theme.colors.text,
  },
  comparisonFeatureCell: {
    flex: 2,
    fontWeight: '500',
  },
  comparisonPlanCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  restoreButton: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  restoreButtonText: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
    lineHeight: 16,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  linkText: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    fontWeight: '500',
  },
  linkSeparator: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    marginTop: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
});
