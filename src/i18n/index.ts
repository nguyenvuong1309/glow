import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import {createMMKV} from 'react-native-mmkv';
import {resources, supportedCodes, dateLocaleMap} from './languages';

const LANGUAGE_KEY = 'app-language';

const storage = createMMKV({id: 'glow-storage'});

function getInitialLanguage(): string {
  const saved = storage.getString(LANGUAGE_KEY);
  if (saved && supportedCodes.includes(saved)) {
    return saved;
  }
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const deviceLang = locales[0].languageCode;
    if (supportedCodes.includes(deviceLang)) {
      return deviceLang;
    }
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function changeLanguage(lang: string) {
  storage.set(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
}

export function getDateLocale(): string {
  return dateLocaleMap[i18n.language] ?? 'en-US';
}

export default i18n;
