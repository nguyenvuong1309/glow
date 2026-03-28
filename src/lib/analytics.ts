import analytics from '@react-native-firebase/analytics';

// ── Typed event names ────────────────────────────────────────────────
export const AnalyticsEvents = {
  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  DELETE_ACCOUNT: 'delete_account',

  // Services
  VIEW_SERVICE: 'view_service',
  SEARCH: 'search',
  APPLY_FILTER: 'apply_filter',
  SELECT_CATEGORY: 'select_category',

  // Booking
  BEGIN_BOOKING: 'begin_booking',
  COMPLETE_BOOKING: 'complete_booking',
  CANCEL_BOOKING: 'cancel_booking',
  RESCHEDULE_BOOKING: 'reschedule_booking',

  // Provider
  VIEW_PROVIDER: 'view_provider',

  // Favorites
  ADD_FAVORITE: 'add_favorite',
  REMOVE_FAVORITE: 'remove_favorite',

  // Reviews
  SUBMIT_REVIEW: 'submit_review',

  // Promotions
  VIEW_PROMOTIONS: 'view_promotions',
  CLAIM_COUPON: 'claim_coupon',

  // Profile
  UPDATE_PROFILE: 'update_profile',
  UPLOAD_AVATAR: 'upload_avatar',

  // Sharing (already exists in shareService.ts)
  SHARE_SERVICE: 'share_service',
  SHARE_PROVIDER: 'share_provider',
} as const;

// ── Core helpers ─────────────────────────────────────────────────────
export const logEvent = async (name: string, params?: Record<string, any>) => {
  await analytics().logEvent(name, params);
};

export const logScreenView = async (screenName: string, screenClass?: string) => {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass ?? screenName,
  });
};

export const setUserId = async (userId: string | null) => {
  await analytics().setUserId(userId);
};

export const setUserProperty = async (name: string, value: string | null) => {
  await analytics().setUserProperty(name, value);
};

export default analytics;
