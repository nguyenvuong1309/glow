import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {logoutRequest} from '@/features/auth/authSlice';
import {changeLanguage} from '@/i18n';
import {languages} from '@/i18n/languages';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NavigationProp} from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

export default function ProfileScreen({navigation}: Props) {
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <Text style={styles.name}>{user?.name ?? t('profile.guest')}</Text>
      <Text style={styles.email}>{user?.email ?? ''}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('profile.language')}</Text>
        <View style={styles.languageRow}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageChip,
                i18n.language === lang.code && styles.languageChipActive,
              ]}
              onPress={() => changeLanguage(lang.code)}>
              <Text
                style={[
                  styles.languageChipText,
                  i18n.language === lang.code && styles.languageChipTextActive,
                ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.postServiceButton}
        onPress={() => navigation.navigate('PostService')}>
        <Text style={styles.postServiceText}>{t('profile.postService')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => navigation.navigate('MyServices')}>
        <Text style={styles.outlineButtonText}>
          {t('profile.myServices')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => navigation.navigate('BookingRequests')}>
        <Text style={styles.outlineButtonText}>
          {t('profile.bookingRequests')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => dispatch(logoutRequest())}>
        <Text style={styles.outlineButtonText}>{t('profile.signOut')}</Text>
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
  section: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  languageRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  languageChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  languageChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  languageChipText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  languageChipTextActive: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  postServiceButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryDark,
  },
  postServiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  outlineButton: {
    marginTop: theme.spacing.md,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
});
