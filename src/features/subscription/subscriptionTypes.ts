export type SubscriptionPlan = 'free' | 'basic' | 'pro';
export type SubscriptionStatus = 'active' | 'expired' | 'grace_period' | 'billing_retry' | 'cancelled' | 'unknown';
export type SubscriptionPeriod = 'monthly' | 'yearly';

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  productId: string | null;
  expirationDate: string | null;
  isTrialActive: boolean;
}

export interface PlanFeature {
  key: string;
  free: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
}

export interface PlanLimits {
  maxServices: number;
  maxPhotosPerService: number;
  hasFullAnalytics: boolean;
  hasBadge: boolean;
  badgeType: string | null;
  canCreatePromo: boolean;
  maxActivePromos: number;
  searchBoost: 'none' | 'minor' | 'significant';
}
