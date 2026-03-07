import React, {useCallback} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {selectService} from '@/features/services/serviceSlice';
import {toggleFavorite} from '../favoritesSlice';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList>;
}

export default function FavoritesScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state: RootState) => state.favorites.ids);
  const allServices = useSelector((state: RootState) => state.services.list);

  const favorites = allServices.filter(s => favoriteIds.includes(s.id));

  const handlePress = (service: Service) => {
    dispatch(selectService(service));
    navigation.navigate('ServiceDetail', {serviceId: service.id});
  };

  const renderItem = useCallback(({item}: {item: Service}) => (
    <ServiceCard
      service={item}
      onPress={() => handlePress(item)}
      isFavorite
      onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
    />
  ), [dispatch, handlePress]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        favorites.length === 0 ? styles.centered : styles.list
      }
      data={favorites}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('favorites.empty')}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
