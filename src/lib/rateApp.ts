import {Alert, Linking, Platform} from 'react-native';
import {mmkvStorage} from '@/lib/storage';
import type {TFunction} from 'i18next';

const RATE_PROMPT_KEY = 'rate_app_last_prompt';
const BOOKING_COUNT_KEY = 'rate_app_booking_count';
const MIN_BOOKINGS = 3;
const COOLDOWN_DAYS = 90;

const IOS_APP_ID = 'com.vuongnguyen.glow';
const ANDROID_PACKAGE = 'com.vuongnguyen.glow';

export async function incrementBookingCount(): Promise<number> {
  const raw = await mmkvStorage.getItem(BOOKING_COUNT_KEY);
  const current = raw ? parseInt(raw, 10) : 0;
  const next = current + 1;
  await mmkvStorage.setItem(BOOKING_COUNT_KEY, String(next));
  return next;
}

export async function shouldShowRatePrompt(): Promise<boolean> {
  const raw = await mmkvStorage.getItem(BOOKING_COUNT_KEY);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count < MIN_BOOKINGS) {
    return false;
  }

  const lastPrompt = await mmkvStorage.getItem(RATE_PROMPT_KEY);
  if (lastPrompt) {
    const lastDate = new Date(lastPrompt);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays < COOLDOWN_DAYS) {
      return false;
    }
  }

  return true;
}

export async function markPromptShown(): Promise<void> {
  await mmkvStorage.setItem(RATE_PROMPT_KEY, new Date().toISOString());
}

function openStorePage(): void {
  const url = Platform.select({
    ios: `itms-apps://apps.apple.com/app/${IOS_APP_ID}?action=write-review`,
    android: `market://details?id=${ANDROID_PACKAGE}`,
  });

  if (url) {
    Linking.openURL(url).catch(() => {
      // Fallback to web URL if deep link fails
      const webUrl = Platform.select({
        ios: `https://apps.apple.com/app/${IOS_APP_ID}`,
        android: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`,
      });
      if (webUrl) {
        Linking.openURL(webUrl);
      }
    });
  }
}

export function showRatePrompt(t: TFunction): void {
  markPromptShown();

  Alert.alert(
    t('rateApp.title'),
    t('rateApp.message'),
    [
      {
        text: t('rateApp.noThanks'),
        style: 'cancel',
      },
      {
        text: t('rateApp.rateLater'),
        onPress: () => {
          // Do nothing; cooldown will prevent re-prompt for 90 days
        },
      },
      {
        text: t('rateApp.rateNow'),
        onPress: openStorePage,
      },
    ],
    {cancelable: true},
  );
}
