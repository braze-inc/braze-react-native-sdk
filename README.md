<p align="center">
  <img width="480" alt="Braze Logo" src=".github/assets/logo-light.png#gh-light-mode-only" />
  <img width="480" alt="Braze Logo" src=".github/assets/logo-dark.png#gh-dark-mode-only" />
</p>

# Braze React Native SDK [![latest](https://img.shields.io/github/v/tag/braze-inc/braze-react-native-sdk?label=latest%20release&color=300266)](https://github.com/braze-inc/braze-react-native-sdk/releases) [![npm](https://img.shields.io/npm/v/@braze/react-native-sdk?label=npm&color=300266)](https://www.npmjs.com/package/@braze/react-native-sdk)

- [Braze User Guide](https://www.braze.com/docs/user_guide/introduction/)
- [Braze Developer Guide — React Native](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native)

## About the Braze React Native SDK

The Braze React Native SDK connects your iOS and Android apps to Braze: user profiles, messaging surfaces, analytics, and feature flags. It wraps the native [Braze Swift SDK](https://github.com/braze-inc/braze-swift-sdk) and [Braze Android SDK](https://github.com/braze-inc/braze-android-sdk) behind a JavaScript API.

**Initialization is JavaScript-driven:** you set up native configuration (push, logging, delegates) in Android resources and iOS `AppDelegate`, then call `Braze.initialize(apiKey, endpoint)` from JavaScript to start the SDK. This gives you full control over when the SDK initializes and with which credentials. After initialization, call other SDK methods (for example `changeUser`, `logCustomEvent`) as needed.

### What you can do

- **User management**: Identify users, set profile fields, custom attributes, aliases, and subscription groups
- **In-app messages**: Default Braze UI or custom handling via subscriptions and logging APIs
- **Content Cards**: Default feed UI, or fetch cards and build your own UI
- **Banners**: Placement-based HTML banners, including `BrazeBannerView`
- **Push notifications**: Permission prompts, token registration, payload listeners (see platform notes below)
- **Feature flags**: Refresh, read properties, log impressions
- **Analytics**: Custom events, purchases, immediate flush
- **SDK controls**: Enable/disable SDK, wipe local data, SDK Authentication signatures

## Prerequisites

- **Braze account** with app API key and SDK endpoint
- **React Native** development environment ([React Native environment setup](https://reactnative.dev/docs/set-up-your-environment))
- **iOS**: Xcode, CocoaPods (`cd ios && pod install`)
- **Android**: Android Studio / Gradle; Kotlin Gradle plugin as required by your React Native template
- **Push** (if used): FCM (Android) and APNs (iOS) setup per [push documentation](https://www.braze.com/docs/developer_guide/platform_integration_guides/react_native/push_notifications/)

For credential locations in the dashboard, follow the [integration overview](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native).

## Table of contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Native setup](#native-setup)
4. [Configuration reference](#configuration-reference)
5. [JavaScript / TypeScript API](#javascript--typescript-api)
6. [Core features](#core-features)
   - [User management](#user-management)
   - [In-app messages](#in-app-messages)
   - [Content Cards](#content-cards)
   - [Banners](#banners)
   - [Push notifications](#push-notifications)
   - [Feature flags](#feature-flags)
   - [Analytics and purchases](#analytics-and-purchases)
   - [Data management and SDK state](#data-management-and-sdk-state)
7. [Events](#events)
8. [Integration notes](#integration-notes)
9. [Version support](#version-support)
10. [Braze Expo plugin](#braze-expo-plugin)
11. [Sample app](#sample-app)
12. [Debugging and troubleshooting](#debugging-and-troubleshooting)
13. [Additional resources](#additional-resources)

---

## Installation

```shell
npm install @braze/react-native-sdk
# or:
# yarn add @braze/react-native-sdk
```

---

## Quick start

1. Install the npm package (above).
2. Complete **native setup** for Android and iOS (configuration, permissions, push if needed).
3. Initialize the SDK from JavaScript and start using it:

```typescript
import Braze from "@braze/react-native-sdk";

// Initialize the SDK — call early in your app lifecycle (e.g. in a useEffect).
// The API key and endpoint are passed from JavaScript; native configuration
// (push, logging, etc.) is applied automatically from your native setup.
Braze.initialize("<YOUR_API_KEY>", "<YOUR_SDK_ENDPOINT>");

Braze.changeUser("user-123");
Braze.logCustomEvent("button_clicked", { screen: "home" });
```

TypeScript typings ship with the package (`src/index.d.ts` on GitHub).

Calling `Braze.initialize` again with different credentials tears down the current instance and re-creates it, supporting mid-session re-initialization.

---

## Native setup

> **Source of truth:** Step-by-step screens, Gradle/CocoaPods changes, and the full list of Android XML keys are in the [Braze React Native developer guide](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native). The snippets below are minimal examples.

### Android

- Add the **Kotlin Gradle plugin** in your root `build.gradle` if your template does not already (versions depend on your React Native version).
- Add a `braze.xml` resource file in `res/values` with your configuration. Enable delayed initialization so the SDK waits for `Braze.initialize()` from JavaScript before starting. Other configuration values (push, session timeout, etc.) are still read from this file and applied at initialization time.
- Ensure basic permissions such as `INTERNET` and `ACCESS_NETWORK_STATE` in `AndroidManifest.xml`.
- For push, complete FCM integration and any Braze-specific sender ID / registration flags described in the docs.

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <!-- Enable delayed initialization so the SDK starts when
       Braze.initialize() is called from JavaScript. -->
  <bool name="com_braze_enable_delayed_initialization">true</bool>

  <!-- Additional native configuration (applied at initialization time) -->
  <bool name="com_braze_firebase_cloud_messaging_registration_enabled">true</bool>
  <string translatable="false" name="com_braze_firebase_cloud_messaging_sender_id">YOUR_SENDER_ID</string>
</resources>
```

> **Note:** The API key and endpoint are no longer set in `braze.xml` — they are passed from JavaScript via `Braze.initialize(apiKey, endpoint)`.

### iOS

```shell
cd ios && pod install
```

Use `BrazeReactInitializer.configure` in your `AppDelegate` to register native configuration. The closures you provide are stored and applied later when `Braze.initialize(apiKey, endpoint)` is called from JavaScript.

```swift
import BrazeKit
import braze_react_native_sdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  static var braze: Braze? = nil

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Register native configuration for when JS calls Braze.initialize().
    BrazeReactInitializer.configure { config in
      config.logger.level = .info
      config.push.automation = true
    } postInitialization: { braze in
      AppDelegate.braze = braze
    }

    // ... React Native setup
    return true
  }
}
```

- **`configure` closure**: receives a `Braze.Configuration` and lets you set native configuration properties (logging, push, sessions, etc.). The API key and endpoint are provided from JavaScript — you do not set them here.
- **`postInitialization` closure** *(optional)*: receives the live `Braze` instance after creation, for setup that requires the instance (e.g. storing a reference, setting delegates).

> **Note:** `BrazeReactInitializer.configure` is a Swift-first API that replaces the deprecated `BrazeReactBridge.initBraze(_:)`. It also resolves a Swift type-resolution issue with `Braze.Configuration` in the Objective-C bridge.

---

## Configuration reference

In React Native, **configuration is native**: Android reads `res/values/braze.xml`, and iOS uses closures registered via **`BrazeReactInitializer.configure`**. Both are applied when `Braze.initialize(apiKey, endpoint)` is called from JavaScript.

### Android (`braze.xml`)

Defaults live in XML; [`BrazeConfig.Builder`](https://braze-inc.github.io/braze-android-sdk/kdoc/braze-android-sdk/com.braze.configuration/-braze-config/-builder/index.html) can override them at startup. The authoritative list of keys and types is in the [Android SDK integration guide](https://www.braze.com/docs/developer_guide/platforms/android/sdk_integration/) and in [`BrazeConfigurationProvider`](https://braze-inc.github.io/braze-android-sdk/kdoc/braze-android-sdk/com.braze.configuration/-braze-configuration-provider/index.html) (each Kotlin property corresponds to documented `com_braze_*` resources).

Commonly used entries:

| Key | Resource type | Description |
|-----|---------------|-------------|
| `com_braze_enable_delayed_initialization` | `bool` | **Required.** Set to `true` so the SDK waits for `Braze.initialize()` from JavaScript. |
| `com_braze_api_key` | `string` | Not needed when using `Braze.initialize()` from JavaScript (credentials are passed from JS). Only required for legacy native-first initialization. |
| `com_braze_custom_endpoint` | `string` | Not needed when using `Braze.initialize()` from JavaScript. Only required for legacy native-first initialization. |
| `com_braze_server_target` | `string` | Optional cluster / environment selector (e.g. some internal or staging builds). Prefer `com_braze_custom_endpoint` for production unless your Braze integration specifies otherwise. |
| `com_braze_firebase_cloud_messaging_registration_enabled` | `bool` | When `true`, Braze registers for FCM (typical push setup). |
| `com_braze_firebase_cloud_messaging_sender_id` | `string` | FCM sender ID when automatic registration is enabled. |
| `com_braze_handle_push_deep_links_automatically` | `bool` | Let Braze open push deep links automatically. |
| `com_braze_trigger_action_minimum_time_interval_seconds` | `integer` | Minimum seconds between in-app message trigger actions. |
| **Other** | *various* | Additional keys not show here (session timeout, geofences, location, notification defaults, device allowlists, delayed initialization, SDK Authentication, etc…). See [`BrazeConfigurationProvider`](https://braze-inc.github.io/braze-android-sdk/kdoc/braze-android-sdk/com.braze.configuration/-braze-configuration-provider/index.html) and the [Android SDK integration guide](https://www.braze.com/docs/developer_guide/platforms/android/sdk_integration/). |

### iOS (`Braze.Configuration`)

Set native configuration properties in the `configure` closure passed to `BrazeReactInitializer.configure`. The closure receives a `Braze.Configuration` instance — the API key and endpoint are set automatically from the JavaScript `Braze.initialize` call. Full details: [`Braze.Configuration`](https://braze-inc.github.io/braze-swift-sdk/documentation/brazekit/braze/configuration-swift.class) and nested types **`api`**, **`push`**, **`logger`**, **`location`**.

| Area | Members (representative) | Notes |
|------|--------------------------|--------|
| **Credentials** | `api.key`, `api.endpoint` | Set automatically from `Braze.initialize(apiKey, endpoint)` in JavaScript. Do not set these in the `configure` closure. |
| **Logging** | `logger.level` | Verbose logging is for development; reduce noise in production. |
| **Push** | `push.automation`, `push.appGroup`, … | Automation simplifies registration; `appGroup` needed for Push Stories / extensions when used. |
| **In-app messages** | `triggerMinimumTimeInterval` | Default **30** seconds between triggers. |
| **Sessions** | `sessionTimeout` | Inactivity before a new session (see Braze session docs). |
| **Privacy / data** | `api.trackingPropertyAllowList`, `devicePropertyAllowList`, `api.sdkAuthentication` | Align with [privacy manifest](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/privacy_manifest/) and SDK Authentication product settings. |
| **Networking** | `api.requestPolicy`, `api.flushInterval` | Request retry policy and flush cadence. |
| **Push subscription** | `optInWhenPushAuthorized` | When `true`, subscription can move to opted-in after the user authorizes notifications. |
| **IAM + user changes** | `preventInAppMessageDisplayForDifferentUser` | Reduces mismatched IAM if the user ID changes. |
| **Other** | `forwardUniversalLinks`, `ephemeralEvents`, `useUUIDAsDeviceId`, … | See Swift documentation for full behavior. |

The React Native bridge sets React-specific **`api.sdkFlavor`** / SDK metadata on init; do not override those unless Braze documentation instructs you to.

---

## JavaScript / TypeScript API

The package default export is the `Braze` class with **static** methods (for example `Braze.changeUser`, `Braze.logPurchase`). Constants such as `Braze.Events`, `Braze.Genders`, and `Braze.NotificationSubscriptionTypes` are attached to the same export.

---

## Core features

### User management

```typescript
import Braze from "@braze/react-native-sdk";

Braze.changeUser("user-123");
Braze.setEmail("user@example.com");
Braze.setCustomUserAttribute("plan", "premium");
Braze.addAlias("external_id", "marketing_id");
Braze.addToSubscriptionGroup("NEWSLETTER_GROUP_UUID");
```

Optional **SDK Authentication**: pass a signature as the second argument to `changeUser`, or call `Braze.setSdkAuthenticationSignature(signature)` when enabled in the dashboard.

### In-app messages

- With the **default Braze UI**, follow the [in-app message documentation](hhttps://www.braze.com/docs/developer_guide/in_app_messages?sdktab=react%20native); you typically do **not** need to call `subscribeToInAppMessage` only to show default UI.
- For **custom** handling, subscribe with `useBrazeUI: false`, then log impressions/clicks as needed:

```typescript
Braze.subscribeToInAppMessage(false, (event) => {
  const msg = event.inAppMessage;
  // Render your own UI from msg.message, msg.buttons, etc.
  Braze.logInAppMessageImpression(msg);
});
```

### Content Cards

```typescript
const cards = await Braze.getContentCards();
Braze.requestContentCardsRefresh();
Braze.launchContentCards(); // default Braze UI

Braze.logContentCardImpression(cardId);
Braze.logContentCardClicked(cardId);
```

Listen for updates with `Braze.addListener(Braze.Events.CONTENT_CARDS_UPDATED, ...)`.

### Banners

```typescript
import Braze from "@braze/react-native-sdk";

Braze.requestBannersRefresh(["homepage_banner"]);
const banner = await Braze.getBanner("homepage_banner");

// Or use the native Banner view:
// <Braze.BrazeBannerView placementID="homepage_banner" />
```

### Push notifications

```typescript
Braze.requestPushPermission({
  alert: true,
  badge: true,
  sound: true,
});
// Token registration is usually handled natively; see docs for your setup.
Braze.registerPushToken(token);
```

- **`getInitialPushPayload`**: use when the app opens from a notification to avoid RN `Linking` race conditions; requires native hooks (`BrazeReactUtils` on iOS, `BrazeReactUtils.populateInitialPushPayloadFromIntent` on Android) as described in the TypeScript doc comments and sample app.
- **`Braze.addListener(Braze.Events.PUSH_NOTIFICATION_EVENT, ...)`** is **Android-only** per the public typings.

### Feature flags

```typescript
const flag = await Braze.getFeatureFlag("new_checkout");
if (flag?.enabled) {
  const rollout = flag.getNumberProperty("rollout_percentage") ?? 0;
}
Braze.refreshFeatureFlags();
Braze.logFeatureFlagImpression("new_checkout");
```

### Analytics and purchases

```typescript
Braze.logCustomEvent("purchase_completed", { sku: "sku-1" });
Braze.logPurchase("sku-1", "29.99", "USD", 1, { source: "cart" });
Braze.requestImmediateDataFlush();
```

Note: `logPurchase` takes **price as a string** (see typings).

### Data management and SDK state

**`changeUser`** only tells Braze which user ID to attribute **new** activity to. It does **not** clear cached SDK data on the device. There is no separate “logout” API: if you need a traditional sign-out (clear local Braze state so the prior user’s cached profile, messages, and tokens are gone on this install), you typically use **`wipeData()`**. This is a full local reset.

```typescript
Braze.wipeData();
Braze.disableSDK();
Braze.enableSDK();
```

**`wipeData()`** — Clears Braze’s **local** data for this install (cached user/session/card state, push token association, etc.). Use for **sign-out–style** behavior when you must not leave the previous user’s Braze state on device, plus **“delete my data on this device”**, **QA** resets without reinstalling, or strict **privacy** flows. **`changeUser`** alone does not perform that cleanup—it only sets which user ID receives **new** events. On **iOS**, behavior may differ from Android (e.g. interaction with SDK disabled state); see Braze’s native docs if you ship this in production.

**`disableSDK()`** — Stops the SDK from operating (no collection/forwarding as configured). Use for **user opt-out** toggles, **restricted modes** (compliance, kids’ settings), or **debugging** without removing the dependency.

**`enableSDK()`** — Turns the SDK back on after **`disableSDK()`**. On **iOS**, re-enabling may **not** apply until the **next app launch**; verify in Braze Swift/iOS documentation before relying on immediate re-enable.

---

## Events

Subscribe with `Braze.addListener(event, callback)`. The call returns a subscription object; call **`.remove()`** on it to stop listening.

**Setting up a listener:**

```typescript
import Braze from "@braze/react-native-sdk";

const subscription = Braze.addListener(
  Braze.Events.CONTENT_CARDS_UPDATED,
  (update) => {
    console.log("Content cards:", update.cards);
  }
);
```

**Removing the listener:**

```typescript
subscription.remove();
```

In a React component, store the subscription and call `.remove()` in your cleanup (e.g. the return of a `useEffect`):

```typescript
useEffect(() => {
  const sub = Braze.addListener(Braze.Events.CONTENT_CARDS_UPDATED, (update) => {
    setCards(update.cards);
  });
  return () => sub.remove();
}, []);
```

| Event constant | Payload (summary) |
|----------------|-------------------|
| `Braze.Events.CONTENT_CARDS_UPDATED` | Latest content cards |
| `Braze.Events.BANNER_CARDS_UPDATED` | Latest banners |
| `Braze.Events.FEATURE_FLAGS_UPDATED` | Feature flag array |
| `Braze.Events.IN_APP_MESSAGE_RECEIVED` | In-app message event |
| `Braze.Events.SDK_AUTHENTICATION_ERROR` | SDK auth error details |
| `Braze.Events.PUSH_NOTIFICATION_EVENT` | Push payload (**Android only**) |

---

## Integration notes

- **Expo**: use the [Braze Expo plugin](https://github.com/braze-inc/braze-expo-plugin) to avoid manual native wiring where possible.
- **New Architecture / Turbo Modules**: supported on recent plugin versions; follow the developer guide and sample `AppDelegate` / Gradle settings if you migrate.
- **Privacy (iOS)**: methods such as `updateTrackingPropertyAllowList` support privacy manifest–related configuration; see [Swift privacy manifest](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/privacy_manifest/).
- **Jest**: mock `react-native` native modules or the Braze Turbo module (see `__tests__/jest.setup.js` in this repo for patterns).
---

## Version support

> [!NOTE]
> This SDK has been tested with React Native version **0.83.0**.

| Braze plugin | React Native | New Architecture |
|--------------|--------------|------------------|
| 9.0.0+       | ≥ 0.71       | Yes              |
| 6.0.0+       | ≥ 0.68       | Yes (≥ 0.70.0)   |
| 2.0.0+       | ≥ 0.68       | Yes              |
| ≤ 1.41.0     | ≤ 0.71       | No               |

Also respect native SDK requirements:

- [Android SDK version information](https://github.com/braze-inc/braze-android-sdk?tab=readme-ov-file#version-information)
- [Swift SDK version information](https://github.com/braze-inc/braze-swift-sdk?tab=readme-ov-file#version-information)

---

## Braze Expo plugin

For Expo-managed workflows, see the [Braze Expo plugin repository](https://github.com/braze-inc/braze-expo-plugin).

---

## Sample app

`BrazeProject` in this repository is a full sample (user management, content cards, feature flags, banners, etc.).

```shell
cd BrazeProject/
yarn install
npx react-native start
```

**iOS** (from `BrazeProject`):

```shell
cd ios && pod install && cd ..
npx react-native run-ios
```

Use `RCT_NEW_ARCH_ENABLED=0 pod install` if you need the legacy architecture.

**Android** (from `BrazeProject`):

```shell
npx react-native run-android
```

---

## Debugging and troubleshooting

Enable Braze logging in **native** configuration during development so the SDK writes to the system console (Xcode / Android Logcat). This helps verify initialization, user changes, and event delivery.

- **iOS** — In the `configure` closure passed to `BrazeReactInitializer.configure`, set `config.logger.level = .debug` (or `.info`). Reduce or disable in production so logs are not visible to users.
- **Android** — Use the `com_braze_logger_initial_log_level` resource in `braze.xml` or set the equivalent on `BrazeConfig.Builder` (see [BrazeConfigurationProvider](https://braze-inc.github.io/braze-android-sdk/kdoc/braze-android-sdk/com.braze.configuration/-braze-configuration-provider/logger-initial-log-level.html)). Use a non-verbose level or remove the override before release.

For deeper troubleshooting (network, session, or campaign behavior), see the [Braze React Native developer guide](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native) and the native SDK docs ([Swift](https://github.com/braze-inc/braze-swift-sdk) · [Android](https://github.com/braze-inc/braze-android-sdk)).

---

## Additional resources

- [Braze Developer Guide — React Native](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native)
- [Push notifications — React Native](https://www.braze.com/docs/developer_guide/platform_integration_guides/react_native/push_notifications/)
- [GitHub repository](https://github.com/braze-inc/braze-react-native-sdk)
- [npm package](https://www.npmjs.com/package/@braze/react-native-sdk)

## Contact

If you have questions, please contact [support@braze.com](mailto:support@braze.com).
