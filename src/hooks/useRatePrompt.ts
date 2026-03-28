import {useCallback, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {
  incrementBookingCount,
  shouldShowRatePrompt,
  showRatePrompt,
} from '@/lib/rateApp';

const PROMPT_DELAY_MS = 3000;

export function useRatePrompt() {
  const {t} = useTranslation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const triggerRateCheck = useCallback(async () => {
    await incrementBookingCount();

    const shouldShow = await shouldShowRatePrompt();
    if (shouldShow) {
      timerRef.current = setTimeout(() => {
        showRatePrompt(t);
      }, PROMPT_DELAY_MS);
    }
  }, [t]);

  return {triggerRateCheck};
}
