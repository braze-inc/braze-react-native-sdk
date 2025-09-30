<p align="center">
  <img width="480" alt="Braze Logo" src=".github/assets/logo-light.png#gh-light-mode-only" />
  <img width="480" alt="Braze Logo" src=".github/assets/logo-dark.png#gh-dark-mode-only" />
</p>

# Braze React Native SDK [![latest](https://img.shields.io/github/v/tag/braze-inc/braze-react-native-sdk?label=latest%20release&color=300266)](https://github.com/braze-inc/braze-react-native-sdk/releases) 

- [Braze User Guide](https://www.braze.com/docs/user_guide/introduction/ "Braze User Guide")
- [Braze Developer Guide](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=swift "Braze Developer Guide")

## Quickstart

``` shell
npm install @braze/react-native-sdk
// yarn add @braze/react-native-sdk
```

### Android

``` groovy
// build.gradle
// ...
    dependencies {
        ...
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.8.10")
    } 
// ...
```

``` xml
<!-- res/values/braze.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string translatable="false" name="com_braze_api_key">YOU_APP_IDENTIFIER_API_KEY</string>
  <string translatable="false" name="com_braze_custom_endpoint">YOUR_CUSTOM_ENDPOINT_OR_CLUSTER</string>
</resources>
```

``` xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS

``` shell
cd ios && pod install
```

``` swift
// AppDelegate.swift
import BrazeKit
import braze_plugin

class AppDelegate: UIResponder, UIApplicationDelegate {
  static var braze: Braze? = nil

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {
    // Setup Braze
    let configuration = Braze.Configuration(
      apiKey: "<BRAZE_API_KEY>",
      endpoint: "<BRAZE_ENDPOINT>"
    )
    // - Enable logging or customize configuration here
    configuration.logger.level = .info
    let braze = BrazeReactBridge.perform(
      #selector(BrazeReactBridge.initBraze(_:)),
      with: configuration
    ).takeUnretainedValue() as! Braze

    AppDelegate.braze = braze

    return true
  }
}
```

### Typescript

``` typescript
import Braze from "@braze/react-native-sdk";

Braze.changeUser("Jane Doe")
```

See [the Braze Developer Guide](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native) for advanced integration options.

## Version Support

> [!NOTE]
> This SDK has been tested with React Native version **0.80.0**.

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

## Contact

If you have questions, please contact [support@braze.com](mailto:support@braze.com).