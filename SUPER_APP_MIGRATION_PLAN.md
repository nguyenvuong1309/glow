# Glow Super App Setup Plan

> Re.Pack + Module Federation | React Native 0.84.1
> Ngày tạo: 2026-03-23

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc mục tiêu](#2-kiến-trúc-mục-tiêu)
3. [Phase 1: Setup Re.Pack thay Metro](#3-phase-1-setup-repack-thay-metro)
4. [Phase 2: Cấu hình Module Federation trên host](#4-phase-2-cấu-hình-module-federation-trên-host)
5. [Phase 3: Tạo mini-chat app](#5-phase-3-tạo-mini-chat-app)
6. [Phase 4: Tích hợp mini-chat vào host](#6-phase-4-tích-hợp-mini-chat-vào-host)
7. [Phase 5: Production setup](#7-phase-5-production-setup)
8. [Chi tiết kỹ thuật: Cấu trúc thư mục](#8-chi-tiết-kỹ-thuật-cấu-trúc-thư-mục)
9. [Chi tiết kỹ thuật: Module Federation config](#9-chi-tiết-kỹ-thuật-module-federation-config)
10. [Chi tiết kỹ thuật: Share state giữa host và mini-chat](#10-chi-tiết-kỹ-thuật-share-state-giữa-host-và-mini-chat)
11. [Rủi ro và giải pháp](#11-rủi-ro-và-giải-pháp)
12. [Checklist tổng hợp](#12-checklist-tổng-hợp)

---

## 1. Tổng quan

### 1.1 Ý tưởng

- **Giữ nguyên app hiện tại** — không tách, không restructure
- App hiện tại trở thành **host app** (shell)
- Chỉ đổi bundler: **Metro → Rspack** (Re.Pack)
- Thêm **mini-chat** là mini-app đầu tiên, load động qua Module Federation
- Sau này muốn thêm mini-app mới → cùng pattern, không cần sửa host

### 1.2 Phạm vi thay đổi trên app hiện tại

| Thay đổi | File |
|----------|------|
| Đổi bundler | `rspack.config.mjs` (mới), xóa `metro.config.js` |
| Cập nhật babel | `babel.config.js` |
| Cập nhật RN config | `react-native.config.js` |
| Thêm ScriptManager | `index.js` |
| Thêm Chat tab/entry | `src/navigation/MainNavigator.tsx` |
| iOS build phase | Xcode build settings |
| Android build | `android/app/build.gradle` |

**Không thay đổi**: Tất cả screens, features, store, components, lib hiện tại.

---

## 2. Kiến trúc mục tiêu

```
┌──────────────────────────────────────────────────┐
│              GLOW APP (Host)                     │
│                                                  │
│  Giữ nguyên toàn bộ code hiện tại:              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │
│  │ Home   │ │Services│ │Booking │ │ Profile  │  │
│  │ (local)│ │(local) │ │(local) │ │ (local)  │  │
│  └────────┘ └────────┘ └────────┘ └──────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │            Chat (Remote)                 │    │
│  │     Load động qua Module Federation      │    │
│  │                                          │    │
│  │  ChatListScreen  │  ChatRoomScreen       │    │
│  │  ContactsScreen  │  ...                  │    │
│  └──────────────────────────────────────────┘    │
│       ↑                                          │
│  React.lazy + Federated.importModule             │
│  (download bundle từ dev server / CDN)           │
└──────────────────────────────────────────────────┘
```

### Tại sao cách này tốt?

- **Zero risk cho code hiện tại** — không refactor gì, chỉ đổi bundler
- **mini-chat phát triển độc lập** — repo riêng hoặc folder riêng, build riêng
- **Deploy chat feature không cần submit app store** — chỉ upload bundle mới lên CDN
- **Thêm mini-app tiếp theo cùng pattern** — copy config mini-chat, đổi tên

---

## 3. Phase 1: Setup Re.Pack thay Metro

> **Mục tiêu**: App hiện tại chạy y hệt, chỉ đổi bundler
> **Ước lượng**: 1-2 ngày

### 3.1 Cài đặt dependencies

```bash
pnpm add -D @callstack/repack@5.2.5 @rspack/core @swc/helpers
pnpm add -D @callstack/repack-plugin-reanimated
pnpm add @module-federation/enhanced @module-federation/runtime
```

### 3.2 Tạo `rspack.config.mjs`

```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import { ReanimatedPlugin } from '@callstack/repack-plugin-reanimated';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default Repack.defineRspackConfig(({ mode, platform }) => {
  return {
    mode,
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions(),
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          type: 'javascript/auto',
          use: {
            loader: '@callstack/repack/babel-swc-loader',
            options: {},
          },
        },
        ...Repack.getAssetTransformRules(),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new ReanimatedPlugin({
        unstable_disableTransform: true,
      }),
    ],
  };
});
```

### 3.3 Cập nhật `babel.config.js`

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      envName: 'APP_ENV',
      moduleName: '@env',
      path: '.env',
      safe: true,
      allowUndefined: false,
    }],
    // Không cần module-resolver nữa → dùng resolve.alias trong rspack
    '@babel/plugin-transform-export-namespace-from',
    'react-native-worklets/plugin', // ĐỔI từ 'react-native-reanimated/plugin'
  ],
};
```

### 3.4 Cập nhật `react-native.config.js`

```javascript
module.exports = {
  commands: require('@callstack/repack/commands/rspack'),
  dependencies: {
    '@invertase/react-native-apple-authentication': {
      platforms: { android: null },
    },
  },
};
```

### 3.5 Cập nhật iOS build phase

Xcode → Build Phases → "Bundle React Native code and images", thêm ở đầu script:

```bash
export BUNDLE_COMMAND=rspack-bundle
```

### 3.6 Cập nhật Android

**`android/app/build.gradle`** — thêm vào block `react`:

```gradle
react {
    bundleCommand = "rspack-bundle"
}
```

### 3.7 Test

```bash
# Dev
npx react-native start --reset-cache
npx react-native run-ios
npx react-native run-android

# Release (quan trọng — test Reanimated)
npx react-native run-ios --mode Release
npx react-native run-android --mode release
```

### 3.8 Sau khi mọi thứ OK

```bash
rm metro.config.js
```

### 3.9 Checklist Phase 1

- [ ] Cài Re.Pack + Rspack + Reanimated plugin
- [ ] Tạo `rspack.config.mjs`
- [ ] Cập nhật `babel.config.js` (đổi reanimated plugin, bỏ module-resolver)
- [ ] Cập nhật `react-native.config.js`
- [ ] Cập nhật iOS build phase
- [ ] Cập nhật Android build.gradle
- [ ] Test dev mode iOS + Android
- [ ] Test release mode iOS + Android ← **critical**
- [ ] Verify: animations, Firebase, Google Sign-In, MMKV, Image Picker
- [ ] Xóa `metro.config.js`

---

## 4. Phase 2: Cấu hình Module Federation trên host

> **Mục tiêu**: Host sẵn sàng load remote mini-apps
> **Ước lượng**: 1 ngày

### 4.1 Thêm ScriptManager vào `index.js`

```javascript
import 'react-native-url-polyfill/auto';
import { AppRegistry, Platform } from 'react-native';
import { ScriptManager, Script, Federated } from '@callstack/repack/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App';
import { name as appName } from './app.json';

// Cache remote bundles đã download
ScriptManager.shared.setStorage(AsyncStorage);

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  // Chunks của host app
  if (caller === 'main') {
    return {
      url: Script.getDevServerURL(scriptId),
    };
  }

  // Remote mini-apps
  const resolveURL = Federated.createURLResolver({
    containers: {
      'mini-chat': __DEV__
        ? `http://localhost:9001/${Platform.OS}/[name][ext]`
        : `https://cdn.your-domain.com/mini-chat/${Platform.OS}/[name][ext]`,
    },
  });

  const url = resolveURL(scriptId, caller);
  if (url) {
    return {
      url,
      query: { platform: Platform.OS },
      verifyScriptSignature: __DEV__ ? 'off' : 'strict',
    };
  }
});

AppRegistry.registerComponent(appName, () => App);
```

### 4.2 Thêm Module Federation vào `rspack.config.mjs`

```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import { ReanimatedPlugin } from '@callstack/repack-plugin-reanimated';
import rspack from '@rspack/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default Repack.defineRspackConfig(({ mode, platform }) => {
  return {
    mode,
    context: __dirname,
    entry: './index.js',
    output: {
      uniqueName: 'glow-host',
    },
    resolve: {
      ...Repack.getResolveOptions(),
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          type: 'javascript/auto',
          use: {
            loader: '@callstack/repack/babel-swc-loader',
            options: {},
          },
        },
        ...Repack.getAssetTransformRules(),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new ReanimatedPlugin({ unstable_disableTransform: true }),

      // Fix webpack warning từ gesture-handler
      new rspack.IgnorePlugin({
        resourceRegExp: /ReactFabricPublicInstance/,
      }),

      // Module Federation — host consumes remote mini-apps
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'host',
        dts: false,
        remotes: {
          'mini-chat': `mini-chat@http://localhost:9001/${platform}/mf-manifest.json`,
          // Thêm mini-apps mới ở đây sau này
        },
        shared: {
          // React core — PHẢI singleton
          react: { singleton: true, eager: true },
          'react-native': { singleton: true, eager: true },

          // Native modules — PHẢI singleton
          'react-native-reanimated': { singleton: true, eager: true },
          'react-native-gesture-handler': { singleton: true, eager: true },
          'react-native-screens': { singleton: true, eager: true },
          'react-native-safe-area-context': { singleton: true, eager: true },
          'react-native-mmkv': { singleton: true, eager: true },
          '@react-native-firebase/app': { singleton: true, eager: true },
          '@react-native-firebase/crashlytics': { singleton: true, eager: true },
          '@gorhom/bottom-sheet': { singleton: true, eager: true },

          // Navigation
          '@react-navigation/native': { singleton: true, eager: true },
          '@react-navigation/native-stack': { singleton: true, eager: true },
          '@react-navigation/bottom-tabs': { singleton: true, eager: true },
          '@react-navigation/stack': { singleton: true, eager: true },

          // State management
          'react-redux': { singleton: true, eager: true },
          '@reduxjs/toolkit': { singleton: true, eager: true },
          'redux-saga': { singleton: true, eager: true },
          'redux-persist': { singleton: true, eager: true },

          // Các thư viện dùng chung
          'i18next': { singleton: true, eager: true },
          'react-i18next': { singleton: true, eager: true },
          '@supabase/supabase-js': { singleton: true, eager: true },
          'react-hook-form': { singleton: true, eager: true },
          'zod': { singleton: true, eager: true },
        },
      }),
    ],
  };
});
```

### 4.3 Checklist Phase 2

- [ ] Cập nhật `index.js` — thêm ScriptManager + resolver
- [ ] Cập nhật `rspack.config.mjs` — thêm MF plugin với shared deps
- [ ] Test app vẫn chạy bình thường (chưa có mini-app nào)
- [ ] Verify không có regression

---

## 5. Phase 3: Tạo mini-chat app

> **Mục tiêu**: Tạo mini-chat build được độc lập, expose ChatNavigator
> **Ước lượng**: 2-5 ngày (tuỳ scope tính năng chat)

### 5.1 Cấu trúc thư mục

```
mini-chat/
├── src/
│   ├── ChatNavigator.tsx           # Exposed module — host import cái này
│   ├── screens/
│   │   ├── ChatListScreen.tsx      # Danh sách conversations
│   │   ├── ChatRoomScreen.tsx      # Chat room
│   │   └── ContactsScreen.tsx      # Chọn người chat
│   ├── components/
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── ConversationItem.tsx
│   ├── chatSlice.ts                # Redux slice cho chat state
│   ├── chatSaga.ts                 # Saga cho realtime messages
│   └── index.js                    # Entry point (standalone mode)
├── rspack.config.mjs
├── babel.config.js
├── app.json                        # Chỉ cần cho standalone mode
└── package.json
```

### 5.2 `mini-chat/package.json`

```json
{
  "name": "mini-chat",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.js",
  "scripts": {
    "start": "react-native rspack-start --port 9001",
    "bundle:ios": "react-native rspack-bundle --platform ios --dev false --entry-file src/index.js --bundle-output build/ios/main.jsbundle",
    "bundle:android": "react-native rspack-bundle --platform android --dev false --entry-file src/index.js --bundle-output build/android/main.jsbundle"
  },
  "dependencies": {
    "react": "19.2.3",
    "react-native": "0.84.1",
    "@reduxjs/toolkit": "^2.11.2",
    "react-redux": "^9.2.0",
    "redux-saga": "^1.4.2",
    "@react-navigation/native": "^7.1.31",
    "@react-navigation/native-stack": "^7.14.2",
    "@supabase/supabase-js": "^2.98.0",
    "react-native-reanimated": "^4.2.2",
    "react-native-gesture-handler": "^2.30.0",
    "react-native-screens": "^4.24.0",
    "react-native-safe-area-context": "^5.7.0",
    "i18next": "^25.8.13",
    "react-i18next": "^16.5.4"
  },
  "devDependencies": {
    "@callstack/repack": "5.2.5",
    "@rspack/core": "^1.0.0",
    "@swc/helpers": "^0.5.0",
    "@callstack/repack-plugin-reanimated": "^1.0.0",
    "@module-federation/enhanced": "^0.6.10",
    "typescript": "^5.8.3",
    "@react-native/babel-preset": "0.84.1",
    "@babel/core": "^7.25.2"
  }
}
```

> **Lưu ý**: Versions phải match với host app. Nếu dùng monorepo thì dùng `workspace:*`.

### 5.3 `mini-chat/rspack.config.mjs`

```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import { ReanimatedPlugin } from '@callstack/repack-plugin-reanimated';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDALONE = process.env.STANDALONE === 'true';

