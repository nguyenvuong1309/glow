import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {loadProviderProfile} from '../providerSlice';
import {selectService} from '@/features/services/serviceSlice';
import {toggleFavorite} from '@/features/favorites/favoritesSlice';
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
  const {profile, profileLoading} = useSelector(
    (state: RootState) => state.provider,
  );
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const {userId} = route.params;

  useEffect(() => {
    dispatch(loadProviderProfile(userId));
  }, [dispatch, userId]);

  const handleServicePress = (service: Service) => {
    dispatch(selectService(service));
    navigation.navigate('ServiceDetail', {serviceId: service.id});
  };

  if (profileLoading || !profile) {
    return <ProviderProfileSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {profile.avatar_url ? (
          <Image source={{uri: profile.avatar_url}} style={styles.avatar} />
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
          onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
          isOwner={item.provider_id === currentUser?.id}
        />
      ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
  },
});
