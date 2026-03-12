import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {logoutRequest, deleteAccountRequest} from '@/features/auth/authSlice';
import {useRequireAuth} from '@/hooks/useRequireAuth';
import {changeLanguage} from '@/i18n';
import {languages} from '@/i18n/languages';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList>;
}

interface MenuItem {
  label: string;
  onPress: () => void;
  icon?: string;
  destructive?: boolean;
}

export default function ProfileScreen({navigation}: Props) {
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();
  const requireAuth = useRequireAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.authPrompt}>
        <View style={styles.authAvatarFallback}>
          <Text style={styles.authAvatarText}>?</Text>
        </View>
        <Text style={styles.authTitle}>{t('auth.loginRequiredProfile')}</Text>
        <Text style={styles.authMessage}>
          {t('auth.loginRequiredMessage')}
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => requireAuth()}>
          <Text style={styles.authButtonText}>{t('auth.signIn')}</Text>
        </TouchableOpacity>

        {/* Language - accessible without login */}
        <View style={styles.languageSectionGuest}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <View style={styles.card}>
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
                      i18n.language === lang.code &&
                        styles.languageChipTextActive,
                    ]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  const serviceMenuItems: MenuItem[] = [
    {
      label: t('profile.dashboard'),
      onPress: () => navigation.navigate('Dashboard'),
    },
    {
      label: t('profile.postService'),
      onPress: () => navigation.navigate('PostService'),
    },
    {
      label: t('profile.myServices'),
      onPress: () => navigation.navigate('MyServices'),
    },
    {
      label: t('profile.bookingRequests'),
      onPress: () => navigation.navigate('BookingRequests'),
    },
  ];

  const accountMenuItems: MenuItem[] = [
    {
      label: t('profile.favorites'),
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      label: t('profile.signOut'),
      onPress: () => {
        Alert.alert(
          t('profile.signOutConfirmTitle'),
          t('profile.signOutConfirmMessage'),
          [
            {text: t('common.cancel'), style: 'cancel'},
            {
              text: t('profile.signOut'),
              style: 'destructive',
              onPress: () => dispatch(logoutRequest()),
            },
          ],
        );
      },
      destructive: true,
    },
    {
      label: t('profile.deleteAccount'),
      onPress: () => {
        Alert.alert(
          t('profile.deleteAccountTitle'),
          t('profile.deleteAccountWarning'),
          [
            {text: t('common.cancel'), style: 'cancel'},
            {
              text: t('profile.deleteAccountConfirm'),
              style: 'destructive',
              onPress: () => dispatch(deleteAccountRequest()),
            },
          ],
        );
      },
      destructive: true,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {user?.avatar_url ? (
          <Image source={{uri: user.avatar_url}} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name ?? t('profile.guest')}</Text>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <View style={styles.card}>
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
                    i18n.language === lang.code &&
                      styles.languageChipTextActive,
                  ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Services */}
      <MenuSection title={t('profile.servicesSection')} items={serviceMenuItems} />

      {/* Account */}
      <MenuSection title={t('profile.accountSection')} items={accountMenuItems} />
    </ScrollView>
  );
}

function MenuSection({title, items}: {title: string; items: MenuItem[]}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, index < items.length - 1 && styles.menuItemBorder]}
            onPress={item.onPress}>
            <Text
              style={[
                styles.menuItemText,
                item.destructive && styles.menuItemDestructive,
              ]}>
              {item.label}
            </Text>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: theme.spacing.md,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  languageRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  languageChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  languageChipActive: {
    backgroundColor: theme.colors.primary,
  },
  languageChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  languageChipTextActive: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  menuItemDestructive: {
    color: '#E53935',
  },
  chevron: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  authAvatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  authAvatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  authMessage: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  authButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: theme.radius.md,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  languageSectionGuest: {
    marginTop: theme.spacing.xl,
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
});
