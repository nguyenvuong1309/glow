import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {loadPromotions, loadUserCoupons, claimCoupon} from '../promotionSlice';
import {useRequireAuth} from '@/hooks/useRequireAuth';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Promotion} from '@/types';

export default function PromotionsScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const requireAuth = useRequireAuth();

  const {promotions, userCoupons, loading, claimingId} = useSelector(
    (state: RootState) => state.promotions,
  );

  useEffect(() => {
    dispatch(loadPromotions());
    dispatch(loadUserCoupons());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(loadPromotions());
    dispatch(loadUserCoupons());
  }, [dispatch]);

  const handleClaim = useCallback(
    (promotionId: string) => {
      if (!requireAuth()) {
        return;
      }
      dispatch(claimCoupon(promotionId));
    },
    [dispatch, requireAuth],
  );

  const isClaimed = useCallback(
    (promotionId: string) =>
      userCoupons.some(c => c.promotion_id === promotionId),
    [userCoupons],
  );

  const formatDiscount = (item: Promotion) => {
    if (item.discount_type === 'percentage') {
      return `${item.discount_value}% ${t('promotions.off')}`;
    }
    return `$${item.discount_value} ${t('promotions.off')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const renderItem = useCallback(
    ({item}: {item: Promotion}) => {
      const claimed = isClaimed(item.id);
      const claiming = claimingId === item.id;

      return (
        <View style={styles.card}>
          <View style={[styles.banner, {backgroundColor: item.color}]}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.bannerDescription}>{item.description}</Text>
            ) : null}
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.discount}>{formatDiscount(item)}</Text>

            {item.min_purchase > 0 && (
              <Text style={styles.minPurchase}>
                {t('promotions.minPurchase')}: ${item.min_purchase}
              </Text>
            )}

            <Text style={styles.validPeriod}>
              {t('promotions.validUntil')}: {formatDate(item.start_date)} -{' '}
              {formatDate(item.end_date)}
            </Text>

            <View style={styles.cardFooter}>
              {claimed ? (
                <View style={styles.claimedBadge}>
                  <Text style={styles.claimedText}>
                    {t('promotions.claimed')}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.claimButton, claiming && styles.claimingButton]}
                  onPress={() => handleClaim(item.id)}
                  disabled={claiming}
                  activeOpacity={0.7}>
                  <Text style={styles.claimButtonText}>
                    {t('promotions.claim')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    },
    [claimingId, isClaimed, handleClaim, t],
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        promotions.length === 0 ? styles.centered : styles.list
      }
      data={promotions}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      testID="promotions-screen"
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={
        !loading ? (
          <Text style={styles.emptyText}>{t('promotions.empty')}</Text>
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  banner: {
    padding: theme.spacing.md,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: theme.spacing.xs,
    opacity: 0.9,
  },
  cardBody: {
    padding: theme.spacing.md,
  },
  discount: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  minPurchase: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  validPeriod: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  claimButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  claimingButton: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  claimedBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  claimedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
