import {Share, Platform} from 'react-native';
import {logEvent} from '@/lib/analytics';
import type {Service, ProviderProfile} from '@/types';
import type {TFunction} from 'i18next';

export const shareService = async (service: Service, t: TFunction) => {
  const url = `https://glow.app/service/${service.id}`;
  const title = service.name;
  const ratingText = `\u2605 ${service.rating}`;
  const message = t('sharing.serviceMessage', {
    name: service.name,
    price: service.price,
    rating: ratingText,
    url,
  });

  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? {message, url}
        : {title, message: `${message}\n${url}`},
    );

    if (result.action === Share.sharedAction) {
      await logEvent('share_service', {
        service_id: service.id,
        service_name: service.name,
        activity_type: result.activityType ?? 'unknown',
      });
    }

    return result;
  } catch (error) {
    await logEvent('share_service_error', {
      service_id: service.id,
      error: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
};

export const shareProvider = async (provider: ProviderProfile, t: TFunction) => {
  const url = `https://glow.app/provider/${provider.id}`;
  const title = provider.name;
  const ratingText = `\u2605 ${provider.averageRating}`;
  const message = t('sharing.providerMessage', {
    name: provider.name,
    rating: ratingText,
    bookings: provider.totalBookings,
    url,
  });

  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? {message, url}
        : {title, message: `${message}\n${url}`},
    );

    if (result.action === Share.sharedAction) {
      await logEvent('share_provider', {
        provider_id: provider.id,
        provider_name: provider.name,
        activity_type: result.activityType ?? 'unknown',
      });
    }

    return result;
  } catch (error) {
    await logEvent('share_provider_error', {
      provider_id: provider.id,
      error: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
};
