import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface SubscriptionBadgeProps {
  plan: 'free' | 'basic' | 'pro';
  size?: 'small' | 'medium';
}

const BADGE_COLORS = {
  basic: {
    background: '#E3F2FD',
    text: '#1565C0',
  },
  pro: {
    background: '#FFF8E1',
    text: '#F57F17',
  },
};

function SubscriptionBadge({plan, size = 'small'}: SubscriptionBadgeProps) {
  if (plan === 'free') {
    return null;
  }

  const colors = BADGE_COLORS[plan];
  const isMedium = size === 'medium';

  if (plan === 'basic') {
    return (
      <View style={[styles.badge, {backgroundColor: colors.background}]}>
        <Text style={[styles.icon, isMedium && styles.iconMedium, {color: colors.text}]}>
          {'\u2713'}
        </Text>
        <Text style={[styles.label, isMedium && styles.labelMedium, {color: colors.text}]}>
          {isMedium ? 'Verified' : 'Verified'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, {backgroundColor: colors.background}]}>
      <Text style={[styles.icon, isMedium && styles.iconMedium, {color: colors.text}]}>
        {'\u2605'}
      </Text>
      <Text style={[styles.label, isMedium && styles.labelMedium, {color: colors.text}]}>
        PRO
      </Text>
    </View>
  );
}

export default React.memo(SubscriptionBadge);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    gap: 3,
  },
  icon: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconMedium: {
    fontSize: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
  labelMedium: {
    fontSize: 12,
  },
});
