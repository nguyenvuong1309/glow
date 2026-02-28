import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {supabase} from '@/lib/supabase';
import {loginSuccess, logout} from './authSlice';
import type {User} from '@/types';

export function useAuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const {data: subscription} = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ??
              session.user.user_metadata?.name ??
              session.user.email?.split('@')[0] ??
              'User',
            email: session.user.email ?? '',
            avatar_url: session.user.user_metadata?.avatar_url,
          };
          dispatch(loginSuccess(user));
        } else {
          dispatch(logout());
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [dispatch]);
}