export default Repack.defineRspackConfig(({ mode, platform }) => {
  return {
    mode,
    context: __dirname,
    entry: './src/index.js',
    devServer: {
      port: 9001,
    },
    output: {
      uniqueName: 'mini-chat',
    },
    resolve: {
      ...Repack.getResolveOptions(),
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          type: 'javascript/auto',
          use: {
            loader: '@callstack/repack/babel-swc-loader',
            options: {},
          },
        },
        ...Repack.getAssetTransformRules(),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new ReanimatedPlugin({ unstable_disableTransform: true }),

      new Repack.plugins.ModuleFederationPluginV2({
        name: 'mini-chat',
        filename: 'mini-chat.container.js.bundle',
        exposes: {
          // Host sẽ import module này
          './ChatNavigator': './src/ChatNavigator',
        },
        shared: {
          react: { singleton: true, eager: STANDALONE },
          'react-native': { singleton: true, eager: STANDALONE },
          'react-native-reanimated': { singleton: true, eager: STANDALONE },
          'react-native-gesture-handler': { singleton: true, eager: STANDALONE },
          'react-native-screens': { singleton: true, eager: STANDALONE },
          'react-native-safe-area-context': { singleton: true, eager: STANDALONE },
          '@react-navigation/native': { singleton: true, eager: STANDALONE },
          '@react-navigation/native-stack': { singleton: true, eager: STANDALONE },
          'react-redux': { singleton: true, eager: STANDALONE },
          '@reduxjs/toolkit': { singleton: true, eager: STANDALONE },
          'redux-saga': { singleton: true, eager: STANDALONE },
          'i18next': { singleton: true, eager: STANDALONE },
          'react-i18next': { singleton: true, eager: STANDALONE },
          '@supabase/supabase-js': { singleton: true, eager: STANDALONE },
        },
      }),
    ],
  };
});
```

### 5.4 `mini-chat/babel.config.js`

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    'react-native-worklets/plugin',
  ],
};
```

