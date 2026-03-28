import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {loadProviderProfile} from '../providerSlice';
import {selectService, loadReviews} from '@/features/services/serviceSlice';
import {toggleFavorite} from '@/features/favorites/favoritesSlice';
import {useRequireAuth} from '@/hooks/useRequireAuth';
import {logEvent, AnalyticsEvents} from '@/lib/analytics';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {HomeStackParamList} from '@/navigation/types';
import ProviderProfileSkeleton from '@/components/Skeleton/ProviderProfileSkeleton';

interface Props {
  navigation: NativeStackNavigationProp<HomeStackParamList>;
  route: RouteProp<HomeStackParamList, 'ProviderProfile'>;
}

export default function ProviderProfileScreen({navigation, route}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const requireAuth = useRequireAuth();
  const {profile, profileLoading} = useSelector(
    (state: RootState) => state.provider,
  );
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [avatarViewerVisible, setAvatarViewerVisible] = useState(false);
  const {userId} = route.params;

  useEffect(() => {
    dispatch(loadProviderProfile(userId));
    logEvent(AnalyticsEvents.VIEW_PROVIDER, {provider_id: userId});
  }, [dispatch, userId]);

  const handleServicePress = (service: Service) => {
    dispatch(selectService(service));
    dispatch(loadReviews(service.id));
    navigation.navigate('ServiceDetail', {serviceId: service.id});
  };

  const handleToggleFavorite = (serviceId: string) => {
    if (!requireAuth()) return;
    dispatch(toggleFavorite(serviceId));
  };

  if (profileLoading || !profile) {
    return <ProviderProfileSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID="provider-profile-screen">
      {/* Header */}
      <View style={styles.header}>
        {profile.avatar_url ? (
          <TouchableOpacity onPress={() => setAvatarViewerVisible(true)}>
            <Image source={{uri: profile.avatar_url}} style={styles.avatar} />
          </TouchableOpacity>
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{profile.name}</Text>
        {profile.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.noBio}>{t('provider.noBio')}</Text>
        )}
      </View>

      {/* Contact Info */}
      {(profile.phone || profile.address) && (
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>{t('provider.contactInfo')}</Text>
          {profile.phone && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>{t('provider.phone')}</Text>
              <Text style={styles.contactValue}>{profile.phone}</Text>
            </View>
          )}
          {profile.address && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>{t('provider.address')}</Text>
              <Text style={styles.contactValue}>{profile.address}</Text>
            </View>
          )}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : '-'}
          </Text>
          <Text style={styles.statLabel}>{t('provider.avgRating')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.totalBookings}</Text>
          <Text style={styles.statLabel}>{t('provider.totalBookings')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.services.length}</Text>
          <Text style={styles.statLabel}>{t('provider.services')}</Text>
        </View>
      </View>

      {/* Services */}
      <Text style={styles.sectionTitle}>{t('provider.services')}</Text>
      {profile.services.map(item => (
        <ServiceCard
          key={item.id}
          service={item}
          onPress={() => handleServicePress(item)}
          isFavorite={favoriteIds.includes(item.id)}
          onToggleFavorite={() => handleToggleFavorite(item.id)}
          isOwner={item.provider_id === currentUser?.id}
        />
      ))}

      {profile.avatar_url && (
        <ImageViewing
          images={[{uri: profile.avatar_url}]}
          imageIndex={0}
          visible={avatarViewerVisible}
          onRequestClose={() => setAvatarViewerVisible(false)}
        />
      )}
    </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
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
  bio: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  noBio: {
    fontSize: 14,
    color: theme.colors.border,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  contactSection: {
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  contactLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  contactValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
  },
});
