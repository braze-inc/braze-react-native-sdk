## 1.17.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.20.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.20.0).
- **Important:** Braze iOS SDK 3.20.0 contains updated push token registration methods. We recommend upgrading to these methods as soon as possible to ensure a smooth transition as devices upgrade to iOS 13. In `application:didRegisterForRemoteNotificationsWithDeviceToken:`, replace
```
[[Appboy sharedInstance] registerPushToken:
                [NSString stringWithFormat:@"%@", deviceToken]];
```
with
```
[[Appboy sharedInstance] registerDeviceToken:deviceToken]];
```
- `ReactAppboy.registerPushToken()` was renamed to `ReactAppboy.registerAndroidPushToken()` and is now a no-op on iOS. On iOS, push tokens must now be registered through native methods.

## 1.16.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.19.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.19.0).
- Updated the native Android bridge to [Braze Android SDK 3.7.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#370).
- Note: This Braze React SDK release updates to Braze Android SDK and Braze iOS SDK dependencies which no longer enable automatic Braze location collection by default. Please consult their respective changelogs for information on how to continue to enable automatic Braze location collection, as well as further information on breaking changes.
- Removes the Feedback feature.
  - `submitFeedback()` and `launchFeedback()` have been removed from the `Appboy` interface.

##### Added
- Added the ability to more easily create custom UIs for Content Cards from within the React Native layer by providing access to card data and analytics methods in Javascript.
  - Added `ReactAppboy.getContentCards` for getting locally cached content cards data.
    - To request a Content Cards update, use `ReactAppboy.requestContentCardsRefresh()`.
  - Added `ReactAppboy.logContentCardsDisplayed` for manually logging an impression for the content card feed.
  - Added `ReactAppboy.logContentCardClicked` for manually logging a click to Braze for a particular card.
  - Added `ReactAppboy.logContentCardImpression` for manually logging an impression to Braze for a particular card.
  - Added `ReactAppboy.logContentCardDismissed` for manually logging a dismissal to Braze for a particular card.
  - Added `ReactAppboy.addListener` for subscribing to `ReactAppboy.Events.CONTENT_CARDS_UPDATED` events.
    - After a successful update, use `getContentCards` to retrieve updated cards.
    - ```
      ReactAppboy.addListener(ReactAppboy.Events.CONTENT_CARDS_UPDATED, async function() {
        let cards = await ReactAppboy.getContentCards();
        console.log('Content Cards Updated.', cards);
      })
      ```
  - See https://github.com/Appboy/appboy-react-sdk/pull/58. Thanks @alexmbp!

## 1.15.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.17.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.17.0).
- Removed the `NewsFeedLaunchOptions` enum. Using these arguments with `launchNewsFeed()` had been a no-op since version 1.7.0.

## 1.14.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.5.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#350).

##### Fixed
- Fixed an issue where logging custom events or purchases without event properties would cause crashes on Android, for example `logCustomEvent("event")`.

##### Added
- Added additional TypeScript definitions.

## 1.13.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.15.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.15.0).
  - This release of the iOS SDK added support for SDWebImage version 5.0.
  - Note that upgrading to SDWebImage 5.0 also removed the FLAnimatedImage transitive dependency.

## 1.12.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.3.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#330).

##### Added
- Added `ReactAppboy.launchContentCards()` for launching the content cards UI.

## 1.11.1

##### Added
- Added Typescript definitions for the `Appboy` interface.
  - Thanks @ahanriat and @josin for your contributions! See https://github.com/Appboy/appboy-react-sdk/pull/57 and https://github.com/Appboy/appboy-react-sdk/pull/38.
  - Note that certain less-used parts of the API were excluded. Please file an issue if you would like specific method(s) added.

## 1.11.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.2.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#320).
  - Added `AppboyFirebaseMessagingService` to directly use the Firebase messaging event `com.google.firebase.MESSAGING_EVENT`. This is now the recommended way to integrate Firebase push with Braze. The `AppboyFcmReceiver` should be removed from your `AndroidManifest` and replaced with the following:
    ```
    <service android:name="com.appboy.AppboyFirebaseMessagingService">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>
    ```
    - Also note that any `c2dm` related permissions should be removed from your manifest as Braze does not require any extra permissions for `AppboyFirebaseMessagingService` to work correctly.
- Updated the native iOS bridge to [Braze iOS SDK 3.14.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.14.0).
  - Dropped support for iOS 8.

##### Added
- Added support for sending JavaScript `Date()` type custom event and purchase properties through the `Appboy` interface.

## 1.10.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.1.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#310).

##### Added
- Added `addAlias(aliasName, aliasLabel)` to the `Appboy` interface to allow aliasing users.
  - Thanks @alexmbp!

##### Changed
- Updated `build.gradle` to use `project.ext` config if available.

## 1.9.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.11.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.11.0).
- Updated the native Android bridge to [Braze Android SDK 3.0.1](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#301).
- Updated the Android wrapper to use `api` and `implementation` syntax in it's `build.gradle` instead of `compile`. As part of this work, the Android Gradle plugin version was updated to `3.2.1`.

##### Added
- Added `setUserAttributionData()` to the `Appboy` interface to allow setting the attribution data for the current user.
- Added `getInstallTrackingId()` to the `Appboy` interface to allow getting the install tracking id. This method is equivalent to calling `Appboy.getInstallTrackingId()` on Android and returns the IDFV on iOS.
- Added `setLanguage()` to the `Appboy` interface to allow setting a language for the current user.
- Added `hideCurrentInAppMessage()` to the `Appboy` interface to allow hiding of the currently displayed in-app message.

##### Fixed
- Fixed an issue where the Android wrapper would include an older version of React Native in test APK builds.

##### Changed
- Updated our sample projects to use React Native `0.56`.

## 1.8.1

##### Changed
- Updated the native iOS bridge to [Braze iOS SDK 3.8.4](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.8.4).

## 1.8.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 2.7.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#270).
  - __Important:__ Note that in Braze Android SDK 2.7.0, `AppboyGcmReceiver` was renamed to `AppboyFcmReceiver`. This receiver is intended to be used for Firebase integrations. Please update the `AppboyGcmReceiver` declaration in your `AndroidManifest.xml` to reference `AppboyFcmReceiver` and remove the `com.google.android.c2dm.intent.REGISTRATION` intent filter action.
- Updated the native iOS bridge to [Braze iOS SDK 3.8.3](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.8.3).

##### Added
- Added `setLocationCustomAttribute()` to the `Appboy` interface to allow setting of custom location attributes.

## 1.7.3

##### Added
- Added `requestLocationInitialization()` to the `Appboy` interface. Calling this method is the equivalent of calling `AppboyLocationService.requestInitialization()` on the native Braze Android SDK. The method is a no-op on iOS.

## 1.7.2

##### Fixed
- Fixed an issue introduced in `1.7.0` where calling `launchNewsFeed()` would cause crashes in the Android bridge.

## 1.7.1

##### Fixed
- Updated the podspec to point to Braze iOS SDK version 3.5.1.

## 1.7.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.5.1](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.5.1).
- Updated the native Android bridge to [Appboy Android SDK 2.4.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#240).

##### Added
- Added `Other`, `Unknown`, `Not Applicable`, and `Prefer not to Say` options for user gender.
- Updated the `AppboyProject` sample app to use FCM instead of GCM.
- Added toasts to provide feedback for user actions in the `AppboyProject` sample app.
- Implemented `requiresMainQueueSetup` in `AppboyReactBridge.m` to prevent warnings in React Native 0.49+.
  - See https://github.com/Appboy/appboy-react-sdk/pull/39. Thanks @danieldecsi!

##### Changed
- Passing launch options into `launchNewsFeed()` is now a no-op.

## 1.6.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.3.3](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.3.3).
- Updated the native Android bridge to [Braze Android SDK 2.2.5](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#225).

##### Added
- Added support for wiping all customer data created by the Braze SDK via `Appboy.wipeData()`.
  - Note that on iOS, `wipeData()` will disable the SDK for the remainder of the app run. For more information, see our iOS SDK's documentation for [`disableSDK`](http://appboy.github.io/appboy-ios-sdk/docs/interface_appboy.html#a8d3b78a98420713d8590ed63c9172733).
- Added `Appboy.disableSDK()` to disable the Braze SDK immediately.
- Added `Appboy.enableSDK()` to re-enable the SDK after a call to `Appboy.disableSDK()`.
  - Note that on iOS, `enableSDK()` will not enable the SDK immediately. For more information, see our iOS SDK's documentation for [`requestEnableSDKOnNextAppRun`](http://appboy.github.io/appboy-ios-sdk/docs/interface_appboy.html#a781078a40a3db0de64ac82dcae3b595b).

##### Changed
- Removed `allowBackup` from the plugin `AndroidManifest.xml`.
  - See https://github.com/Appboy/appboy-react-sdk/pull/34. Thanks @SMJ93!

## 1.5.2

##### Fixed
- Fixed a race condition between SDK flavor reporting and sharedInstance initialization on iOS.

## 1.5.1

##### Fixed
- Fixed a bug that caused opted-in subscription states to not be reflected on the user profile.

## 1.5.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.0.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/3.0.0) or later.
- Updated the native Android bridge to [Braze Android SDK 2.2.4](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#224).
- Changed success callbacks on `submitFeedback()` on Android to always return `true` as `submitFeedback()` was changed to return `void` in the native SDK.

## 1.4.1

##### Added
- Added support for apps that use use_frameworks in Podfile.
  - See https://github.com/Appboy/appboy-react-sdk/commit/6db78a5bbeb31457f8a1dcf988a3265d8db9a437 and https://github.com/Appboy/appboy-react-sdk/issues/29. Thanks @jimmy-devine and @sljuka.

## 1.4.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 2.31.0](https://github.com/Appboy/appboy-ios-sdk/releases/tag/2.31.0) or later.
- Updated the native Android bridge to [Braze Android SDK 2.1.4](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#214).

##### Added
- Added `ReactAppboy.registerPushToken()` for registering push tokens with Braze.
  - See https://github.com/Appboy/appboy-react-sdk/pull/13. Thanks @dcvz!
- Added the local `react-native-appboy-sdk` Podspec for integrating the React Native iOS bridge via Cocoapods.
  - See the new `HelloReact` sample app for an integration example.
  - See https://github.com/Appboy/appboy-react-sdk/pull/15. Thanks @pietropizzi!

## 1.3.0

##### Breaking
- Updates the native iOS bridge to use [Braze iOS SDK 2.29.0](https://github.com/Appboy/appboy-ios-sdk/blob/master/CHANGELOG.md#2290), which drops support for iOS 7.
- Updates the native Android bridge to use [Braze Android SDK 2.0.0](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#200).

##### Added
- Adds `ReactAppboy.requestImmediateDataFlush()` for requesting an immediate flush of any data waiting to be sent to Braze's servers.
- Adds `ReactAppboy.requestFeedRefresh()` for requesting a refresh of the News Feed.
  - See https://github.com/Appboy/appboy-react-sdk/pull/12. Thanks @stief510!
- Added the ability to pass an optional dictionary of News Feed launch options to `launchNewsFeed()`. See `NewsFeedLaunchOptions` for supported keys.
  - For more information on currently supported `NewsFeedLaunchOptions` keys, see the card width and card margin properties on [ABKFeedViewController](http://appboy.github.io/appboy-ios-sdk/docs/interface_a_b_k_feed_view_controller.html).
  - See https://github.com/Appboy/appboy-react-sdk/pull/10. Thanks @mihalychk!

## 1.2.0

##### Breaking
- Updates the native iOS bridge to be compatible with React Native [v0.40.0](https://github.com/facebook/react-native/releases/tag/v0.40.0).

##### Changed
- Updates the AppboyProject sample project to React Native v0.41.1.

## 1.1.0

##### Breaking
- **Update Required** — Fixes a bug in the [iOS bridge](https://github.com/Appboy/appboy-react-sdk/blob/master/iOS/AppboyReactBridge/AppboyReactBridge/AppboyReactBridge.m) where custom attribute dates were converted incorrectly, causing incorrect date data to be sent to Braze. As a result of the fix, `setDateCustomUserAttribute()` in the iOS React bridge may now only be called with a double.
  - Note: The default Javascript Braze interface has not changed, so for most integrations this just requires updating the SDK, unless you were manually calling our iOS bridge outside of our recommended integration.
  - See https://github.com/Appboy/appboy-react-sdk/issues/7

## 1.0.0

##### Breaking
- **Update Required** — Updates iOS push handling in the AppboyProject sample project to be compatible with iOS 10. For more information, refer to the CHANGELOG for [Braze iOS SDK v2.24.0](https://github.com/Appboy/appboy-ios-sdk/blob/master/CHANGELOG.md#2240).

##### Added
- Adds callbacks to the native bindings to provide function call results to React Native.
- Exposes `ReactAppboy.getCardCountForCategories()` and `ReactAppboy.getUnreadCardCountForCategories()` for retrieving News Feed card counts.
  - See https://github.com/Appboy/appboy-react-sdk/issues/1
- Adds `ReactAppboy.getInitialURL()` for handling deep links when an iOS application is launched from the suspended state by clicking on a push notification with a deep link. See `componentDidMount()` in `AppboyProject.js` for a sample implementation.
- Exposes `ReactAppboy.setTwitterData()` and `ReactAppboy.setFacebookData()` for Twitter and Facebook integration.
  - See https://github.com/Appboy/appboy-react-sdk/issues/4

##### Changed
- Targets [Braze Android SDK version 1.15.3](https://github.com/Appboy/appboy-android-sdk/blob/master/CHANGELOG.md#1153) and [Braze iOS SDK version 2.24.2](https://github.com/Appboy/appboy-ios-sdk/blob/master/CHANGELOG.md#2242).
- Updates the AppboyProject sample application to React Native v0.33.0.
- Updates the AppboyProject sample project to integrate session handling and in-app message manager registration using an [AppboyLifecycleCallbackListener](https://github.com/Appboy/appboy-android-sdk/blob/master/android-sdk-ui/src/com/appboy/AppboyLifecycleCallbackListener.java), as introduced in Braze Android SDK v1.15.0.

##### Removed
- Removes `AppboyBroadcastReceiver.java` from the AppboyProject sample project, as Braze Android SDK v1.15.0 removes the need for a custom `AppboyBroadcastReceiver` for Braze push notifications.

## 0.3.0

##### Changed
- Renames Android module to conform to rnpm standard.

## 0.2.0

##### Changed
- Refactors Android module to have the source directly under the `android` folder.

## 0.1.0
- Initial release.  Targets Braze Android SDK version 1.12.0 and Braze iOS SDK Version 1.18.4.
