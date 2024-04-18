## 9.2.0

##### Added
- Updates the native iOS version bindings [from Braze Swift SDK 8.2.1 to 8.4.0](https://github.com/braze-inc/braze-swift-sdk/compare/8.2.1...8.4.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

##### Fixed
- Fixes the Android implementation of `Braze.setCustomUserAttribute()` to correctly handle null values.
  - Thanks @owonie for your contribution!

## 9.1.0

##### Added
- Adds the `BrazeInAppMessage.isTestSend` property, which indicates whether an in-app message was triggered as part of a test send.
- Updates the native iOS version bindings [from Braze Swift SDK 8.1.0 to 8.2.1](https://github.com/braze-inc/braze-swift-sdk/compare/8.1.0...8.2.1#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Updates the native Android version bindings [from Braze Android SDK 30.1.1 to 30.3.0](https://github.com/braze-inc/braze-android-sdk/compare/v30.1.1...v30.3.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

##### Fixed
- Fixes the iOS implementation of `Braze.registerPushToken()` to correctly pass the device token to the native SDK.

## 9.0.0

##### Breaking
- Bumps React Native minimum requirement version to [0.71.0](https://reactnative.dev/blog/2023/01/12/version-071).
  - For further details about levels of support for each React Native release, refer to [Releases Support Policy](https://github.com/reactwg/react-native-releases#releases-support-policy) in the React Working Group.
- Bumps the minimum required iOS version to 12.0.
- Updates the native iOS version bindings [from Braze Swift SDK 7.5.0 to 8.1.0](https://github.com/braze-inc/braze-swift-sdk/compare/7.5.0...8.1.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Updates the native Android version bindings [from Braze Android SDK 29.0.1 to 30.1.1](https://github.com/braze-inc/braze-android-sdk/compare/v29.0.1...v30.1.1#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

## 8.4.0

##### Added
- Adds support to modify the allow list for Braze tracking properties via the following TypeScript properties and methods:
  - `TrackingProperty` string enum
  - `TrackingPropertyAllowList` object interface
  - `updateTrackingPropertyAllowList` method
  - For details, refer to the Braze [iOS Privacy Manifest documentation](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/privacy_manifest/).
- Deprecates the `setGoogleAdvertisingId` method in favor of `setAdTrackingEnabled`.
  - This new method will now set `adTrackingEnabled` flag on iOS and both the `adTrackingEnabled` flag and the Google Advertising ID on Android.
- Exposes the `ContentCardTypes` enum through the public TypeScript interface in `index.d.ts`.
- Updates the native iOS bridge [from Braze Swift SDK 7.5.0 to 7.7.0](https://github.com/braze-inc/braze-swift-sdk/compare/7.5.0...7.7.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

##### Fixed
- Fixes the `hasListeners` property in the iOS native layer to prevent duplicate symbol errors with other libraries.
- Addresses redefinition build errors when using the iOS Turbo Module with statically linked frameworks.

## 8.3.0

##### Added
- Adds example integrations for [Braze Rich Push Notifications](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/b2-rich-push-notifications) and [Braze Push Stories](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/b3-push-stories) to the iOS sample app.
- Updates the native iOS bridge [from Braze Swift SDK 7.3.0 to 7.5.0](https://github.com/braze-inc/braze-swift-sdk/compare/7.3.0...7.5.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Adds support for [React Native 0.73](https://reactnative.dev/blog/2023/12/06/0.73-debugging-improvements-stable-symlinks).
  - Removes strict Java version dependencies in the `build.gradle` file of the Braze library.
  - Updates the Braze sample app to use React Native version 0.73.1.

## 8.2.0

##### Added
- Updates the native iOS bridge [from Braze Swift SDK 7.1.0 to 7.3.0](https://github.com/braze-inc/braze-swift-sdk/compare/7.1.0...7.3.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
  - This release includes compatibility with Expo Notifications. Refer to the [push notification setup documentation](https://www.braze.com/docs/developer_guide/platform_integration_guides/react_native/push_notifications/) for more details.

##### Fixed
- Adds a missing update [from Braze Android SDK 29.0.0 to 29.0.1](https://github.com/braze-inc/braze-android-sdk/compare/v29.0.0...v29.0.1#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed) in the `8.1.0` release.

## 8.1.0

##### Added
- Push notification objects are now accessible in the JavaScript layer via new fields on the `PushNotificationEvent` interface.
  - Deprecates the following fields from the `PushNotificationEvent` interface in favor of the new names that can be used on both iOS and Android:
    - `push_event_type` -> Use `payload_type` instead.
    - `deeplink` -> Use `url` instead.
    - `content_text` -> Use `body` instead.
    - `raw_android_push_data` -> Use the `android` object instead.
    - `kvp_data` -> Use `braze_properties` instead.
- Adds iOS support for the listener event `Braze.Events.PUSH_NOTIFICATION_EVENT`.
  - On iOS, only `"push_opened"` events are supported, indicating the user interacted with the received notification.
  - The iOS event does not support the deprecated legacy fields mentioned above.
- Adds methods to manually perform the action of an In-App Message or Content Card when using a custom UI.
  - `Braze.performInAppMessageButtonAction(inAppMessage, buttonId)`
  - `Braze.performInAppMessageAction(inAppMessage)`
  - `Braze.processContentCardClickAction(id)`
- Updates the native iOS bridge [from Braze Swift SDK 7.0.0 to 7.1.0](https://github.com/braze-inc/braze-swift-sdk/compare/7.0.0...7.1.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

##### Fixed
- Fixes the `setLastKnownLocation` method to sanitize null inputs before calling the native layer.
  - This previously caused an issue when calling this method on the legacy React Native architecture.
- Updates the native Android bridge [from Braze Android SDK 29.0.0 to 29.0.1](https://github.com/braze-inc/braze-android-sdk/compare/v29.0.0...v29.0.1#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

## 8.0.0

##### Breaking
- Updates the native Android bridge [from Braze Android SDK 27.0.1 to 29.0.0](https://github.com/braze-inc/braze-android-sdk/compare/v27.0.0...v29.0.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Updates the native iOS bridge [from Braze Swift SDK 6.6.0 to 7.0.0](https://github.com/braze-inc/braze-swift-sdk/compare/6.6.0...7.0.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Renames the `Banner` Content Card type to `ImageOnly`:
  - `BannerContentCard` → `ImageOnlyContentCard`
  - `ContentCardTypes.BANNER` → `ContentCardTypes.IMAGE_ONLY`
  - On Android, if the XML files in your project contain the word `banner` for Content Cards, it should be replaced with `image_only`.
- `Braze.getFeatureFlag(id)` will now return `null` if the feature flag does not exist.
- `Braze.Events.FEATURE_FLAGS_UPDATED` will only trigger when a refresh request completes with success or failure, and upon initial subscription if there was previously cached data from the current session.

##### Added
- Adds `Braze.getUserId()` to get the ID of the current user.

## 7.0.0

##### Breaking
- Updates the native Android bridge [from Braze Android SDK 26.3.2 to 27.0.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2701).

##### Fixed
- Fixes the Android layer to record date custom user attributes as ISO strings instead of integers.
- Fixes a bug introduced in `6.0.0` where `Braze.getInitialUrl()` may not trigger the callback on Android.

##### Added
- Updates the native iOS bridge [from Braze Swift SDK 6.4.0 to 6.6.0](https://github.com/braze-inc/braze-swift-sdk/compare/6.4.0...6.6.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Adds support for nested custom user attributes.
  - The `setCustomUserAttribute` now accepts objects and arrays of objects.
  - Adds an optional `merge` parameter to the `setCustomUserAttribute` method. This is a non-breaking change.
  - Reference our [public docs](https://www.braze.com/docs/user_guide/data_and_analytics/custom_data/custom_attributes/nested_custom_attribute_support/) for more information.
- Adds `Braze.setLastKnownLocation()` to set the last known location for the user.
- Adds `Braze.registerPushToken()` in the JavaScript layer to post a push token to Braze's servers.
  - Deprecates `Braze.registerAndroidPushToken()` in favor of `Braze.registerPushToken()`.
- Adds `Braze.getCachedContentCards()` to get the most recent content cards from the cache, without a refresh.
- Adds support for the Feature Flag method `logFeatureFlagImpression(id)`.

## 6.0.2

##### Fixed
- Updates the native Android bridge [from Braze Android SDK 26.3.1 to 26.3.2](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2632).

## 6.0.1

##### Fixed
- Adds `'DEFINES_MODULE' => 'YES'` to the iOS Podspec when compiling the Turbo Module to prevent the need for static framework linkage when using the Braze Expo plugin.

## 6.0.0

##### Breaking
- If you are using the New Architecture, this version requires React Native `0.70` or higher.
- Fixes the sample setup steps for iOS apps conforming to `RCTAppDelegate`.
  - ⚠️ If your app conforms to `RCTAppDelegate` and was following our previous `AppDelegate` setup in the sample project or [Braze documentation](https://www.braze.com/docs/developer_guide/platform_integration_guides/react_native/react_sdk_setup/?tab=ios#step-2-complete-native-setup), you will need to reference our [updated samples](https://github.com/braze-inc/braze-react-native-sdk/blob/master/BrazeProject/ios/BrazeProject/AppDelegate.mm) to prevent any crashes from occurring when subscribing to events in the new Turbo Module. ⚠️
- If your project contains unit tests that depend on the Braze React Native module, you will need to update your imports to the `NativeBrazeReactModule` file to properly mock the Turbo Module functions in Jest.
  - For an example, refer to the sample test setup [here](https://github.com/braze-inc/braze-react-native-sdk/tree/master/__tests__).
- Updates the native Android bridge [from Braze Android SDK 25.0.0 to 26.3.1](https://github.com/braze-inc/braze-android-sdk/compare/v25.0.0...v26.3.1#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Fixes the presentation of in-app messages to match the documented behavior.
  - Calling `subscribeToInAppMessages` or `addListener` in the Javascript layer will no longer cause a custom `BrazeInAppMessageUIDelegate` implementation on iOS to be ignored.
  - Calling `Braze.addListener` for the `inAppMessageReceived` event will subscribe in both the Javascript and the native layers (iOS + Android). This means it is no longer required to call `Braze.subscribeToInAppMessage`.
    - Per the Braze documentation, you do not need to explicitly call `subscribeToInAppMessage` to use the default In-App Message UI.
  - See our documentation for more details around [Advanced customization](https://www.braze.com/docs/developer_guide/platform_integration_guides/react_native/inapp_messages/?tab=ios#advanced-customization).

##### Added
- Migrates the Braze bridge to a backwards-compatible [New Architecture Turbo Module](https://reactnative.dev/docs/next/the-new-architecture/pillars-turbomodules).
  - This is a non-breaking change to your existing imports of the Braze SDK if you are using React Native `0.70`+.
  - The Braze SDK continues to be compatible with both the New Architecture and old React Native architecture.
- Adds the `getDeviceId` method to replace `getInstallTrackingId`, which is now deprecated.
- Updates the native iOS bridge [from Braze Swift SDK 6.3.1 to 6.4.0](https://github.com/braze-inc/braze-swift-sdk/compare/6.3.1...6.4.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).
- Adds a conditional library namespace to the Android `build.gradle` file to prepare for React Native 0.73, which uses AGP 8.x.
  - For more details, refer to this [React Native announcement](https://github.com/react-native-community/discussions-and-proposals/issues/671).

## 5.2.0

##### Fixed
- Fixes an issue on Android where push notifications wouldn't be forwarded after the app was closed.
- Fixes an issue on iOS preventing in-app message subscription events from being sent if `subscribeToInAppMessage` is called prior to any `Braze.addListener` calls.
- Changed the Java compatibility version for the Android plugin to Java 11.

##### Added
- Updates the native iOS bridge [from Braze Swift SDK 6.2.0 to 6.3.1](https://github.com/braze-inc/braze-swift-sdk/compare/6.2.0...6.3.1#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

## 5.1.0

##### Fixed
- Fixes an issue that occured whenever a custom event is logged with dictionary properties using a key named "type".
- Removes the automatic assignment of [`BrazeDelegate`](https://braze-inc.github.io/braze-swift-sdk/documentation/brazekit/braze/delegate) in the iOS bridge, allowing for custom implementations to be assigned to the `braze` instance.

## 5.0.0

##### Breaking
- Updates the native iOS bridge [from Braze Swift SDK 5.13.0 to 6.2.0](https://github.com/braze-inc/braze-swift-sdk/compare/5.13.0...6.2.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4edR1).
- Removes `setSDKFlavor` and `setMetadata`, which were no-ops starting from version `2.0.0`.
  - On iOS, these fields must be set using the `Braze.Configuration` object at SDK initialization.
  - On Android, these fields must be set via the `braze.xml` file.

##### Fixed
- Fixes an issue on Android with `getNewsFeedCards()` and `getContentCards()` where promises could be invoked more than once.

##### Added
- Updates the native Android bridge [from Braze Android SDK 24.3.0 to 25.0.0](https://github.com/braze-inc/braze-android-sdk/compare/v24.3.0...v25.0.0#diff-06572a96a58dc510037d5efa622f9bec8519bc1beab13c9f251e97e657a9d4ed).

## 4.1.0

##### Fixed
- Fixes an issue in the `PushNotificationEvent` object introduced in `2.0.1` where a field was named `context_text` instead of the correct value of `content_text`.

##### Added
- Adds support for the upcoming Braze Feature Flags product with the following methods:
  - `getFeatureFlag(id)`
  - `getAllFeatureFlags()`
  - `refreshFeatureFlags()`
  - `getFeatureFlagBooleanProperty(id, key)`
  - `getFeatureFlagStringProperty(id, key)`
  - `getFeatureFlagNumberProperty(id, key)`
- Adds the Braze Event key `Braze.Events.FEATURE_FLAGS_UPDATED` for subscribing to Feature Flags updates.

## 4.0.0

##### Breaking
- The iOS bridge now automatically attaches the default In-App Message UI with the `braze` instance, without needing to call `subscribeToInAppMessage()`. This updates the behavior from `2.0.0` to simplify integration.
  - This change doesn't affect integrations using custom UIs for in-app messages.
- Changes the returned value when subscribing to `Braze.Events.CONTENT_CARDS_UPDATED` to be a `Braze.ContentCardsUpdatedEvent` object instead of a boolean.
  - `Braze.ContentCardsUpdatedEvent` contains a `cards` property which is an array of the Content Cards in the update.
  - Thanks @Minishlink for your contribution!

##### Fixed
- Fixes an issue in the iOS bridge where `getContentCards()` and `getNewsFeedCards()` returned data in a different format than the Android bridge.
- Fixes the behavior when using the recommended iOS integration where the React Bridge delegate had conflicts with other dependencies. The updated sample app code can be found [here](https://github.com/braze-inc/braze-react-native-sdk/blob/master/BrazeProject/ios/BrazeProject/AppDelegate.mm).

##### Added
- Updates the native iOS bridge to [Braze Swift SDK 5.13.0](https://github.com/braze-inc/braze-swift-sdk/blob/main/CHANGELOG.md#5130).
- Improves typescript definitions for `addListener` event types.

## 3.0.0

> Starting with this release, this SDK will use [Semantic Versioning](https://semver.org/).

##### ⚠ Breaking
- Fixes the behavior in the iOS bridge introduced in version `2.0.0` when logging clicks for in-app messages, content cards, and news feed cards. Calling `logClick` now only sends a click event for metrics, instead of both sending a click event as well as redirecting to the associated `url` field.
  - For instance, to log a content card click and redirect to a URL, you will need two commands:
  ```
  Braze.logContentCardClicked(contentCard.id);

  // Your own custom implementation
  Linking.openUrl(contentCard.url);
  ```
  - This brings the iOS behavior to match version `1.x` and bring parity with Android's behavior.

##### Fixed
- Fixes an issue in the iOS bridge introduced in `2.0.0` where `getContentCards()` and `getNewsFeedCards()` would return an array of cards with the `url` and `image` fields as `null`.

##### Changed
- Updates the native iOS bridge to [Braze Swift SDK 5.11.2](https://github.com/braze-inc/braze-swift-sdk/blob/main/CHANGELOG.md#5112).
- Updates the native Android bridge to [Braze Android SDK 24.3.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2430).
- Updates `getContentCards` on the iOS bridge to initiate a refresh before returning the array of Content Cards. This brings parity with the Android bridge behavior.

## 2.1.0

##### Added
- Added `'DEFINES_MODULE' => 'YES'` to the Cocoapod's xcconfig to remove the need for static framework linkage on iOS when using the Braze Expo plugin.

## 2.0.2

##### Fixed
- Removes the usage of Objective-C modules when importing the Braze Swift SDK for improved compatibility with Objective-C++.
  - When importing `BrazeKit` or `BrazeLocation`, you must use the `#import <Module/Module-Swift.h>` syntax:
    - `@import BrazeKit;` → `#import <BrazeKit/BrazeKit-Swift.h>`
    - `@import BrazeLocation;` → `#import <BrazeLocation/BrazeLocation-Swift.h>`

## 2.0.1

##### Fixed
- Fixes compatibility issues with newer versions of React Native introduced in 2.0.0.
- Fixes an issue where callbacks were not being executed for some user attribute methods.

## 2.0.0

##### ⚠ Breaking
- The Braze React Native SDK npm package has moved from `react-native-appboy-sdk` to `@braze/react-native-sdk`.
- Renames `AppboyReactBridge` and `AppboyReactUtils` to `BrazeReactBridge` and `BrazeReactUtils`, respectively.
- This version requires React Native `0.68` or higher.
- Updates the native iOS bridge to use the new Swift SDK [version 5.9.1](https://github.com/braze-inc/braze-swift-sdk/blob/main/CHANGELOG.md#591).
- During migration, update your project with the following changes in your iOS integration:
  - To initialize Braze, [follow these integration steps](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/a2-configure-braze) to create a `configuration` object. Then, add this code to complete the setup:
    ```
    let braze = BrazePlugin.initBraze(configuration)
    ```
  - To continue using `SDWebImage` as a dependency, add this line to your project's `/ios/Podfile`:
    ```
    pod 'SDWebImage', :modular_headers => true
    ```
      - Then, follow [these setup instructions](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/c3-gif-support).
  - To use the default In-App Message UI, make sure to call `subscribeToInAppMessage()` or else follow [these instructions](https://braze-inc.github.io/braze-swift-sdk/tutorials/braze/c1-inappmessageui) to add it to your app.
  - For sample code to help with the migration, reference our sample app and [`AppDelegate.mm`](https://github.com/braze-inc/braze-react-native-sdk/blob/master/BrazeProject/ios/BrazeProject/AppDelegate.mm) file.
  - If you are integrating this SDK with an application that uses only Objective-C, create an empty Swift file to ensure that all the relevant Swift runtime libraries are linked. Reference [this file](https://github.com/braze-inc/braze-react-native-sdk/blob/master/BrazeProject/ios/BrazeProject/empty-file.swift) from our sample app.
- The following methods for News Feed are now no-ops on iOS:
  - `Braze.launchNewsFeed()`
  - `Braze.getCardCountForCategories()`
  - `Braze.getUnreadCardCountForCategories()`
- Updates the native Android bridge to [Braze Android SDK 24.2.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2420).

##### Added
- Adds the following APIs to more easily interface with the News Feed product. Thanks @swissmanu for your contribution!
  - `Braze.getNewsFeedCards()`
  - `Braze.logNewsFeedCardClicked()`
  - `Braze.logNewsFeedCardImpression()`

## 1.41.0

##### ⚠ Breaking
- Removed `setFacebookData()`.
- Removed `setTwitterData()`.

##### Changed
- Updated the native Android bridge to [Braze Android SDK 23.3.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2330).
- Exposes `isControl` field for `ContentCard`.
- Removed `kotlinVersion` gradle template variable. To override the Kotlin version used, please use a Gradle dependency `resolutionStrategy`.

## 1.40.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 23.2.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2321).
- Updated the native iOS bridge to [Braze iOS SDK 4.5.1](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#451).

##### Changed
- Updated the `React` podspec dependency to `React-Core`.

## 1.39.0

##### ⚠ Breaking
- Renamed the `kotlin_version` gradle template variable to `kotlinVersion`.
- Updated the native Android bridge to [Braze Android SDK 23.2.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2320).

##### Fixed
- Fixed an issue that caused a NativeEventEmitter warning message to appear.

## 1.38.1

##### Fixed
- Fixed an issue introduced in 1.38.0 where `setEmail` did not work as expected on Android.

## 1.38.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 23.0.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2301).
- Updated the native iOS bridge to [Braze iOS SDK 4.5.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#450).
- The Braze React Native Android SDK now requires Kotlin directly for compilation. An example is included below:
  ```groovy
    buildscript {
        ext.kotlin_version = '1.6.0'

        dependencies {
            classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        }
    }
  ```

##### Added
- Introduced `Braze.Events.PUSH_NOTIFICATION_EVENT` which can be used to listen for Braze Push Notification events on Android. See example below:
  ```javascript
  Braze.addListener(Braze.Events.PUSH_NOTIFICATION_EVENT, function(data) {
    console.log(`Push Notification event of type ${data.push_event_type} seen.
      Title ${data.title}\n and deeplink ${data.deeplink}`);
    console.log(JSON.stringify(data, undefined, 2));
  });
  ```
- Added `Braze.requestPushPermission()` to request a permissions prompt for push notifications.

## 1.37.0

##### ⚠ Breaking
- The Braze React Native SDK now exports its default object as an ES Module. If you currently import the SDK using `require()`, you will need to now import it as a standard ES Module (e.g. `import Braze from "react-native-appboy-sdk"`).

##### Added
- Introduced `Braze.subscribeToInAppMessage()` which publishes an event to the Javascript layer when an in-app message is triggered and allows you to choose whether or not to use the default Braze UI to display in-app messages.

## 1.36.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 21.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#2100).
- Updated the native iOS bridge to [Braze iOS SDK 4.4.4](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#444).
- Removed `setAvatarImageUrl()`.
- Removed `logContentCardsDisplayed`. This method was not part of the recommended Content Cards integration and can be safely removed.

## 1.35.1

##### Fixed
- Fixed an issue where `setMetadata` did not have a method implementation for Android.

## 1.35.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 4.4.2](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#442).
- Drops support for iOS 9 and 10.

## 1.34.1

##### Fixed
- Fixed an issue where `getInitialUrl` would not resolve when there is no initial URL.

## 1.34.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 18.0.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1801).

##### Fixed
- Fixed an issue with Content Card types. Thanks @jtparret!

##### Changed
- Improved logging around `getInitialUrl`.

## 1.33.1

##### Fixed
- Fixed an issue introduced in 1.33.0 that caused a build error on iOS.

## 1.33.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 16.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1600).
- Updated the native iOS bridge to [Braze iOS SDK 4.3.4](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#434).

##### Added
- Added `ReactAppboy.addToSubscriptionGroup()` and `ReactAppboy.removeFromSubscriptionGroup()` to manage SMS/Email Subscription Groups.
- Custom events and purchases now support nested properties. In addition to integers, floats, booleans, dates, or strings, a JSON object can be provided containing dictionaries of arrays or nested dictionaries. All properties combined can be up to 50 KB in total length.

## 1.32.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 15.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1500).
- Updated the native iOS bridge to [Braze iOS SDK 4.3.2](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#432).

## 1.31.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 4.3.1](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#431).

##### Added
- Added support for new SDK Authentication feature to the Javascript layer. See `setSdkAuthenticationSignature` on the `Appboy` interface, as well as the optional `signature` parameter on `ReactAppboy.changeUser`.

## 1.30.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 4.3.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#430), which fixes a crashing issue with Content Cards when using the default UI.
- Updated the native Android bridge to [Braze Android SDK 14.0.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1401).

## 1.29.1

##### ⚠️ Known Issues
- This release contains a known issue with the Content Cards default UI on iOS, where showing a "Classic" type card with an image causes a crash. If you are using the default Content Cards UI, do not upgrade to this version.

##### Fixed
- Fixed issue introduced in 1.29.0 where calling `ReactAppboy.changeUser` would cause an error on Android.

## 1.29.0

##### ⚠️ Known Issues
- This release contains a known issue with the Content Cards default UI on iOS, where showing a "Classic" type card with an image causes a crash. If you are using the default Content Cards UI, do not upgrade to this version.

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 14.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1400).
- Updated the native iOS bridge to [Braze iOS SDK 4.2.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#420).

## 1.28.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 4.0.2](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#402).
- Updated the native Android bridge to [Braze Android SDK 13.1.2](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1312), which contains support for Android 12.

##### Added
- Added support for `ReactAppboy.setGoogleAdvertisingId()` to set the Google Advertising ID and associated ad-tracking enabled field for Android devices. This is a no-op on iOS.

##### Fixed
- Fixed an issue where calling `getInstallTrackingId()` while the SDK was disabled would cause a crash on iOS.

## 1.27.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.33.1](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3331).
- Updated the native Android bridge to [Braze Android SDK 13.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1300).

##### Added
- Added support for receiving iOS push action button deep links in `ReactAppboy.getInitialURL()`. If you are using `ReactAppboy.getInitialURL()` and implement iOS push action button categories, add the following code to the beginning of your `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`:
  ```
  [[AppboyReactUtils sharedInstance] populateInitialUrlForCategories:response.notification.request.content.userInfo];
  ```

## 1.26.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.31.2](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3312).
- Updated the native Android bridge to [Braze Android SDK 12.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1200).

## 1.25.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.29.1](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3291), which adds improved support for in-app message display on iPhone 12 models.
- Updated the native Android bridge to [Braze Android SDK 11.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1100).

## 1.24.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.28.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3280).
- Updated the native Android bridge to [Braze Android SDK 10.1.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1010). Please read the Braze Android SDK changelog for details.

## 1.23.0

##### ⚠ Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.27.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3270). This release adds support for iOS 14 and requires XCode 12. Please read the Braze iOS SDK changelog for details.

## 1.22.0

##### Changed
- Updated the native Android bridge to [Braze Android SDK 8.1.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#810), which contains support for Android 11.
- Updated the native iOS bridge to [Braze iOS SDK 3.26.1](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3261), which contains preliminary support for iOS 14.

## 1.21.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 8.0.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#801).
- Updated the native iOS bridge to [Braze iOS SDK 3.26.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3260).

##### Added
- Added support for working with in-app messages in the JavaScript layer. In-App Messages can be instantiated using the `BrazeInAppMessage` class. The resulting object can be passed into the analytics methods: `logInAppMessageClicked`, `logInAppMessageImpression`, and `logInAppMessageButtonClicked` (along with the button index). See the README for additional implementation details or the `AppboyProject` sample app for an integration example.

##### Changed
- Improved Typescript definitions for `setCustomUserAttribute` and `incrementCustomUserAttribute`.
  - Thanks @janczizikow!

##### Fixed
- Fixed incorrect TypeScript definition for `ContentCard`.
  - Thanks @Hannes-Sandahl-Mpya!

## 1.20.0

##### ⚠ Breaking
- Updated the native Android bridge to [Braze Android SDK 7.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#700).

##### Added
- Added `ReactAppboy.requestGeofences()` to request a Braze Geofences update for a manually provided GPS coordinate. Automatic Braze Geofence requests must be disabled to properly use this method.

## 1.19.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 5.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#500).
- Updated the native iOS bridge to [Braze iOS SDK 3.21.3](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3213).

## 1.18.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.8.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#380).

##### Fixed
- Fixed an issue where `ReactContext.getJSModule()` could be called before the native module was initialized.
  - Thanks @tszajna0!

##### Changed
- Updated the native iOS bridge to [Braze iOS SDK 3.20.4](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3204).

## 1.17.4

##### Fixed
- Removed a support library reference in `AppboyReactBridge.java` that caused Androidx compatibility issues.

## 1.17.3

##### Fixed
- Added `SDWebImage` and `Headers` pod directories to the `AppboyReactBridge` project's Header Search Paths. Thanks @tomauty and @mlazari for your contributions! See https://github.com/braze-inc/braze-react-native-sdk/pull/70 and https://github.com/braze-inc/braze-react-native-sdk/pull/69.

##### Changed
- Updated the native Android bridge to [Braze Android SDK 3.7.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#371).

## 1.17.2

**Important:** This patch updates the Braze iOS SDK Dependency from 3.20.1 to 3.20.2, which contains important bugfixes. Integrators should upgrade to this patch version. Please see the [Braze iOS SDK Changelog](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md) for more information.

##### Changed
- Updated the native iOS bridge to [Braze iOS SDK 3.20.2](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3202).

## 1.17.1

**Important:** This release has known issues displaying HTML in-app messages. Do not upgrade to this version and upgrade to 1.17.2 and above instead. If you are using this version, you are strongly encouraged to upgrade to 1.17.2 or above if you make use of HTML in-app messages.

##### Changed
- Updated the native iOS bridge to [Braze iOS SDK 3.20.1](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3201).

## 1.17.0

**Important:** This release has known issues displaying HTML in-app messages. Do not upgrade to this version and upgrade to 1.17.2 and above instead. If you are using this version, you are strongly encouraged to upgrade to 1.17.2 or above if you make use of HTML in-app messages.

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.20.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3200).
- **Important:** Braze iOS SDK 3.20.0 contains updated push token registration methods. We recommend upgrading to these methods as soon as possible to ensure a smooth transition as devices upgrade to iOS 13. In `application:didRegisterForRemoteNotificationsWithDeviceToken:`, replace
```
[[Appboy sharedInstance] registerPushToken:
                [NSString stringWithFormat:@"%@", deviceToken]];
```
with
```
[[Appboy sharedInstance] registerDeviceToken:deviceToken];
```
- `ReactAppboy.registerPushToken()` was renamed to `ReactAppboy.registerAndroidPushToken()` and is now a no-op on iOS. On iOS, push tokens must now be registered through native methods.

## 1.16.0

**Important** This release has known issues displaying HTML in-app messages. Do not upgrade to this version and upgrade to 1.17.2 and above instead. If you are using this version, you are strongly encouraged to upgrade to 1.17.2 or above if you make use of HTML in-app messages.

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.19.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3190).
- Updated the native Android bridge to [Braze Android SDK 3.7.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#370).
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
  - See https://github.com/braze-inc/braze-react-native-sdk/pull/58. Thanks @alexmbp!

## 1.15.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.17.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3170).
- Removed the `NewsFeedLaunchOptions` enum. Using these arguments with `launchNewsFeed()` had been a no-op since version 1.7.0.

## 1.14.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.5.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#350).

##### Fixed
- Fixed an issue where logging custom events or purchases without event properties would cause crashes on Android, for example `logCustomEvent("event")`.

##### Added
- Added additional TypeScript definitions.

## 1.13.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.15.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3150).
  - This release of the iOS SDK added support for SDWebImage version 5.0.
  - Note that upgrading to SDWebImage 5.0 also removed the FLAnimatedImage transitive dependency.

## 1.12.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.3.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#330).

##### Added
- Added `ReactAppboy.launchContentCards()` for launching the content cards UI.

## 1.11.1

##### Added
- Added Typescript definitions for the `Appboy` interface.
  - Thanks @ahanriat and @josin for your contributions! See https://github.com/braze-inc/braze-react-native-sdk/pull/57 and https://github.com/braze-inc/braze-react-native-sdk/pull/38.
  - Note that certain less-used parts of the API were excluded. Please file an issue if you would like specific method(s) added.

## 1.11.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.2.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#320).
  - Added `AppboyFirebaseMessagingService` to directly use the Firebase messaging event `com.google.firebase.MESSAGING_EVENT`. This is now the recommended way to integrate Firebase push with Braze. The `AppboyFcmReceiver` should be removed from your `AndroidManifest` and replaced with the following:
    ```
    <service android:name="com.appboy.AppboyFirebaseMessagingService">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>
    ```
    - Also note that any `c2dm` related permissions should be removed from your manifest as Braze does not require any extra permissions for `AppboyFirebaseMessagingService` to work correctly.
- Updated the native iOS bridge to [Braze iOS SDK 3.14.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3140).
  - Dropped support for iOS 8.

##### Added
- Added support for sending JavaScript `Date()` type custom event and purchase properties through the `Appboy` interface.

## 1.10.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 3.1.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#310).

##### Added
- Added `addAlias(aliasName, aliasLabel)` to the `Appboy` interface to allow aliasing users.
  - Thanks @alexmbp!

##### Changed
- Updated `build.gradle` to use `project.ext` config if available.

## 1.9.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.11.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#3110).
- Updated the native Android bridge to [Braze Android SDK 3.0.1](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#301).
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
- Updated the native iOS bridge to [Braze iOS SDK 3.8.4](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#384).

## 1.8.0

##### Breaking
- Updated the native Android bridge to [Braze Android SDK 2.7.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#270).
  - __Important:__ Note that in Braze Android SDK 2.7.0, `AppboyGcmReceiver` was renamed to `AppboyFcmReceiver`. This receiver is intended to be used for Firebase integrations. Please update the `AppboyGcmReceiver` declaration in your `AndroidManifest.xml` to reference `AppboyFcmReceiver` and remove the `com.google.android.c2dm.intent.REGISTRATION` intent filter action.
- Updated the native iOS bridge to [Braze iOS SDK 3.8.3](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#383).

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
- Updated the native iOS bridge to [Braze iOS SDK 3.5.1](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#351).
- Updated the native Android bridge to [Appboy Android SDK 2.4.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#240).

##### Added
- Added `Other`, `Unknown`, `Not Applicable`, and `Prefer not to Say` options for user gender.
- Updated the `AppboyProject` sample app to use FCM instead of GCM.
- Added toasts to provide feedback for user actions in the `AppboyProject` sample app.
- Implemented `requiresMainQueueSetup` in `AppboyReactBridge.m` to prevent warnings in React Native 0.49+.
  - See https://github.com/braze-inc/braze-react-native-sdk/pull/39. Thanks @danieldecsi!

##### Changed
- Passing launch options into `launchNewsFeed()` is now a no-op.

## 1.6.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.3.3](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#333).
- Updated the native Android bridge to [Braze Android SDK 2.2.5](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#225).

##### Added
- Added support for wiping all customer data created by the Braze SDK via `Appboy.wipeData()`.
  - Note that on iOS, `wipeData()` will disable the SDK for the remainder of the app run. For more information, see our iOS SDK's documentation for [`disableSDK`](http://appboy.github.io/appboy-ios-sdk/docs/interface_appboy.html#a8d3b78a98420713d8590ed63c9172733).
- Added `Appboy.disableSDK()` to disable the Braze SDK immediately.
- Added `Appboy.enableSDK()` to re-enable the SDK after a call to `Appboy.disableSDK()`.
  - Note that on iOS, `enableSDK()` will not enable the SDK immediately. For more information, see our iOS SDK's documentation for [`requestEnableSDKOnNextAppRun`](http://appboy.github.io/appboy-ios-sdk/docs/interface_appboy.html#a781078a40a3db0de64ac82dcae3b595b).

##### Changed
- Removed `allowBackup` from the plugin `AndroidManifest.xml`.
  - See https://github.com/braze-inc/braze-react-native-sdk/pull/34. Thanks @SMJ93!

## 1.5.2

##### Fixed
- Fixed a race condition between SDK flavor reporting and sharedInstance initialization on iOS.

## 1.5.1

##### Fixed
- Fixed a bug that caused opted-in subscription states to not be reflected on the user profile.

## 1.5.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 3.0.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#300) or later.
- Updated the native Android bridge to [Braze Android SDK 2.2.4](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#224).
- Changed success callbacks on `submitFeedback()` on Android to always return `true` as `submitFeedback()` was changed to return `void` in the native SDK.

## 1.4.1

##### Added
- Added support for apps that use use_frameworks in Podfile.
  - See https://github.com/braze-inc/braze-react-native-sdk/commit/6db78a5bbeb31457f8a1dcf988a3265d8db9a437 and https://github.com/braze-inc/braze-react-native-sdk/issues/29. Thanks @jimmy-devine and @sljuka.

## 1.4.0

##### Breaking
- Updated the native iOS bridge to [Braze iOS SDK 2.31.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#2310) or later.
- Updated the native Android bridge to [Braze Android SDK 2.1.4](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#214).

##### Added
- Added `ReactAppboy.registerPushToken()` for registering push tokens with Braze.
  - See https://github.com/braze-inc/braze-react-native-sdk/pull/13. Thanks @dcvz!
- Added the local `react-native-appboy-sdk` Podspec for integrating the React Native iOS bridge via Cocoapods.
  - See https://github.com/braze-inc/braze-react-native-sdk/pull/15. Thanks @pietropizzi!

## 1.3.0

##### Breaking
- Updates the native iOS bridge to use [Braze iOS SDK 2.29.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#2290), which drops support for iOS 7.
- Updates the native Android bridge to use [Braze Android SDK 2.0.0](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#200).

##### Added
- Adds `ReactAppboy.requestImmediateDataFlush()` for requesting an immediate flush of any data waiting to be sent to Braze's servers.
- Adds `ReactAppboy.requestFeedRefresh()` for requesting a refresh of the News Feed.
  - See https://github.com/braze-inc/braze-react-native-sdk/pull/12. Thanks @stief510!
- Added the ability to pass an optional dictionary of News Feed launch options to `launchNewsFeed()`. See `NewsFeedLaunchOptions` for supported keys.
  - For more information on currently supported `NewsFeedLaunchOptions` keys, see the card width and card margin properties on [ABKFeedViewController](http://appboy.github.io/appboy-ios-sdk/docs/interface_a_b_k_feed_view_controller.html).
  - See https://github.com/braze-inc/braze-react-native-sdk/pull/10. Thanks @mihalychk!

## 1.2.0

##### Breaking
- Updates the native iOS bridge to be compatible with React Native [v0.40.0](https://github.com/facebook/react-native/releases/tag/v0.40.0).

##### Changed
- Updates the AppboyProject sample project to React Native v0.41.1.

## 1.1.0

##### Breaking
- **Update Required** — Fixes a bug in the [iOS bridge](https://github.com/braze-inc/braze-react-native-sdk/blob/master/iOS/BrazeReactBridge/BrazeReactBridge/BrazeReactBridge.mm) where custom attribute dates were converted incorrectly, causing incorrect date data to be sent to Braze. As a result of the fix, `setDateCustomUserAttribute()` in the iOS React bridge may now only be called with a double.
  - Note: The default Javascript Braze interface has not changed, so for most integrations this just requires updating the SDK, unless you were manually calling our iOS bridge outside of our recommended integration.
  - See https://github.com/braze-inc/braze-react-native-sdk/issues/7

## 1.0.0

##### Breaking
- **Update Required** — Updates iOS push handling in the AppboyProject sample project to be compatible with iOS 10. For more information, refer to the CHANGELOG for [Braze iOS SDK v2.24.0](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#2240).

##### Added
- Adds callbacks to the native bindings to provide function call results to React Native.
- Exposes `ReactAppboy.getCardCountForCategories()` and `ReactAppboy.getUnreadCardCountForCategories()` for retrieving News Feed card counts.
  - See https://github.com/braze-inc/braze-react-native-sdk/issues/1
- Adds `ReactAppboy.getInitialURL()` for handling deep links when an iOS application is launched from the suspended state by clicking on a push notification with a deep link. See `componentDidMount()` in `AppboyProject.js` for a sample implementation.
- Exposes `ReactAppboy.setTwitterData()` and `ReactAppboy.setFacebookData()` for Twitter and Facebook integration.
  - See https://github.com/braze-inc/braze-react-native-sdk/issues/4

##### Changed
- Targets [Braze Android SDK version 1.15.3](https://github.com/braze-inc/braze-android-sdk/blob/master/CHANGELOG.md#1153) and [Braze iOS SDK version 2.24.2](https://github.com/braze-inc/braze-ios-sdk/blob/master/CHANGELOG.md#2242).
- Updates the AppboyProject sample application to React Native v0.33.0.
- Updates the AppboyProject sample project to integrate session handling and in-app message manager registration using an [AppboyLifecycleCallbackListener](https://github.com/braze-inc/braze-android-sdk/blob/master/android-sdk-ui/src/main/java/com/braze/BrazeActivityLifecycleCallbackListener.kt), as introduced in Braze Android SDK v1.15.0.

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
