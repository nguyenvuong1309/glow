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
    ['module-resolver', {alias: {'@': './src'}}],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin', // MUST be last
  ],
};