### 5.5 `mini-chat/src/ChatNavigator.tsx` (exposed module)

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ChatListScreen from './screens/ChatListScreen';
import ChatRoomScreen from './screens/ChatRoomScreen';
import ContactsScreen from './screens/ContactsScreen';

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { conversationId: string; recipientName: string };
  Contacts: undefined;
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatNavigator() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        // headerShown: false để host không bị double header
        headerShown: false,
      }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
    </Stack.Navigator>
  );
}
```

### 5.6 `mini-chat/src/index.js` (standalone mode)

```javascript
import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ChatNavigator from './ChatNavigator';

// Standalone mode: mini-chat chạy như app riêng (để dev/test)
function StandaloneApp() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <ChatNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

AppRegistry.registerComponent('mini-chat', () => StandaloneApp);
```

### 5.7 Checklist Phase 3

- [ ] Tạo thư mục `mini-chat/` (cùng cấp hoặc repo riêng)
- [ ] Setup `package.json` với đúng versions
- [ ] Tạo `rspack.config.mjs` với MF provider config
- [ ] Tạo `babel.config.js`
- [ ] Tạo `ChatNavigator.tsx` (exposed module)
- [ ] Tạo screens: ChatListScreen, ChatRoomScreen, ContactsScreen
- [ ] Tạo `index.js` cho standalone mode
- [ ] Test standalone: `STANDALONE=true pnpm start`
- [ ] Test mini-chat dev server chạy ở port 9001

---

## 6. Phase 4: Tích hợp mini-chat vào host

> **Mục tiêu**: Host load ChatNavigator từ mini-chat, hiển thị trong tab mới
> **Ước lượng**: 1 ngày

### 6.1 Thêm Chat tab vào `MainNavigator.tsx`

Chỉ cần sửa **1 file** trong host:

```typescript
// src/navigation/MainNavigator.tsx
// Thêm imports
import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Federated } from '@callstack/repack/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ... giữ nguyên tất cả imports và code hiện tại ...

