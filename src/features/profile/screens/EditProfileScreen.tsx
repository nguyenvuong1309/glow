import React, {useEffect, useState} from 'react';
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
import {launchImageLibrary} from 'react-native-image-picker';
import ImageViewing from 'react-native-image-viewing';
import {updateProfileRequest, uploadAvatarRequest} from '../profileSlice';
import {theme} from '@/utils/theme';
import type {RootState} from '@/store';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '@/navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList>;
}

export default function EditProfileScreen({navigation}: Props) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const {updating, uploadingAvatar, error} = useSelector(
    (state: RootState) => state.profile,
  );
  const [avatarViewerVisible, setAvatarViewerVisible] = useState(false);

  const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;

  const validationSchema = z.object({
    name: z.string().min(1, t('editProfile.validationName')),
    phone: z
      .string()
      .refine(val => !val || phoneRegex.test(val), t('editProfile.validationPhone'))
      .optional(),
    bio: z.string().max(500, t('editProfile.validationBio')).optional(),
    address: z.string().max(200, t('editProfile.validationAddress')).optional(),
  });

  type FormData = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
      address: user?.address ?? '',
    },
  });

  useEffect(() => {
    if (error) {
      Alert.alert(t('editProfile.errorTitle'), error);
    }
  }, [error, t]);

  const handlePickAvatar = () => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8, maxWidth: 512, maxHeight: 512},
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        const asset = response.assets?.[0];
        if (asset?.uri) {
          dispatch(
            uploadAvatarRequest({
              uri: asset.uri,
              fileName: asset.fileName || `avatar_${Date.now()}.jpg`,
              type: asset.type || 'image/jpeg',
            }),
          );
        }
      },
    );
  };

  const onSubmit = (data: FormData) => {
    dispatch(
      updateProfileRequest({
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        address: data.address,
      }),
    );
  };

  // Track profile update completion
  const prevUpdating = React.useRef(updating);
  useEffect(() => {
    if (prevUpdating.current && !updating && !error) {
      Alert.alert(t('editProfile.successTitle'), t('editProfile.successMessage'), [
        {text: t('common.done'), onPress: () => navigation.goBack()},
      ]);
    }
    prevUpdating.current = updating;
  }, [updating, error, t, navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID="edit-profile-screen">
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          onPress={handlePickAvatar}
          onLongPress={() => user?.avatar_url && setAvatarViewerVisible(true)}
          disabled={uploadingAvatar}
          testID="edit-profile-avatar-button">
          {user?.avatar_url ? (
            <Image source={{uri: user.avatar_url}} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color={theme.colors.surface} />
            ) : (
              <Text style={styles.cameraIconText}>📷</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>
          {t('editProfile.changePhoto')}
        </Text>
      </View>

      {user?.avatar_url && (
        <ImageViewing
          images={[{uri: user.avatar_url}]}
          imageIndex={0}
          visible={avatarViewerVisible}
          onRequestClose={() => setAvatarViewerVisible(false)}
        />
      )}

      {/* Name */}
      <Text style={styles.label}>{t('editProfile.name')}</Text>
      {errors.name && (
        <Text style={styles.error}>{errors.name.message}</Text>
      )}
      <Controller
        control={control}
        name="name"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={styles.textInput}
            placeholder={t('editProfile.namePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            maxLength={100}
            testID="edit-profile-name-input"
          />
        )}
      />

      {/* Phone */}
      <Text style={styles.label}>{t('editProfile.phone')}</Text>
      {errors.phone && (
        <Text style={styles.error}>{errors.phone.message}</Text>
      )}
      <Controller
        control={control}
        name="phone"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={styles.textInput}
            placeholder={t('editProfile.phonePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            keyboardType="phone-pad"
            maxLength={20}
            testID="edit-profile-phone-input"
          />
        )}
      />

      {/* Bio */}
      <Text style={styles.label}>{t('editProfile.bio')}</Text>
      {errors.bio && (
        <Text style={styles.error}>{errors.bio.message}</Text>
      )}
      <Controller
        control={control}
        name="bio"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder={t('editProfile.bioPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            maxLength={500}
            testID="edit-profile-bio-input"
          />
        )}
      />

      {/* Address */}
      <Text style={styles.label}>{t('editProfile.address')}</Text>
      {errors.address && (
        <Text style={styles.error}>{errors.address.message}</Text>
      )}
      <Controller
        control={control}
        name="address"
        render={({field: {onChange, value}}) => (
          <TextInput
            style={styles.textInput}
            placeholder={t('editProfile.addressPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChange}
            maxLength={200}
            testID="edit-profile-address-input"
          />
        )}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={updating}
        testID="edit-profile-save-button">
        {updating ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <Text style={styles.submitText}>{t('editProfile.save')}</Text>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  cameraIconText: {
    fontSize: 14,
  },
  changePhotoText: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
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
