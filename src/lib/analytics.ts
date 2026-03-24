import analytics from '@react-native-firebase/analytics';

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