// Thêm: Lazy load ChatNavigator từ remote
const ChatNavigator = React.lazy(() =>
  Federated.importModule('mini-chat', './ChatNavigator')
);

function ChatLoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

function ChatTab() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ChatLoadingFallback />}>
        <ChatNavigator />
      </Suspense>
    </ErrorBoundary>
  );
}

// Trong MainNavigator, thêm tab Chat
export default function MainNavigator() {
  const {t} = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryDark,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}>
      {/* ... 4 tabs hiện tại giữ nguyên ... */}

      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{tabBarLabel: t('navigation.home'), tabBarTestID: 'tab-home'}}
      />
      <Tab.Screen
        name="Services"
        component={ServiceStackScreen}
        options={{tabBarLabel: t('navigation.services'), tabBarTestID: 'tab-services'}}
      />

      {/* TAB MỚI — Chat (remote) */}
      <Tab.Screen
        name="Chat"
        component={ChatTab}
        options={{
          tabBarLabel: t('navigation.chat'),
          tabBarTestID: 'tab-chat',
        }}
      />

      <Tab.Screen
        name="Bookings"
        component={BookingStackScreen}
        options={{tabBarLabel: t('navigation.myBookings'), tabBarTestID: 'tab-bookings'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: t('navigation.profile'),
          headerShown: false,
          tabBarTestID: 'tab-profile',
        }}
      />
    </Tab.Navigator>
  );
}
```

### 6.2 Thêm Chat type vào `types.ts`

```typescript
// src/navigation/types.ts — chỉ thêm Chat vào TabParamList
export type TabParamList = {
  Home: undefined;
  Services: undefined;
  Chat: undefined;        // ← thêm dòng này
  Bookings: undefined;
  Profile: undefined;
};
```

### 6.3 Thêm translation key

```json
// src/i18n/locales/en.json — thêm
{ "navigation": { "chat": "Chat" } }

