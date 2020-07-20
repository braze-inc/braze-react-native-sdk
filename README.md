<img src="https://raw.githubusercontent.com/Appboy/appboy-react-sdk/master/braze-logo.png" width="300" title="Braze Logo" />

# Braze React SDK

Effective marketing automation is an essential part of successfully scaling and managing your business. Braze empowers you to build better customer relationships through a seamless, multi-channel approach that addresses all aspects of the user life cycle Braze helps you engage your users on an ongoing basis.

## SDK Integration

See our Technical Documentation for instructions on integrating Braze into your React Native application.
- [iOS Documentation](https://www.braze.com/documentation/React_Native/iOS/)
- [Android Documentation](https://www.braze.com/documentation/React_Native/Android_and_FireOS/)


## Components

- `AppboyProject` - Contains the AppboyProject sample app with integration examples for the React Native bridge. This sample app integrates the iOS bridge via manual linking, and the iOS SDK via Cocoapods. It can
also optionally integrate the iOS bridge using Cocoapods via a local Podspec.

## Running the Sample App

The following commands apply to both sample projects and use the `AppboyProject` directory as an example.

```zsh
cd AppboyProject/
yarn install

# In a separate tab:
cd AppboyProject/
npx react-native start
```

### iOS
Our sample app integrates the native Braze iOS SDK through [Cocoapods](https://guides.cocoapods.org/using/getting-started.html).

From the `AppboyProject` directory:
```zsh
sudo gem install cocoapods
cd ios/
pod install
cd ../
npx react-native run-ios
```

### Android
From the `AppboyProject` directory:
```zsh
npx react-native run-android
```

## In-App Messages
### Integration

Native in-app messages display automatically out of the box on Android and iOS.

To get the in-app message data implement the `IInAppMessageManagerListener` delegate as described in our public documentation [for Android](https://www.braze.com/docs/developer_guide/platform_integration_guides/android/in-app_messaging/customization/#setting-a-custom-manager-listener) and [for iOS](https://www.braze.com/docs/developer_guide/platform_integration_guides/ios/in-app_messaging/customization/). This data can then be received in the JavaScript layer and used to instantiate a `BrazeInAppMessage`. A sample implementation of this is contained in AppboyProject.

### Disabling automatic display
To disable automatic in-app message display for Android, your `beforeInAppMessageDisplayed` method implementation should return `InAppMessageOperation.DISCARD`.

To disable automatic in-app message display for iOS, your `beforeInAppMessageDisplayed` delegate implementation should return `ABKInAppMessageDisplayChoice.discardInAppMessage`.

### Analytics
To log analytics using your `BrazeInAppMessage`, pass the instance into the `logInAppMessageClicked`, `logInAppMessageImpression`, and `logInAppMessageButtonClicked` (along with the button index) methods available on `ReactAppboy`.

## Style
- Generally we try to mimic the Braze Web SDK's Javascript interface where appropriate.
- We use [eslint](http://eslint.org/) as our linter. From the root directory, run `npm run lint` to list errors or `npm run lint-fix` to automatically fix errors. To override the rules in the [`standard-react`](https://github.com/feross/eslint-config-standard-react) config, add `"rules"` in `.eslintrc.json`.

## Testing
- We use [jest](https://facebook.github.io/jest/) for testing the React SDK.
- Run the tests and code coverage report using `npm test`
