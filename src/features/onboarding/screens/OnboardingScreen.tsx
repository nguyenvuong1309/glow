import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ViewToken,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {mmkvStorage} from '@/lib/storage';
import {theme} from '@/utils/theme';

interface Slide {
  id: string;
  emoji: string;
  titleKey: string;
  subtitleKey: string;
  color: string;
  featureKeys?: string[];
}

const slides: Slide[] = [
  {
    id: '1',
    emoji: '\u{1F50D}',
    titleKey: 'onboarding.title1',
    subtitleKey: 'onboarding.subtitle1',
    color: '#E07A94',
    featureKeys: [
      'onboarding.feature1_1',
      'onboarding.feature1_2',
      'onboarding.feature1_3',
    ],
  },
  {
    id: '2',
    emoji: '\u{1F4C5}',
    titleKey: 'onboarding.title2',
    subtitleKey: 'onboarding.subtitle2',
    color: '#7B68EE',
    featureKeys: [
      'onboarding.feature2_1',
      'onboarding.feature2_2',
      'onboarding.feature2_3',
    ],
  },
  {
    id: '3',
    emoji: '\u{1F91D}',
    titleKey: 'onboarding.title3',
    subtitleKey: 'onboarding.subtitle3',
    color: '#4CAF50',
    featureKeys: [
      'onboarding.feature3_1',
      'onboarding.feature3_2',
      'onboarding.feature3_3',
    ],
  },
  {
    id: '4',
    emoji: '\u{1F4BC}',
    titleKey: 'onboarding.slide4Title',
    subtitleKey: 'onboarding.slide4Description',
    color: '#3B82F6',
    featureKeys: [
      'onboarding.feature4_1',
      'onboarding.feature4_2',
      'onboarding.feature4_3',
    ],
  },
  {
    id: '5',
    emoji: '\u{1F381}',
    titleKey: 'onboarding.slide5Title',
    subtitleKey: 'onboarding.slide5Description',
    color: '#FF6F61',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({onComplete}: Props) {
  const {t} = useTranslation();
  const {width: screenWidth} = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({index: activeIndex + 1, animated: true});
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    mmkvStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const renderItem = ({item}: {item: Slide}) => (
    <View style={[styles.slide, {width: screenWidth}]} testID={`onboarding-slide-${item.id}`}>
      <View style={[styles.emojiCircle, {backgroundColor: item.color + '20'}]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.title} testID={`onboarding-title-${item.id}`}>{t(item.titleKey)}</Text>
      <Text style={styles.subtitle}>{t(item.subtitleKey)}</Text>
      {item.featureKeys && item.featureKeys.length > 0 && (
        <View style={styles.features}>
          {item.featureKeys.map((key, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[styles.featureDot, {backgroundColor: item.color}]} />
              <Text style={styles.featureText}>{t(key)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const isLast = activeIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} testID="onboarding-screen">
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        testID="onboarding-slides"
      />

      <View style={styles.footer}>
        <View style={styles.dots} testID="onboarding-dots">
          {slides.map((slide, i) => (
            <View
              key={slide.id}
              testID={`onboarding-dot-${i}`}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8} testID="onboarding-next-button">
          <Text style={styles.buttonText} testID="onboarding-next-text">
            {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity onPress={handleComplete} style={styles.skipButton} testID="onboarding-skip-button">
            <Text style={styles.skipText}>{t('onboarding.getStarted')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginTop: theme.spacing.lg,
    alignSelf: 'stretch',
    paddingHorizontal: theme.spacing.md,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  skipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
