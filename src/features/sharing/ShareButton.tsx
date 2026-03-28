import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ViewStyle} from 'react-native';
import {useTranslation} from 'react-i18next';
import {theme} from '@/utils/theme';
import {shareService} from './shareService';
import type {Service} from '@/types';

interface ShareButtonProps {
  service: Service;
  size?: number;
  style?: ViewStyle;
}

export default function ShareButton({service, size = 24, style}: ShareButtonProps) {
  const {t} = useTranslation();

  const handlePress = () => {
    shareService(service, t);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      style={[styles.button, style]}
      accessibilityLabel={t('sharing.share')}
      accessibilityRole="button"
      testID="share-button"
    >
      <Text style={[styles.icon, {fontSize: size}]}>{'\u2197'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: theme.colors.textSecondary,
  },
});
