import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';

interface Language {
  code: string;
  label: string;
  dateLocale: string;
  translation: Record<string, any>;
}

export const languages: Language[] = [
  {code: 'en', label: 'English', dateLocale: 'en-US', translation: en},
  {code: 'vi', label: 'Tiếng Việt', dateLocale: 'vi-VN', translation: vi},
  {code: 'zh', label: '中文', dateLocale: 'zh-CN', translation: zh},
];

export const supportedCodes = languages.map(l => l.code);

export const resources = Object.fromEntries(
  languages.map(l => [l.code, {translation: l.translation}]),
);

export const dateLocaleMap = Object.fromEntries(
  languages.map(l => [l.code, l.dateLocale]),
);