// src/i18n/locales/vi.json — thêm
{ "navigation": { "chat": "Trò chuyện" } }

// src/i18n/locales/zh.json — thêm
{ "navigation": { "chat": "聊天" } }
```

### 6.4 Chạy development

```bash
# Terminal 1: Host app (port 8081)
npx react-native start --reset-cache

# Terminal 2: mini-chat dev server (port 9001)
cd mini-chat
npx react-native rspack-start --port 9001

# Terminal 3 (nếu Android emulator)
adb reverse tcp:8081 tcp:8081
adb reverse tcp:9001 tcp:9001
```

### 6.5 Flow hoạt động

```
1. User mở app → Host load bình thường (4 tabs cũ hiện ngay)
2. User nhấn tab "Chat"
3. Host gọi Federated.importModule('mini-chat', './ChatNavigator')
4. ScriptManager download bundle từ localhost:9001 (dev) / CDN (prod)
5. ChatNavigator render trong tab
6. User tương tác với chat — tất cả logic chạy trong mini-chat bundle
```

### 6.6 Checklist Phase 4

- [ ] Sửa `MainNavigator.tsx` — thêm Chat tab với `React.lazy` + `Federated.importModule`
- [ ] Thêm `Chat` vào `TabParamList`
- [ ] Thêm translation keys (en, vi, zh)
- [ ] Test: chạy cả host + mini-chat dev server
- [ ] Verify: 4 tabs cũ hoạt động bình thường
- [ ] Verify: tab Chat load ChatNavigator từ remote
- [ ] Verify: navigate trong chat (list → room → contacts)
- [ ] Test: tắt mini-chat dev server → ErrorBoundary hiển thị fallback
- [ ] Test trên cả iOS và Android

---

## 7. Phase 5: Production setup

> **Ước lượng**: 2-3 ngày

### 7.1 Code Signing

```bash
# Tạo key pair
ssh-keygen -t rsa -b 4096 -m PEM -f code-signing.pem
openssl rsa -in code-signing.pem -pubout -outform PEM -out code-signing.pem.pub
```

Thêm vào `mini-chat/rspack.config.mjs`:
```javascript
new Repack.plugins.CodeSigningPlugin({
  enabled: mode === 'production',
  privateKeyPath: path.resolve(__dirname, '../code-signing.pem'),
}),
```

Thêm public key vào native:

**iOS** — `ios/Glow/Info.plist`:
```xml
<key>RepackPublicKey</key>
<string>-----BEGIN PUBLIC KEY-----
... nội dung code-signing.pem.pub ...
-----END PUBLIC KEY-----</string>
```

**Android** — `android/app/src/main/res/values/strings.xml`:
```xml
<string name="RepackPublicKey">-----BEGIN PUBLIC KEY-----
... nội dung code-signing.pem.pub ...
-----END PUBLIC KEY-----</string>
```

### 7.2 Build mini-chat cho production

```bash
cd mini-chat

# iOS
npx react-native rspack-bundle \
  --platform ios \
  --dev false \
  --entry-file src/index.js \
  --bundle-output build/ios/main.jsbundle

# Android
npx react-native rspack-bundle \
  --platform android \
  --dev false \
  --entry-file src/index.js \
  --bundle-output build/android/main.jsbundle
```

### 7.3 Upload lên CDN

```bash
# Ví dụ với AWS S3
aws s3 sync build/ios/ s3://glow-cdn/mini-chat/ios/
aws s3 sync build/android/ s3://glow-cdn/mini-chat/android/
```

### 7.4 CI/CD cho mini-chat

```yaml
# .github/workflows/deploy-mini-chat.yml
name: Deploy mini-chat

