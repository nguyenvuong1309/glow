import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {submitReview} from '@/features/services/serviceSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {BookingStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<BookingStackParamList, 'Review'>;
  route: RouteProp<BookingStackParamList, 'Review'>;
}

export default function ReviewScreen({navigation, route}: Props) {
  const {bookingId, serviceId} = route.params;
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const submitting = useSelector(
    (state: RootState) => state.services.reviewSubmitting,
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert(t('review.errorTitle'), t('review.validationRating'));
      return;
    }
    dispatch(
      submitReview({
        booking_id: bookingId,
        service_id: serviceId,
        rating,
        comment: comment.trim() || undefined,
      }),
    );
    Alert.alert(t('review.successTitle'), t('review.successMessage'), [
      {text: t('common.done'), onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('review.rating')}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} testID={`review-star-${star}`} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating && styles.starFilled]}>
              {'\u2605'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('review.comment')}</Text>
      <TextInput
        testID="review-comment-input"
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder={t('review.commentPlaceholder')}
        placeholderTextColor={theme.colors.textSecondary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        testID="review-submit-button"
        style={[styles.submitButton, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={submitting}>
        <Text style={styles.submitText}>{t('review.submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  stars: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  star: {
    fontSize: 36,
    color: theme.colors.border,
  },
  starFilled: {
    color: '#FFC107',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
