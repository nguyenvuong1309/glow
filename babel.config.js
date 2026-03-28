const isProduction =
  process.env.APP_ENV === 'production' ||
  process.env.NODE_ENV === 'production';

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      envName: 'APP_ENV',
      moduleName: '@env',
      path: isProduction ? '.env.prod' : '.env.dev',
      safe: true,
      allowUndefined: false,
    }],
    ['module-resolver', {alias: {'@': './src'}}],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin', // MUST be last
  ],
};
