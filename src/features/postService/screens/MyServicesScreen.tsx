import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {loadMyServices} from '../postServiceSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList>;
}

export default function MyServicesScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const services = useSelector(
    (state: RootState) => state.postService.myServices,
  );
  const loading = useSelector(
    (state: RootState) => state.postService.myServicesLoading,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(loadMyServices());
    }, [dispatch]),
  );

  const renderItem = ({item}: {item: Service}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PostService', {service: item})}>
      {item.image_url ? (
        <Image source={{uri: item.image_url}} style={styles.cardImage} />
      ) : null}
      <View style={styles.cardContent}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.meta}>
          <Text style={styles.price}>${item.price}</Text>
          <Text style={styles.duration}>
            {item.duration_minutes} {t('myServices.min')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && services.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        services.length === 0 ? styles.centered : styles.listContent
      }
      data={services}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => dispatch(loadMyServices())}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('myServices.empty')}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardImage: {
    width: 80,
    height: 80,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  category: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  duration: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
