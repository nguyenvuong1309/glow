import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {purchasePackage} from '../subscriptionSlice';
import {PRODUCT_IDS} from '../subscriptionConfig';
import PlanCard from '../components/PlanCard';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type PaywallParams = {
  Paywall: {feature: string; requiredPlan: 'basic' | 'pro'};
};

type Props = NativeStackScreenProps<PaywallParams, 'Paywall'>;

const FEATURE_ICONS: Record<string, string> = {
  service_limit: '\uD83D\uDCCB',
  photo_limit: '\uD83D\uDCF7',
  analytics: '\uD83D\uDCCA',
  promotions: '\uD83C\uDF89',
};

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

export default function PaywallScreen({navigation, route}: Props) {
  const {feature, requiredPlan} = route.params;
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const {plan, purchasing, period} = useSelector(
    (state: RootState) => state.subscription,
  );

  const icon = FEATURE_ICONS[feature] ?? '\u2728';

  const titleKey: Record<string, string> = {
    service_limit: 'subscription.paywall.serviceLimit',
    photo_limit: 'subscription.paywall.photoLimit',
    analytics: 'subscription.paywall.analytics',
    promotions: 'subscription.paywall.promotions',
  };

  const title = t(titleKey[feature] ?? 'subscription.paywall.default');
  const subtitle = t('subscription.paywall.subtitle', {
    plan: requiredPlan === 'basic' ? 'Glow Basic' : 'Glow Pro',
  });

  const features =
    requiredPlan === 'basic'
      ? BASIC_FEATURES_KEYS.map(key => t(key))
      : PRO_FEATURES_KEYS.map(key => t(key));

  const price =
    requiredPlan === 'basic'
      ? period === 'monthly'
        ? '$4.99'
        : '$49.99'
      : period === 'monthly'
        ? '$14.99'
        : '$149.99';

  const handleUpgrade = useCallback(() => {
    const productId =
      requiredPlan === 'basic'
        ? period === 'monthly'
          ? PRODUCT_IDS.basicMonthly
          : PRODUCT_IDS.basicYearly
        : period === 'monthly'
          ? PRODUCT_IDS.proMonthly
          : PRODUCT_IDS.proYearly;
    dispatch(purchasePackage(productId));
  }, [dispatch, requiredPlan, period]);

  const handleDismiss = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <Text style={styles.icon}>{icon}</Text>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Plan Card */}
        <View style={styles.planCardWrapper}>
          <PlanCard
            plan={requiredPlan}
            price={price}
            period={period}
            features={features}
            isCurrentPlan={plan === requiredPlan}
            isPopular={requiredPlan === 'pro'}
            onSelect={handleUpgrade}
            disabled={purchasing}
          />
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          style={[styles.upgradeButton, purchasing && styles.upgradeButtonDisabled]}
          onPress={handleUpgrade}
          disabled={purchasing || plan === requiredPlan}
          activeOpacity={0.7}>
          {purchasing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.upgradeButtonText}>
              {t('subscription.paywall.upgradeNow')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Not Now */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          activeOpacity={0.7}>
          <Text style={styles.dismissButtonText}>
            {t('subscription.paywall.notNow')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  planCardWrapper: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    width: '100%',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  dismissButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  dismissButtonText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
