<p align="center">
  <img width="480" alt="Braze Logo" src=".github/assets/logo-light.png#gh-light-mode-only" />
  <img width="480" alt="Braze Logo" src=".github/assets/logo-dark.png#gh-dark-mode-only" />
</p>

# Braze React Native SDK

Effective marketing automation is an essential part of successfully scaling and managing your business. Braze empowers you to build better customer relationships through a seamless, multi-channel approach that addresses all aspects of the user life cycle Braze helps you engage your users on an ongoing basis.

- [Braze React Native `npm` package](https://www.npmjs.com/package/@braze/react-native-sdk)
- [Braze User Guide](https://www.braze.com/docs/user_guide/introduction)
- [Initial React Native SDK Setup](https://www.braze.com/docs/developer_guide/platforms/react_native/sdk_integration)

## Version Support

> [!NOTE]
> This SDK has been tested with React Native version **0.77.0**.

| Braze Plugin | React Native | Supports New Architecture? |
| ------------ | ------------ | -------------------------- |
| 9.0.0+       | >= 0.71      | ✅                         |
| 6.0.0+       | >= 0.68      | ✅ (>= 0.70.0)             |
| 2.0.0+       | >= 0.68      | ✅                         |
| <= 1.41.0    | <= 0.71      | ❌                         |

This SDK additionally inherits the requirements of its underlying Braze native SDKs. Be sure to also adhere to the lists below:
* [Android SDK requirements](https://github.com/braze-inc/braze-android-sdk?tab=readme-ov-file#version-information)
* [Swift SDK requirements](https://github.com/braze-inc/braze-swift-sdk?tab=readme-ov-file#version-information)

## Braze Expo Plugin

If you're using Expo, you can install our plugin to integrate the React Native SDK without any native code. See the [Braze Expo Plugin Github](https://github.com/braze-inc/braze-expo-plugin) for more details.

## Running the Sample App

- `BrazeProject` - Contains the BrazeProject sample app with integration examples for the React Native bridge. This sample app integrates the iOS bridge via manual linking, and the iOS SDK via Cocoapods. It can
also optionally integrate the iOS bridge using Cocoapods via a local Podspec.

The following commands apply to both sample projects and use the `BrazeProject` directory as an example.

```zsh
cd BrazeProject/
yarn install

# In a separate tab:
cd BrazeProject/
npx react-native start
```

### iOS
Our sample app integrates the native Braze iOS SDK through [Cocoapods](https://guides.cocoapods.org/using/getting-started.html).

From the `BrazeProject` directory:
```zsh
sudo gem install cocoapods
cd ios/
pod install # If you are using the New Architecture, you need to run `RCT_NEW_ARCH_ENABLED=1 pod install` instead.
cd ../
npx react-native run-ios
```

### Android
From the `BrazeProject` directory:
```zsh
npx react-native run-android
```

## Style
- Generally we try to mimic the Braze Web SDK's Javascript interface where appropriate.
- We use [eslint](http://eslint.org/) as our linter. From the root directory, run `npm run lint` to list errors or `npm run lint-fix` to automatically fix errors. To override the rules in the [`standard-react`](https://github.com/feross/eslint-config-standard-react) config, add `"rules"` in `.eslintrc.json`.

## Testing
- We use [jest](https://facebook.github.io/jest/) for testing the React Native SDK.
- Run the tests and code coverage report using `npm test`
