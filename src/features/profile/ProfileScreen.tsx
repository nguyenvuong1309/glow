import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logoutRequest} from '@/features/auth/authSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
      <Text style={styles.email}>{user?.email ?? ''}</Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => dispatch(logoutRequest())}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    paddingTop: 80,
    padding: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
  },
  email: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  logoutButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
});
