import {createMMKV} from 'react-native-mmkv';
import type {MMKV} from 'react-native-mmkv';

let _storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!_storage) {
    _storage = createMMKV({id: 'glow-storage'});
  }
  return _storage;
}

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    getStorage().set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = getStorage().getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string) => {
    getStorage().remove(key);
    return Promise.resolve();
  },
};
