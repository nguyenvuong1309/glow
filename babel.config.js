module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {alias: {'@': './src'}}],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin', // MUST be last
  ],
};
