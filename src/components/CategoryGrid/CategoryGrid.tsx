import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {theme} from '@/utils/theme';
import type {Category} from '@/types';

interface Props {
  categories: Category[];
  onPress: (categoryName: string) => void;
}

export default function CategoryGrid({categories, onPress}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={styles.item}
          onPress={() => onPress(cat.name)}
          activeOpacity={0.7}>
          <View style={styles.imageContainer}>
            {cat.image_url ? (
              <Image source={{uri: cat.image_url}} style={styles.image} />
            ) : (
              <View style={styles.iconFallback}>
                <Text style={styles.icon}>{cat.icon}</Text>
              </View>
            )}
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FDE8ED',
  },
  image: {
    width: 56,
    height: 56,
  },
  iconFallback: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