on:
  push:
    paths:
      - 'mini-chat/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        platform: [ios, android]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - name: Build bundle
        run: |
          cd mini-chat
          npx react-native rspack-bundle \
            --platform ${{ matrix.platform }} \
            --dev false \
            --entry-file src/index.js \
            --bundle-output build/${{ matrix.platform }}/main.jsbundle
      - name: Upload to CDN
        run: aws s3 sync mini-chat/build/${{ matrix.platform }}/ s3://glow-cdn/mini-chat/${{ matrix.platform }}/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 7.5 Checklist Phase 5

- [ ] Generate code signing keys
- [ ] Cấu hình CodeSigningPlugin trong mini-chat
- [ ] Thêm public key vào iOS + Android
- [ ] Test production build mini-chat
- [ ] Setup CDN
- [ ] Update ScriptManager resolver URLs cho production
- [ ] Setup CI/CD
- [ ] Test end-to-end: build host release → load mini-chat từ CDN

---

## 8. Chi tiết kỹ thuật: Cấu trúc thư mục

### 8.1 Option A: Cùng repo (monorepo đơn giản)

```
glow/                              # Repo hiện tại — KHÔNG ĐỔI GÌ
├── src/                           # Code hiện tại — GIỮA NGUYÊN
│   ├── features/
│   ├── components/
│   ├── navigation/                # Chỉ sửa MainNavigator.tsx
│   ├── store/
│   ├── lib/
│   ├── hooks/
│   ├── utils/
│   ├── i18n/
│   └── types/
├── ios/
├── android/
├── index.js                       # Thêm ScriptManager
├── rspack.config.mjs              # MỚI (thay metro.config.js)
├── babel.config.js                # Sửa nhẹ
├── react-native.config.js         # Sửa nhẹ
├── package.json
│
├── mini-chat/                     # THƯ MỤC MỚI — mini-app
│   ├── src/
│   │   ├── ChatNavigator.tsx
│   │   ├── screens/
│   │   ├── components/
│   │   ├── chatSlice.ts
│   │   ├── chatSaga.ts
│   │   └── index.js
│   ├── rspack.config.mjs
│   ├── babel.config.js
│   └── package.json
│
└── pnpm-workspace.yaml            # Nếu muốn share deps
```

**`pnpm-workspace.yaml`**:
```yaml
packages:
  - '.'
  - 'mini-chat'
```

### 8.2 Option B: Repo riêng cho mini-chat

```
# Repo 1: glow (giữ nguyên)
glow/
├── src/
├── ios/
├── android/
├── index.js
├── rspack.config.mjs
└── ...

# Repo 2: glow-mini-chat (repo mới)
glow-mini-chat/
├── src/
│   ├── ChatNavigator.tsx
│   ├── screens/
│   └── ...
├── rspack.config.mjs
└── package.json
```

### 8.3 Khuyến nghị

**Option A** (cùng repo) cho giai đoạn đầu — đơn giản, dễ share code, dễ debug. Chuyển sang Option B khi có team riêng phát triển mini-chat.

---

## 9. Chi tiết kỹ thuật: Module Federation config

### 9.1 Quy tắc shared dependencies

```
┌─────────────────────────────────────────────────┐
│ HOST (eager: true)                              │
│                                                 │
│ Tất cả shared deps được load ngay lập tức       │
│ khi app khởi động. Mini-apps nhận từ host,      │
│ không bundle lại.                               │
└─────────────────────────────────────────────────┘
          │
          │  Runtime sharing
          ▼
┌─────────────────────────────────────────────────┐
│ MINI-CHAT (eager: false)                        │
│                                                 │
│ Shared deps KHÔNG nằm trong bundle.             │
│ Khi load, mini-chat nhận react, react-native,   │
│ navigation, redux... từ host.                   │
│                                                 │
│ → Bundle size nhỏ (chỉ chứa code riêng)        │
└─────────────────────────────────────────────────┘
```

### 9.2 Khi nào dùng STANDALONE mode?

```bash
# Development: mini-chat chạy riêng, không cần host
STANDALONE=true npx react-native rspack-start --port 9001

# Development: mini-chat load qua host
npx react-native rspack-start --port 9001
# (host ở terminal khác)
```

Khi `STANDALONE=true`:
- `eager: true` → mini-chat bundle chứa tất cả deps
- Có thể chạy độc lập như app riêng
- Dùng để dev/test mà không cần chạy host

### 9.3 Thêm mini-app mới sau này

Chỉ cần 2 bước:

