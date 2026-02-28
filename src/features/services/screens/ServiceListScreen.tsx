import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {loadServices, selectService} from '../serviceSlice';
import {selectCategory} from '@/features/home/homeSlice';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NavigationProp} from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

export default function ServiceListScreen({navigation}: Props) {
  const dispatch = useDispatch();
  const {list: services, loading} = useSelector(
    (state: RootState) => state.services,
  );
  const {categories, selectedCategory} = useSelector(
    (state: RootState) => state.home,
  );

  useEffect(() => {
    if (services.length === 0) {
      dispatch(loadServices());
    }
  }, [dispatch, services.length]);

  const filtered = selectedCategory
    ? services.filter(s => s.category === selectedCategory)
    : services;

  const handleServicePress = (service: Service) => {
    dispatch(selectService(service));
    navigation.navigate('ServiceDetail', {serviceId: service.id});
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipSelected]}
          onPress={() => dispatch(selectCategory(null))}>
          <Text
            style={[
              styles.chipText,
              !selectedCategory && styles.chipTextSelected,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              selectedCategory === cat.name && styles.chipSelected,
            ]}
            onPress={() =>
              dispatch(
                selectCategory(
                  selectedCategory === cat.name ? null : cat.name,
                ),
              )
            }>
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat.name && styles.chipTextSelected,
              ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No services found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <ServiceCard
              service={item}
              onPress={() => handleServicePress(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chips: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  list: {
    padding: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
