import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {theme} from '@/utils/theme';

interface Props {
  bookingCount: number;
}

function SocialProofBadge({bookingCount}: Props) {
  const {t} = useTranslation();

  if (bookingCount === 0) {
    return null;
  }

  const isPopular = bookingCount > 10;

  return (
    <View style={[styles.badge, isPopular && styles.badgePopular]}>
      <Text style={[styles.text, isPopular && styles.textPopular]}>
        {isPopular
          ? `\u2B50 ${t('services.popularBookedThisWeek', {count: bookingCount})}`
          : `\uD83D\uDCC5 ${t('services.bookedThisWeek', {count: bookingCount})}`}
      </Text>
    </View>
  );
}

export default React.memo(SocialProofBadge);

const styles = StyleSheet.create({
  badge: {
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  badgePopular: {
    backgroundColor: `${theme.colors.primary}35`,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.primaryDark,
  },
  textPopular: {
    fontWeight: '700',
  },
});
