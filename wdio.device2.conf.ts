import dotenv from 'dotenv';
import type { Options } from '@wdio/types';
dotenv.config({ path: '.env.test' });
export const config: Options.Testrunner = {
  runner: 'local', tsConfigPath: './e2e/tsconfig.json', port: 4723,
  specs: ['./e2e/specs/**/*.spec.ts'], maxInstances: 1,
  capabilities: [{
    platformName: 'iOS', 'appium:automationName': 'XCUITest',
    'appium:deviceName': 'iPhone 17 Pro', 'appium:platformVersion': '26.3',
    'appium:udid': 'A74A4BBF-54EF-4D7A-ABC7-CF8DB6CAAD2B',
    'appium:app': '/Users/vuongnguyen/Library/Developer/Xcode/DerivedData/Glow-apdcyqvxcutfwcgorfanpeqxhdnx/Build/Products/Debug-iphonesimulator/Glow.app',
    'appium:bundleId': 'org.reactjs.native.example.Glow',
    'appium:noReset': false, 'appium:fullReset': false,
    'appium:wdaLaunchTimeout': 120000, 'appium:wdaConnectionTimeout': 120000, 'appium:newCommandTimeout': 240,
  } as any],
  logLevel: 'warn', bail: 0, waitforTimeout: 15000,
  connectionRetryTimeout: 120000, connectionRetryCount: 3,
  framework: 'mocha', reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 120000 },
};
