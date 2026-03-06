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
  Image,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import {submitService, updateServiceRequest, clearPostService} from '../postServiceSlice';
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
  const [existingImageUrl, setExistingImageUrl] = useState(editService?.image_url ?? '');
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

  const handlePickMedia = () => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 5},
      response => {
        if (response.didCancel || response.errorCode) return;
        if (response.assets) {
          const valid = response.assets.filter(asset => {
            if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
              setMediaError(t('postService.fileTooLarge'));
              return false;
            }
            if (asset.type && !ALLOWED_TYPES.includes(asset.type)) {
              setMediaError(t('postService.invalidFileType'));
              return false;
            }
            return true;
          });
          if (valid.length > 0) {
            setMedia(prev => [...prev, ...valid].slice(0, 5));
            setExistingImageUrl('');
            setMediaError(null);
          }
        }
      },
    );
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    if (media.length === 0 && !existingImageUrl) {
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
          localMedia,
          existingImageUrl,
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
            onPress={() => setValue('category_id', cat.id, {shouldValidate: true})}>
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
          />
        )}
      />

      <Text style={styles.label}>{t('postService.duration')}</Text>
      <TouchableOpacity
        style={styles.durationField}
        onPress={() => setDurationPickerOpen(true)}>
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

      <Text style={styles.label}>{t('postService.media')}</Text>
      {mediaError && <Text style={styles.error}>{mediaError}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mediaScroll}
        contentContainerStyle={styles.mediaScrollContent}>
        {existingImageUrl ? (
          <View style={styles.mediaThumbnailWrap}>
            <Image source={{uri: existingImageUrl}} style={styles.mediaThumbnail} />
            <TouchableOpacity
              style={styles.mediaRemoveButton}
              onPress={() => setExistingImageUrl('')}>
              <Text style={styles.mediaRemoveText}>X</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {media.map((asset, index) => (
          <View key={asset.uri ?? index} style={styles.mediaThumbnailWrap}>
            <Image source={{uri: asset.uri}} style={styles.mediaThumbnail} />
            <TouchableOpacity
              style={styles.mediaRemoveButton}
              onPress={() => removeMedia(index)}>
              <Text style={styles.mediaRemoveText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
        {media.length < 5 && !existingImageUrl && (
          <TouchableOpacity style={styles.addMediaButton} onPress={handlePickMedia}>
            <Text style={styles.addMediaText}>+</Text>
            <Text style={styles.addMediaLabel}>{t('postService.addMedia')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}>
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
  mediaScroll: {
    marginTop: theme.spacing.xs,
  },
  mediaScrollContent: {
    gap: theme.spacing.sm,
  },
  mediaThumbnailWrap: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  mediaRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaRemoveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  addMediaButton: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  addMediaText: {
    fontSize: 28,
    color: theme.colors.textSecondary,
    lineHeight: 32,
  },
  addMediaLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
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
