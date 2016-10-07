## 1.0.0
- Targets [Appboy Android SDK version 1.15.3](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#1153) and [Appboy iOS SDK version 2.24.2](https://github.com/Appboy/appboy-ios-sdk/blob/master/CHANGELOG.md#2242).
- **Update Required** — Updates iOS push handling in the AppboyProject sample project to be compatible with iOS 10. For more information, refer to the CHANGELOG for [Appboy iOS SDK v2.24.0](https://github.com/Appboy/appboy-ios-sdk/blob/master/CHANGELOG.md#2240).
- Adds callbacks to the native bindings to provide function call results to React Native.
- Exposes `ReactAppboy.getCardCountForCategories()` and `ReactAppboy.getUnreadCardCountForCategories()` for retrieving News Feed card counts.
- Adds `ReactAppboy.getInitialURL()` for handling deep links when an iOS application is launched from the suspended state by clicking on a push notification with a deep link. See `componentDidMount()` in `AppboyProject.js` for a sample implementation.
- Exposes `ReactAppboy.setTwitterData()` and `ReactAppboy.setFacebookData()` for Twitter and Facebook integration.
- Removes `AppboyBroadcastReceiver.java` from the AppboyProject sample project, as Appboy Android SDK v1.15.0 removes the need for a custom `AppboyBroadcastReceiver` for Appboy push notifications.
- Updates the AppboyProject sample project to integrate session handling and in-app message manager registration using an [AppboyLifecycleCallbackListener](https://github.com/Appboy/appboy-android-sdk/blob/master/android-sdk-ui/src/com/appboy/AppboyLifecycleCallbackListener.java), as introduced in Appboy Android SDK v1.15.0.
- Updates the AppboyProject sample application to React Native v0.33.0.

## 0.3.0
- Renames Android module to conform to rnpm standard.

## 0.2.0
- Refactors Android module to have the source directly under the `android` folder.

## 0.1.0
- Initial release.  Targets Appboy Android SDK version 1.12.0 and Appboy iOS SDK Version 1.18.4.
