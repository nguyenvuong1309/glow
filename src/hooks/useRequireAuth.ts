import {useCallback} from 'react';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@/navigation/types';
import type {RootState} from '@/store';

export function useRequireAuth() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const requireAuth = useCallback(() => {
    if (isAuthenticated) {
      return true;
    }
    navigation.navigate('Login');
    return false;
  }, [isAuthenticated, navigation]);

  return requireAuth;
}