**Bước 1** — Tạo folder `mini-xyz/` với cùng pattern như `mini-chat/`

**Bước 2** — Sửa 3 chỗ trong host:

```javascript
// 1. rspack.config.mjs — thêm remote
remotes: {
  'mini-chat': `mini-chat@...`,
  'mini-xyz': `mini-xyz@http://localhost:9002/${platform}/mf-manifest.json`,
},

// 2. index.js — thêm resolver
containers: {
  'mini-chat': '...',
  'mini-xyz': __DEV__
    ? `http://localhost:9002/${Platform.OS}/[name][ext]`
    : `https://cdn.your-domain.com/mini-xyz/${Platform.OS}/[name][ext]`,
},

// 3. MainNavigator.tsx — thêm tab/screen
const XyzNavigator = React.lazy(() =>
  Federated.importModule('mini-xyz', './XyzNavigator')
);
```

---

## 10. Chi tiết kỹ thuật: Share state giữa host và mini-chat

### 10.1 Option A: Mini-chat dùng Redux store của host (khuyến nghị)

Mini-chat có thể **đọc** auth state từ host (user đang login là ai) và **thêm** chat state riêng:

**mini-chat/src/ChatNavigator.tsx**:
```typescript
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function ChatNavigator() {
  // Đọc auth state từ host store — vì react-redux là shared singleton
  const user = useSelector((state: any) => state.auth.user);

  // user.id dùng để load conversations, send messages, etc.

  return (
    <Stack.Navigator>
      {/* ... */}
    </Stack.Navigator>
  );
}
```

Cách này hoạt động vì:
- `react-redux` là shared singleton → cùng `<Provider store={store}>` từ host
- `useSelector` trong mini-chat truy cập cùng store instance
- Mini-chat chỉ cần **đọc** auth state, không cần sửa

### 10.2 Option B: Mini-chat có Redux slice riêng (dynamic injection)

Nếu mini-chat cần state riêng (conversations, messages, unread count):

**Sửa host `src/store/index.ts`** — thêm dynamic reducer support:

```typescript
import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { mmkvStorage } from '@/lib/storage';
import rootSaga from './rootSaga';

// Static reducers (code hiện tại)
import authReducer from '@/features/auth/authSlice';
import homeReducer from '@/features/home/homeSlice';
import serviceReducer from '@/features/services/serviceSlice';
import bookingReducer from '@/features/booking/bookingSlice';
import postServiceReducer from '@/features/postService/postServiceSlice';
import providerReducer from '@/features/provider/providerSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';

const staticReducers = {
  auth: authReducer,
  home: homeReducer,
  services: serviceReducer,
  booking: bookingReducer,
  postService: postServiceReducer,
  provider: providerReducer,
  favorites: favoritesReducer,
};

// === THÊM MỚI: Dynamic reducer registry ===
const asyncReducers: Record<string, Reducer> = {};

function createRootReducer() {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
}

export function registerReducer(key: string, reducer: Reducer) {
  if (asyncReducers[key]) return;
  asyncReducers[key] = reducer;
  store.replaceReducer(
    persistReducer(persistConfig, createRootReducer())
  );
}
// === KẾT THÚC PHẦN THÊM MỚI ===

const persistConfig = {
  key: 'root',
  storage: mmkvStorage,
  whitelist: ['auth', 'favorites'],
};

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: persistReducer(persistConfig, createRootReducer()),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

// === THÊM MỚI: Export saga runner cho mini-apps ===
export function runMiniAppSaga(saga: () => Generator) {
  return sagaMiddleware.run(saga);
}
// === KẾT THÚC ===

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof createRootReducer>;
```

**mini-chat dùng dynamic injection**:

```typescript
// mini-chat/src/ChatNavigator.tsx
import { useEffect } from 'react';
import { registerReducer, runMiniAppSaga } from '../../src/store';
// Hoặc nếu expose qua MF:
// Host expose registerReducer → mini-chat import qua Federated

import chatReducer from './chatSlice';
import { chatSaga } from './chatSaga';

export default function ChatNavigator() {
  useEffect(() => {
    registerReducer('chat', chatReducer);
    const task = runMiniAppSaga(chatSaga);
    return () => task.cancel();
  }, []);

  // ...
}
```

### 10.3 Option C: Supabase Realtime trực tiếp (đơn giản nhất)

Mini-chat dùng Supabase Realtime trực tiếp, không cần Redux cho chat:

```typescript
// mini-chat/src/screens/ChatRoomScreen.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
// Hoặc: import supabase từ shared singleton

