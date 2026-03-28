import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import {useTranslation} from 'react-i18next';
import {theme} from '@/utils/theme';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
interface Props {
  media: Asset[];
  existingImageUrls: string[];
  mediaError: string | null;
  onMediaChange: (media: Asset[]) => void;
  onExistingUrlsChange: (urls: string[]) => void;
  onMediaError: (error: string | null) => void;
}

export default function MediaPicker({
  media,
  existingImageUrls,
  mediaError,
  onMediaChange,
  onExistingUrlsChange,
  onMediaError,
}: Props) {
  const {t} = useTranslation();

  const handlePick = () => {
    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: MAX_IMAGES, quality: 0.8},
      response => {
        if (response.didCancel || response.errorCode) return;
        if (response.assets) {
          const valid = response.assets.filter(asset => {
            if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
              onMediaError(t('postService.fileTooLarge'));
              return false;
            }
            if (asset.type && !asset.type.startsWith('image/')) {
              onMediaError(t('postService.invalidFileType'));
              return false;
            }
            return true;
          });
          if (valid.length > 0) {
            const total = existingImageUrls.length + media.length + valid.length;
            const allowed = total <= MAX_IMAGES
              ? valid
              : valid.slice(0, MAX_IMAGES - existingImageUrls.length - media.length);
            onMediaChange([...media, ...allowed]);
            onMediaError(null);
          }
        }
      },
    );
  };

  const removeMedia = (index: number) => {
    onMediaChange(media.filter((_, i) => i !== index));
  };

  const removeExisting = (index: number) => {
    onExistingUrlsChange(existingImageUrls.filter((_, i) => i !== index));
  };

  return (
    <>
      <Text style={styles.label}>{t('postService.media')}</Text>
      {mediaError && <Text style={styles.error}>{mediaError}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mediaScroll}
        contentContainerStyle={styles.mediaScrollContent}>
        {existingImageUrls.map((url, index) => (
          <View key={url} style={styles.mediaThumbnailWrap}>
            <Image source={{uri: url}} style={styles.mediaThumbnail} />
            <TouchableOpacity
              style={styles.mediaRemoveButton}
              onPress={() => removeExisting(index)}>
              <Text style={styles.mediaRemoveText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
        {media.map((asset, index) => (
          <View key={asset.uri ?? `new-${index}`} style={styles.mediaThumbnailWrap}>
            <Image source={{uri: asset.uri}} style={styles.mediaThumbnail} />
            <TouchableOpacity
              style={styles.mediaRemoveButton}
              onPress={() => removeMedia(index)}>
              <Text style={styles.mediaRemoveText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
        {existingImageUrls.length + media.length < MAX_IMAGES && (
          <TouchableOpacity style={styles.addMediaButton} onPress={handlePick}>
            <Text style={styles.addMediaText}>+</Text>
            <Text style={styles.addMediaLabel}>{t('postService.addMedia')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
});
