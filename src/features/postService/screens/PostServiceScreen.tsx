import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Asset} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import {submitService, updateServiceRequest, clearPostService} from '../postServiceSlice';
import MediaPicker from '../components/MediaPicker';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {ProfileStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList>;
  route: RouteProp<ProfileStackParamList, 'PostService'>;
}

export default function PostServiceScreen({navigation, route}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {loading, posted, error: submitError} = useSelector(
    (state: RootState) => state.postService,
  );
  const categories = useSelector((state: RootState) => state.home.categories);

  const editService = route.params?.service;
  const isEdit = !!editService;

  const [media, setMedia] = useState<Asset[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(editService?.image_urls ?? []);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (posted && hasSubmitted.current) {
      const msg = isEdit
        ? t('postService.updateSuccessMessage')
        : t('postService.successMessage');
      Alert.alert(t('postService.successTitle'), msg, [
        {text: t('common.done'), onPress: () => navigation.goBack()},
      ]);
    }
  }, [posted, t, navigation, isEdit]);

  useEffect(() => {
    if (submitError && hasSubmitted.current) {
      Alert.alert(t('postService.errorTitle'), submitError);
      hasSubmitted.current = false;
    }
  }, [submitError, t]);

  useEffect(() => {
    return () => {
      dispatch(clearPostService());
    };
  }, [dispatch]);

  const schema = z.object({
    name: z.string().min(1, t('postService.validationName')),
    category_id: z.string().min(1, t('postService.validationCategory')),
    description: z.string().min(1, t('postService.validationDescription')),
    price: z.string().refine(v => {
      const n = Number(v);
      return n > 0 && n <= 100000;
    }, t('postService.validationPrice')),
    duration_minutes: z.number().min(5).max(480),
    address: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {control, handleSubmit, setValue, watch, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editService?.name ?? '',
      category_id: editService?.category_id ?? '',
      description: editService?.description ?? '',
      price: editService ? String(editService.price) : '',
      duration_minutes: editService?.duration_minutes ?? 60,
      address: editService?.address ?? '',
    },
  });

  const selectedCategory = watch('category_id');
  const durationMinutes = watch('duration_minutes');

  const durationHours = Math.floor(durationMinutes / 60);
  const durationMins = durationMinutes % 60;

  const durationDate = new Date();
  durationDate.setHours(durationHours, durationMins, 0, 0);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return t('postService.durationValue', {hours: h, minutes: m});
  };

  const onSubmit = (data: FormData) => {
    if (media.length === 0 && existingImageUrls.length === 0) {
      setMediaError(t('postService.validationMedia'));
      return;
    }

    const localMedia = media
      .filter(asset => !!asset.uri)
      .map(asset => ({
        uri: asset.uri!,
        fileName: asset.fileName || `image_${Date.now()}`,
        type: asset.type || 'image/jpeg',
      }));

    hasSubmitted.current = true;

    if (isEdit) {
      dispatch(
        updateServiceRequest({
          id: editService!.id,
          name: data.name,
          category_id: data.category_id,
          description: data.description,
          price: Number(data.price),
          duration_minutes: data.duration_minutes,
          address: data.address,
          localMedia,
          existingImageUrls,
          originalImageUrls: editService!.image_urls ?? [],
        }),
      );
    } else {
      dispatch(
        submitService({
          name: data.name,
          category_id: data.category_id,
          description: data.description,
          price: Number(data.price),
          duration_minutes: data.duration_minutes,
          address: data.address,
          localMedia,
        }),
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>{t('postService.name')}</Text>
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
      <Controller
        control={control}
        name="name"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={styles.textInput}
            placeholder={t('postService.namePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            maxLength={100}
            testID="post-service-name-input"
          />
        )}
      />

      <Text style={styles.label}>{t('postService.category')}</Text>
      {errors.category_id && <Text style={styles.error}>{errors.category_id.message}</Text>}
      <View style={styles.chipGrid}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              selectedCategory === cat.id && styles.chipSelected,
            ]}
            onPress={() => setValue('category_id', cat.id, {shouldValidate: true})}
            testID={`post-service-category-${cat.id}`}>
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat.id && styles.chipTextSelected,
              ]}>
              {cat.icon} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('postService.description')}</Text>
      {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}
      <Controller
        control={control}
        name="description"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder={t('postService.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            maxLength={1000}
            testID="post-service-description-input"
          />
        )}
      />

      <Text style={styles.label}>{t('postService.price')}</Text>
      {errors.price && <Text style={styles.error}>{errors.price.message}</Text>}
      <Controller
        control={control}
        name="price"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={styles.textInput}
            placeholder={t('postService.pricePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            testID="post-service-price-input"
          />
        )}
      />

      <Text style={styles.label}>{t('postService.duration')}</Text>
      <TouchableOpacity
        style={styles.durationField}
        onPress={() => setDurationPickerOpen(true)}
        testID="post-service-duration-button">
        <Text style={styles.durationFieldText}>
          {formatDuration(durationMinutes)}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={durationPickerOpen}
        date={durationDate}
        mode="time"
        is24hourSource="locale"
        minuteInterval={5}
        title={t('postService.duration')}
        confirmText={t('common.done')}
        cancelText={t('common.cancel')}
        onConfirm={date => {
          const totalMinutes = date.getHours() * 60 + date.getMinutes();
          setValue('duration_minutes', totalMinutes || 5, {shouldValidate: true});
          setDurationPickerOpen(false);
        }}
        onCancel={() => setDurationPickerOpen(false)}
      />

      <Text style={styles.label}>{t('postService.address')}</Text>
      <Controller
        control={control}
        name="address"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={styles.textInput}
            placeholder={t('postService.addressPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            maxLength={200}
            testID="post-service-address-input"
          />
        )}
      />

      <MediaPicker
        media={media}
        existingImageUrls={existingImageUrls}
        mediaError={mediaError}
        onMediaChange={setMedia}
        onExistingUrlsChange={setExistingImageUrls}
        onMediaError={setMediaError}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        testID="post-service-submit-button">
        {loading ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <Text style={styles.submitText}>
            {isEdit ? t('postService.update') : t('postService.submit')}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  error: {
    fontSize: 13,
    color: '#E53935',
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
  durationField: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  durationFieldText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});
