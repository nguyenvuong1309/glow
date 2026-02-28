import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {loadCategories} from '../homeSlice';
import {loadServices, selectService, setFilter} from '@/features/services/serviceSlice';
import ServiceCard from '@/components/ServiceCard/ServiceCard';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {Service} from '@/types';
import type {NavigationProp} from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

export default function HomeScreen({navigation}: Props) {
  const dispatch = useDispatch();
  const {categories, loading: catLoading} = useSelector(
    (state: RootState) => state.home,
  );
  const {list: services, loading: svcLoading, filter} = useSelector(
    (state: RootState) => state.services,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(loadCategories());
    dispatch(loadServices());
  }, [dispatch]);

  const popularServices = services.slice(0, 6);

  const handleServicePress = (service: Service) => {
    dispatch(selectService(service));
    navigation.navigate('ServiceDetail', {serviceId: service.id});
  };

  const handleCategoryPress = (categoryName: string) => {
    const isSelected = filter.categories.includes(categoryName);
    dispatch(
      setFilter({
        categories: isSelected ? [] : [categoryName],
      }),
    );
    navigation.navigate('Services');
  };

  if (catLoading || svcLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.greeting}>
            Hello, {user?.name ?? 'Beautiful'} ✨
          </Text>
          <Text style={styles.subtitle}>What would you like today?</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  filter.categories.includes(cat.name) && styles.chipSelected,
                ]}
                onPress={() => handleCategoryPress(cat.name)}>
                <Text
                  style={[
                    styles.chipText,
                    filter.categories.includes(cat.name) &&
                      styles.chipTextSelected,
                  ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <Animated.FlatList
            data={popularServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            itemLayoutAnimation={LinearTransition.springify().damping(18).stiffness(120)}
            renderItem={({item, index}) => (
              <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
                <ServiceCard
                  service={item}
                  onPress={() => handleServicePress(item)}
                  horizontal
                />
              </Animated.View>
            )}
            scrollEnabled={false}
            contentContainerStyle={styles.horizontalList}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  chips: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
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
  horizontalList: {
    paddingBottom: theme.spacing.md,
  },
});
