module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: 'react-native-dotenv',
      path: '.env',
      blocklist: null,
      allowlist: null,
      safe: true,
      allowUndefined: true
    }],
  ]
};
