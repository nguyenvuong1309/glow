import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {loadUserCoupons} from '../promotionSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {UserCoupon} from '@/types';

export default function MyCouponsScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const {userCoupons, couponsLoading} = useSelector(
    (state: RootState) => state.promotions,
  );

  useEffect(() => {
    dispatch(loadUserCoupons());
  }, [dispatch]);

  const formatDiscount = (coupon: UserCoupon) => {
    const promo = coupon.promotion;
    if (!promo) {
      return '';
    }
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}% OFF`;
    }
    return `$${promo.discount_value} OFF`;
  };

  const renderItem = useCallback(
    ({item}: {item: UserCoupon}) => {
      const isUsed = item.used_at != null;
      const promo = item.promotion;

      return (
        <View style={[styles.card, isUsed && styles.cardUsed]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, isUsed && styles.textFaded]}>
              {promo?.title ?? ''}
            </Text>
            <View
              style={[
                styles.statusBadge,
                isUsed ? styles.statusUsed : styles.statusAvailable,
              ]}>
              <Text style={styles.statusText}>
                {isUsed ? t('coupons.used') : t('coupons.available')}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.codeLabel, isUsed && styles.textFaded]}>
              {t('coupons.code')}:{' '}
              <Text style={styles.codeValue}>{promo?.code ?? ''}</Text>
            </Text>

            <Text style={[styles.discount, isUsed && styles.textFaded]}>
              {formatDiscount(item)}
            </Text>

            {promo && promo.min_purchase > 0 && (
              <Text style={[styles.minPurchase, isUsed && styles.textFaded]}>
                {t('coupons.minPurchase')}: ${promo.min_purchase}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [t],
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        userCoupons.length === 0 ? styles.centered : styles.list
      }
      data={userCoupons}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      testID="my-coupons-screen"
      ListEmptyComponent={
        !couponsLoading ? (
          <Text style={styles.emptyText}>{t('coupons.empty')}</Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardUsed: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  statusAvailable: {
    backgroundColor: theme.colors.success,
  },
  statusUsed: {
    backgroundColor: theme.colors.textSecondary,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: theme.spacing.xs,
  },
  codeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  codeValue: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  discount: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  minPurchase: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  textFaded: {
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
