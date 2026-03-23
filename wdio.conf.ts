import dotenv from 'dotenv';
import type { Options } from '@wdio/types';

dotenv.config({ path: '.env.test' });

const APP_PATH =
  '/Users/vuongnguyen/Library/Developer/Xcode/DerivedData/Glow-apdcyqvxcutfwcgorfanpeqxhdnx/Build/Products/Debug-iphonesimulator/Glow.app';
const BUNDLE_ID = 'org.reactjs.native.example.Glow';

const sharedCaps = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:app': APP_PATH,
  'appium:bundleId': BUNDLE_ID,
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:wdaLaunchTimeout': 120000,
  'appium:wdaConnectionTimeout': 120000,
  'appium:newCommandTimeout': 240,
};

export const config: Options.Testrunner = {
  runner: 'local',
  tsConfigPath: './e2e/tsconfig.json',
  port: 4723,
  specs: ['./e2e/specs/**/*.spec.ts'],
  maxInstances: 3,
  capabilities: [
    {
      ...sharedCaps,
      'appium:deviceName': 'iPhone 17 Pro Max',
      'appium:platformVersion': '26.3',
      'appium:udid': '85CE021C-387A-4606-A0E6-FBFD395FF89E',
    } as any,
    {
      ...sharedCaps,
      'appium:deviceName': 'iPhone 17 Pro',
      'appium:platformVersion': '26.3',
      'appium:udid': 'A74A4BBF-54EF-4D7A-ABC7-CF8DB6CAAD2B',
    } as any,
    {
      ...sharedCaps,
      'appium:deviceName': 'iPhone 17',
      'appium:platformVersion': '26.3',
      'appium:udid': 'D0BC74CC-0D70-40F0-B783-1CB24771AF90',
    } as any,
  ],
  logLevel: 'warn',
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
