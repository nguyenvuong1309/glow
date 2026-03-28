import {PlanFeature, PlanLimits} from './subscriptionTypes';

export const REVENUECAT_API_KEY_IOS = 'appl_REPLACE_WITH_ACTUAL_KEY';

export const PRODUCT_IDS = {
  basicMonthly: 'glow.provider.basic.monthly',
  basicYearly: 'glow.provider.basic.yearly',
  proMonthly: 'glow.provider.pro.monthly',
  proYearly: 'glow.provider.pro.yearly',
} as const;

export const ENTITLEMENT_IDS = {
  basic: 'provider_basic',
  pro: 'provider_pro',
} as const;

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxServices: 2,
    maxPhotosPerService: 3,
    hasFullAnalytics: false,
    hasBadge: false,
    badgeType: null,
    canCreatePromo: false,
    maxActivePromos: 0,
    searchBoost: 'none',
  },
  basic: {
    maxServices: 10,
    maxPhotosPerService: 8,
    hasFullAnalytics: true,
    hasBadge: true,
    badgeType: 'verified',
    canCreatePromo: true,
    maxActivePromos: 1,
    searchBoost: 'minor',
  },
  pro: {
    maxServices: 999999,
    maxPhotosPerService: 20,
    hasFullAnalytics: true,
    hasBadge: true,
    badgeType: 'pro',
    canCreatePromo: true,
    maxActivePromos: 999999,
    searchBoost: 'significant',
  },
};

export const PLAN_FEATURES: PlanFeature[] = [
  {key: 'subscription.features.services', free: '2', basic: '10', pro: 'subscription.features.unlimited'},
  {key: 'subscription.features.photos', free: '3', basic: '8', pro: '20'},
  {key: 'subscription.features.analytics', free: 'subscription.features.basicAnalytics', basic: 'subscription.features.fullAnalytics', pro: 'subscription.features.fullAnalyticsPro'},
  {key: 'subscription.features.badge', free: false, basic: 'subscription.features.verifiedBadge', pro: 'subscription.features.proBadge'},
  {key: 'subscription.features.promotions', free: false, basic: '1', pro: 'subscription.features.unlimited'},
  {key: 'subscription.features.searchBoost', free: false, basic: 'subscription.features.minor', pro: 'subscription.features.significant'},
];
