import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {theme} from '@/utils/theme';

interface PlanCardProps {
  plan: 'free' | 'basic' | 'pro';
  price: string;
  period: 'monthly' | 'yearly';
  features: string[];
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  basic: 'Glow Basic',
  pro: 'Glow Pro',
};

function PlanCard({
  plan,
  price,
  period,
  features,
  isCurrentPlan,
  isPopular,
  onSelect,
  disabled,
}: PlanCardProps) {
  const {t} = useTranslation();

  const periodLabel =
    period === 'monthly'
      ? t('subscription.perMonth')
      : t('subscription.perYear');

  const buttonLabel = isCurrentPlan
    ? t('subscription.currentPlan')
    : plan === 'free'
      ? t('subscription.downgrade')
      : t('subscription.upgrade');

  return (
    <View
      style={[
        styles.card,
        isCurrentPlan && styles.cardCurrent,
        isPopular && !isCurrentPlan && styles.cardPopular,
      ]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>
            {t('subscription.mostPopular')}
          </Text>
        </View>
      )}

      {isCurrentPlan && (
        <View style={styles.currentLabel}>
          <Text style={styles.currentLabelText}>
            {t('subscription.currentPlan')}
          </Text>
        </View>
      )}

      <Text style={styles.planName}>{PLAN_NAMES[plan]}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        {plan !== 'free' && (
          <Text style={styles.periodText}>{periodLabel}</Text>
        )}
      </View>

      <View style={styles.featureList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkmark}>{'\u2713'}</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isCurrentPlan && styles.buttonDisabled,
          (disabled && !isCurrentPlan) && styles.buttonDisabled,
        ]}
        onPress={onSelect}
        disabled={isCurrentPlan || disabled}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.buttonText,
            isCurrentPlan && styles.buttonTextDisabled,
          ]}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(PlanCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardCurrent: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  cardPopular: {
    borderColor: theme.colors.primaryDark,
    borderWidth: 1.5,
  },
  popularBadge: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.sm,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentLabel: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.sm,
  },
  currentLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  periodText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  featureList: {
    marginBottom: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  checkmark: {
    fontSize: 15,
    color: theme.colors.success,
    fontWeight: '700',
    marginRight: theme.spacing.sm,
    lineHeight: 20,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: theme.colors.textSecondary,
  },
});