function ChatRoomScreen({ route }) {
  const [messages, setMessages] = useState([]);
  const { conversationId } = route.params;

  useEffect(() => {
    // Load messages
    supabase.from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at')
      .then(({ data }) => setMessages(data));

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // ... render messages
}
```

### 10.4 Khuyến nghị

| Nhu cầu | Dùng option |
|---------|------------|
| Chat chỉ cần biết user đang login | **Option A** (đọc auth từ host) |
| Chat cần unread count ở tab badge | **Option B** (dynamic reducer) |
| Chat đơn giản, real-time messages | **Option C** (Supabase Realtime) |
| Chat phức tạp (offline support, sync) | **Option B + C** kết hợp |

---

## 11. Rủi ro và giải pháp

| # | Rủi ro | Mức | Giải pháp |
|---|--------|-----|-----------|
| 1 | Re.Pack 5.2.5 mới release, có thể có edge-case bugs | Trung bình | Pin version, theo dõi GitHub issues. Fallback: quay lại Metro (Phase 1 revert dễ) |
| 2 | Reanimated 4 lỗi ở release mode | Trung bình | Dùng Rspack (không phải Webpack). Test release mode ngay ở Phase 1 |
| 3 | Gesture handler webpack warning | Thấp | `IgnorePlugin` đã có sẵn trong config |
| 4 | Mini-chat bundle size lớn | Thấp | Shared deps không nằm trong bundle. Chỉ chat code + assets |
| 5 | Mini-chat fail to load (network error) | Thấp | ErrorBoundary + Suspense fallback. Cached bundles cho offline |
| 6 | Version mismatch giữa host và mini-chat | Trung bình | Lock versions trong `shared-deps.json`. CI check versions |
| 7 | Hermes bytecode cho remote chunks | Thấp | Thêm hermesc step trong CI build |

### Fallback plan

- **Phase 1 fail** (Re.Pack không chạy) → Revert về Metro, chờ update. Chỉ mất 1-2 ngày.
- **Phase 2-4 fail** (MF không load) → Giữ Re.Pack làm bundler, nhưng build chat feature inline (như feature thường). Vẫn có lợi ích bundler mới.

---

## 12. Checklist tổng hợp

### Phase 1: Re.Pack thay Metro (1-2 ngày)
- [ ] Cài đặt `@callstack/repack@5.2.5`, `@rspack/core`, `@swc/helpers`
- [ ] Cài đặt `@callstack/repack-plugin-reanimated`
- [ ] Tạo `rspack.config.mjs`
- [ ] Cập nhật `babel.config.js`
- [ ] Cập nhật `react-native.config.js`
- [ ] Cập nhật iOS build phase + Android build.gradle
- [ ] Test dev mode (iOS + Android)
- [ ] **Test release mode (iOS + Android)** ← critical
- [ ] Verify tất cả native modules
- [ ] Xóa `metro.config.js`

### Phase 2: Module Federation trên host (1 ngày)
- [ ] Thêm ScriptManager vào `index.js`
- [ ] Thêm `ModuleFederationPluginV2` vào `rspack.config.mjs`
- [ ] Cài `@module-federation/enhanced`, `@module-federation/runtime`
- [ ] Test app chạy bình thường (không regression)

### Phase 3: Tạo mini-chat (2-5 ngày)
- [ ] Tạo thư mục `mini-chat/`
- [ ] Setup `package.json`, `rspack.config.mjs`, `babel.config.js`
- [ ] Tạo `ChatNavigator.tsx` (exposed module)
- [ ] Tạo screens (ChatList, ChatRoom, Contacts)
- [ ] Test standalone mode

### Phase 4: Tích hợp (1 ngày)
- [ ] Sửa `MainNavigator.tsx` — thêm Chat tab
- [ ] Thêm `Chat` vào `TabParamList`
- [ ] Thêm i18n keys
- [ ] Test host + mini-chat chạy cùng lúc
- [ ] Test ErrorBoundary khi mini-chat không available
- [ ] Test trên iOS + Android

### Phase 5: Production (2-3 ngày)
- [ ] Code signing setup
- [ ] Build mini-chat bundles
- [ ] Upload lên CDN
- [ ] CI/CD pipeline cho mini-chat
- [ ] Test production end-to-end

---

**Tổng thời gian ước lượng: 7-12 ngày**

**Tài liệu tham khảo:**
- [Re.Pack Documentation](https://re-pack.dev)
- [Re.Pack GitHub](https://github.com/callstack/repack)
- [Super App Showcase](https://github.com/callstack/super-app-showcase)
- [Module Federation V2 API](https://re-pack.dev/api/plugins/module-federation-v2)
- [CodeSigning Plugin](https://re-pack.dev/api/plugins/code-signing)
- [Migration from Metro](https://re-pack.dev/docs/migration-guides/metro)
