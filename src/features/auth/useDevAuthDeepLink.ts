import {useEffect} from 'react';
import {Linking} from 'react-native';
import {supabase} from '@/lib/supabase';

async function handleTestAuthUrl(url: string): Promise<void> {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'test-auth') {
      return;
    }

    const email = parsed.searchParams.get('email');
    const password = parsed.searchParams.get('password');

    if (!email || !password) {
      console.warn('[DevAuth] Missing email or password in deep link');
      return;
    }

    console.log('[DevAuth] Attempting sign-in for:', email);

    const {error} = await supabase.auth.signInWithPassword({email, password});

    if (error) {
      console.error('[DevAuth] Sign-in failed:', error.message);
    } else {
      console.log('[DevAuth] Sign-in successful');
    }
  } catch (err) {
    console.error('[DevAuth] Error handling deep link:', err);
  }
}

export function useDevAuthDeepLink(): void {
  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    Linking.getInitialURL().then(url => {
      if (url) {
        handleTestAuthUrl(url);
      }
    });

    const subscription = Linking.addEventListener('url', ({url}) => {
      handleTestAuthUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
