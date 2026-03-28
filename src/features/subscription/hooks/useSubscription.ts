import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {PLAN_LIMITS} from '../subscriptionConfig';
import type {SubscriptionPlan} from '../subscriptionTypes';
import type {RootState} from '@/store/rootReducer';

export function useSubscription() {
  const {plan, status, purchasing, loading} = useSelector(
    (state: RootState) => state.subscription,
  );
  const navigation = useNavigation<any>();

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const isBasicOrAbove = plan === 'basic' || plan === 'pro';
  const isPro = plan === 'pro';

  const showPaywall = (feature: string) => {
    navigation.navigate('Paywall', {feature, requiredPlan: isPro ? 'pro' : 'basic'});
  };

  return {
    plan,
    status,
    limits,
    isBasicOrAbove,
    isPro,
    purchasing,
    loading,
    canPostService: (currentCount: number) => currentCount < limits.maxServices,
    canAccessFullAnalytics: limits.hasFullAnalytics,
    showPaywall,
  };
}
