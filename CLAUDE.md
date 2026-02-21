# CLAUDE.md

This file provides guidance to Claude and other AI assistants when working with code in or consuming the Braze React Native SDK (`@braze/react-native-sdk`).

## Project Overview

This is the official Braze SDK for React Native — a bridge that wraps the native Braze SDKs for iOS (BrazeKit/Swift, v14.0.1) and Android (Braze Android SDK, v41.0.0) into a unified JavaScript/TypeScript API. The package exposes a single static `Braze` class with methods for user management, analytics, push notifications, in-app messaging, content cards, banners, feature flags, and location services. Current version: **19.0.0**.

## Development Commands

```bash
npm test          # Run Jest tests with coverage
npm run lint      # Run ESLint across source files
npm run lint-fix  # Auto-fix ESLint issues
```

The sample app lives in `BrazeProject/`. To run it:

```bash
cd BrazeProject && yarn install
npx react-native start                           # Start Metro bundler
npx react-native run-ios                          # Run on iOS
npx react-native run-android                      # Run on Android
cd ios && pod install                             # Install iOS native deps
cd ios && RCT_NEW_ARCH_ENABLED=0 pod install      # Legacy architecture
```

## Architecture

The SDK follows React Native's native module bridge pattern across three layers:

**JavaScript layer** — `src/braze.js` exports a static `Braze` class where every method delegates to the native bridge. The bridge reference comes from `src/specs/NativeBrazeReactModule.ts`, which is a TurboModule spec that calls `TurboModuleRegistry.getEnforcing<Spec>('BrazeReactBridge')`. Event delivery is platform-specific: iOS uses `NativeEventEmitter` wrapping the native `RCTEventEmitter`, while Android uses `DeviceEventEmitter`.

**Model layer** — `src/models/` contains JavaScript classes that wrap raw native data into typed objects. `InAppMessage` parses a JSON string into properties like `message`, `header`, `buttons`, and `extras`. `FeatureFlag` and `Banner` both delegate to a shared `CampaignProperties` class that provides typed property getters (`getBooleanProperty`, `getStringProperty`, etc.). Enums for events, genders, subscription types, content card types, message types, and click actions live in `src/models/enums.js`.

**Native layer** — iOS uses an Objective-C++ `BrazeReactBridge` class (extending `RCTEventEmitter`) in `iOS/BrazeReactBridge/`. Android uses a Kotlin `BrazeReactBridgeImpl` in `android/src/main/java/com/braze/reactbridge/`, with separate source sets under `oldarch/` and `newarch/` that delegate to the shared implementation. The `BrazeReactBridgePackage` registers both the module and the `BrazeBannerManager` view manager.

**UI components** — `BrazeBannerView` is a React component in `src/ui/braze-banner-view.js` that wraps a native banner view. It auto-selects between Fabric (`BrazeBannerViewNativeComponent`) and legacy (`requireNativeComponent`) based on whether the new architecture is enabled.

### Key Files

| Path | Purpose |
|------|---------|
| `src/index.js` | Entry point, re-exports `Braze` class |
| `src/index.d.ts` | Full TypeScript declarations (public API surface) |
| `src/braze.js` | All SDK methods — the main file you'll work with |
| `src/helpers.js` | `callFunctionWithCallback` (default callback pattern) and `parseNestedProperties` (Date → UNIX timestamp conversion) |
| `src/specs/NativeBrazeReactModule.ts` | TurboModule interface spec — defines the JS↔native contract |
| `braze-react-native-sdk.podspec` | iOS CocoaPods spec (BrazeKit, BrazeLocation, BrazeUI deps) |
| `android/build.gradle` | Android build configuration |
| `BrazeProject/BrazeProject.tsx` | Sample app demonstrating every SDK feature |
| `BrazeProject/ios/AppDelegate.swift` | Reference iOS initialization |
| `BrazeProject/android/app/src/main/java/com/brazeproject/MainApplication.kt` | Reference Android initialization |

### Callback Pattern

Many methods use `callFunctionWithCallback`, a helper that appends a callback to the arguments array before calling the bridge method. If no user callback is provided, it falls back to a default `brazeCallback` that logs errors and falsy results. This is why some methods accept an optional trailing `callback` parameter.

### Nested Property Handling

When logging events or purchases with properties, `parseNestedProperties` recursively walks the property object and converts any `Date` instances into `{ type: 'UNIX_timestamp', value: dateValue }` objects. This happens automatically — callers just pass native Date objects and the SDK handles the conversion.

## Things That Will Bite You

- **The SDK is initialized in native code, not JavaScript.** There is no `Braze.initialize()` call. iOS uses `BrazeReactBridge.initBraze(configuration)` in AppDelegate.swift, and Android uses `braze.xml` configuration plus `BrazeActivityLifecycleCallbackListener` registration. If the native setup is missing, all JS method calls will silently fail or crash.

- **Cold-start deep links from push notifications are a known race condition.** React Native's `Linking.getInitialURL()` can miss URLs from push notification launches. The workaround is `Braze.getInitialPushPayload()`, but it requires native-side setup: calling `BrazeReactUtils.sharedInstance().populateInitialPayload(fromLaunchOptions:)` on iOS and `BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)` on Android. Without those native calls, the payload will always be null.

- **The `pushNotificationEvent` listener only works on Android.** iOS push handling must be done natively in AppDelegate.

- **`setCustomUserAttribute` has hidden overload behavior.** The third parameter can be either a boolean (merge flag for object attributes) or a callback function. The method inspects `typeof thirdParam` to determine which. If you pass `true` as the third arg, it merges object values instead of replacing them.

- **Feature flag static methods are deprecated.** Methods like `Braze.getFeatureFlagBooleanProperty(id, key)` still work but are deprecated. The correct pattern is to get the `FeatureFlag` instance via `Braze.getFeatureFlag(id)` and then call instance methods like `flag.getBooleanProperty(key)`.

- **`logPurchase` takes price as a string, not a number.** The price parameter is a string (e.g., `"9.99"`) which gets rounded to two decimal places via `toFixed(2)`.

- **On Android, `Braze.addListener()` calls `this.bridge.addListener(event)` on the native side** to register the event listener. On iOS, this native call is skipped since `NativeEventEmitter` handles it automatically. This platform-specific branching happens in the `addListener` method.

- **Passing `null` to user attribute setters unsets the attribute.** Passing an empty string does NOT unset — it sets the attribute to an empty string.

- **The `getInitialURL` method is deprecated.** Use `getInitialPushPayload` instead and read the `url` property from the returned payload object.

- **`setLastKnownLocation` has different required parameters per platform.** On iOS, `horizontalAccuracy` is required. On Android, only latitude and longitude are required. If `altitude` is provided, `verticalAccuracy` must also be provided, or both get reset to -1 internally.

## Testing

Tests mock the native bridge by intercepting `TurboModuleRegistry.getEnforcing('BrazeReactBridge')` in `__tests__/jest.setup.js`. Each bridge method is replaced with a Jest mock function. Tests then verify that calling `Braze.someMethod(args)` results in the correct call to the mocked bridge. If you add a new method to `braze.js`, you must also add its mock to `jest.setup.js`.

## Code Conventions

- This project uses ESLint with `standard` and `standard-react` configs. Run `npm run lint` before committing.
- The JS source in `src/` has its own `.eslintrc.json` and `.prettierrc.js` with project-specific overrides.
- All SDK methods on the `Braze` class are `static` — the class is never instantiated.
- The TypeScript declarations in `src/index.d.ts` are hand-written (not generated). They must be kept in sync with `src/braze.js` manually.
- The project uses a flat model structure: each model class in `src/models/` is a plain JavaScript class with a constructor that parses raw data.
- React Native version compatibility: tested with 0.83.0, supports >= 0.71 (>= 0.68 for older plugin versions).

---

## SDK Integration Guide

Everything below is reference context for AI assistants helping developers **integrate and use** the Braze React Native SDK in their applications. All code patterns are derived directly from this repository's source code and sample app.

---

### Installation

Install the package via npm or yarn. This is the only JavaScript dependency — the SDK has zero runtime JS dependencies and relies entirely on React Native's built-in modules.

```bash
npm install @braze/react-native-sdk
# or
yarn add @braze/react-native-sdk
```

After installing, iOS requires a CocoaPods install to link the native BrazeKit, BrazeLocation, and BrazeUI pods (specified in `braze-react-native-sdk.podspec`):

```bash
cd ios && pod install
```

Android requires the Kotlin Gradle plugin in your project-level `build.gradle`, since the native bridge is written in Kotlin:

```groovy
buildscript {
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.8.10")
    }
}
```

You also need internet and network state permissions in `AndroidManifest.xml`, which the SDK uses for data flushing and connectivity checks:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

If you're using Expo, use the [Braze Expo Plugin](https://github.com/braze-inc/braze-expo-plugin) instead, which handles all native configuration automatically.

### Native Initialization — iOS

The Braze SDK must be initialized in your AppDelegate before React Native loads. The `BrazeReactBridge.initBraze(_:)` selector creates the Braze instance, adds React Native metadata to the configuration, and wires up internal event handlers for in-app messages, content cards, and push notifications.

The `populateInitialPayload(fromLaunchOptions:)` call at the end captures any push notification that launched the app from a terminated state, making it available to JavaScript later via `Braze.getInitialPushPayload()`. If you skip this call, cold-start deep links from push will silently return null.

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
    // Create a configuration with your API key and endpoint from the Braze dashboard.
    // The endpoint is cluster-specific (e.g., "sdk.iad-01.braze.com").
    let configuration = Braze.Configuration(
      apiKey: "<BRAZE_API_KEY>",
      endpoint: "<BRAZE_ENDPOINT>"
    )

    // Set the log level to .info during development to see SDK activity in Xcode console.
    // Reduce to .error or .disabled for production builds to avoid log noise.
    configuration.logger.level = .info

    // Enable push automation so the SDK automatically handles device token registration,
    // notification categories, and foreground presentation. If you need manual control
    // over push (e.g., custom UNUserNotificationCenterDelegate logic), set this to false
    // and implement the delegate methods yourself — see the sample app for examples.
    configuration.push.automation = true

    // Initialize the SDK via the React Native bridge. This method returns an unretained
    // Braze instance that you should store as a static property for later access.
    let braze = BrazeReactBridge.perform(
      #selector(BrazeReactBridge.initBraze(_:)),
      with: configuration
    ).takeUnretainedValue() as! Braze
    AppDelegate.braze = braze

    // Capture the push payload from the launch options so that getInitialPushPayload()
    // can return it in JavaScript. Without this, cold-start deep links are lost.
    if let launchOptions {
      BrazeReactUtils.sharedInstance().populateInitialPayload(
        fromLaunchOptions: launchOptions
      )
    }

    return true
  }
}
```

If you disable push automation, you need to manually register for remote notifications and implement `UNUserNotificationCenterDelegate`. The sample app at `BrazeProject/ios/AppDelegate.swift` shows the full manual push setup, including `didRegisterForRemoteNotificationsWithDeviceToken`, `didReceive`, and `willPresent` handlers that forward to `braze.notifications`.

For deep link handling, implement `BrazeDelegate` and forward URLs through `RCTLinkingManager` so they reach React Native's `Linking` API. The `braze(_:shouldOpenURL:)` delegate method lets you intercept URLs before Braze opens them — return `false` to handle them yourself (e.g., for Universal Links).

### Native Initialization — Android

Android initialization happens through XML configuration and lifecycle callbacks, not programmatic setup. The Braze Android SDK reads your API key and endpoint from a resource file and auto-initializes when the application starts.

Create `res/values/braze.xml` with your credentials. These are read by the Braze Android SDK's auto-initialization system:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string translatable="false" name="com_braze_api_key">YOUR_APP_IDENTIFIER_API_KEY</string>
  <string translatable="false" name="com_braze_custom_endpoint">YOUR_CUSTOM_ENDPOINT</string>
</resources>
```

In your `MainApplication.kt`, register `BrazeActivityLifecycleCallbackListener` in `onCreate()`. This listener automatically manages sessions — it starts a session when an activity resumes and ends it when the app backgrounds. Without it, Braze won't track sessions or deliver in-app messages:

```kotlin
import com.braze.BrazeActivityLifecycleCallbackListener

class MainApplication : Application(), ReactApplication {
    override fun onCreate() {
        super.onCreate()
        registerActivityLifecycleCallbacks(BrazeActivityLifecycleCallbackListener())
    }
}
```

In your `MainActivity.kt`, call `BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)` in `onCreate()`. This captures the push notification intent that launched the activity from a terminated state, making it available to JavaScript via `Braze.getInitialPushPayload()`. This call must happen before React Native initializes:

```kotlin
import com.braze.reactbridge.BrazeReactUtils

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)
    }
}
```

### Importing and Using the SDK

The SDK exports a single default — the `Braze` static class. All methods are static, so you never instantiate it. The class also exposes model classes and enum objects as static properties:

```typescript
import Braze from "@braze/react-native-sdk";

// All methods are static
Braze.changeUser("user-123");

// Model classes are accessed as static properties
const inAppMessage = new Braze.BrazeInAppMessage(jsonString);

// Enums are accessed as static properties
const gender = Braze.Genders.FEMALE;
const event = Braze.Events.CONTENT_CARDS_UPDATED;
```

### User Identity

Call `changeUser()` after the user logs in. This is the most important call in the SDK — it associates all subsequent events, attributes, and messages with this user ID. If the same user ID is identified on another device, their profile and history merge.

Calling `changeUser()` with a different user ID ends the current session and starts a new one. Do **not** call it on logout — that creates orphaned anonymous user data. Instead, either keep the current user ID or switch to a known "logged out" user ID.

```typescript
// Basic identification — call this after authentication succeeds
Braze.changeUser("user-123");

// With SDK Authentication — pass a JWT signature as the second argument.
// This signature is verified server-side to prevent user impersonation.
// Only needed if SDK Authentication is enabled in your Braze dashboard.
Braze.changeUser("user-123", "jwt-signature");

// Retrieve the current user's ID. Returns null for anonymous users.
Braze.getUserId((err, userId) => {
  if (userId) {
    console.log("Current user:", userId);
  }
});

// Update the authentication signature without changing the user.
// Useful when your JWT token refreshes.
Braze.setSdkAuthenticationSignature("refreshed-jwt-signature");

// Add an alias — an alternate identifier for the user.
// Useful for linking third-party analytics IDs to Braze user profiles.
// Each alias has a name and a label; users can have one name per label.
Braze.addAlias("amplitude-id-456", "amplitude_id");
```

### User Profile Attributes

These methods set standard Braze profile fields. Every setter accepts `null` to remove the attribute from the profile. String attributes are limited to 255 characters.

```typescript
Braze.setFirstName("Jane");
Braze.setLastName("Doe");
Braze.setEmail("jane@example.com");       // Must pass RFC-5322 validation
Braze.setPhoneNumber("+15551234567");      // Numbers, whitespace, +.-() only
Braze.setDateOfBirth(1990, 6, 15);         // Year, month (1-12), day
Braze.setCountry("US");
Braze.setHomeCity("New York");
Braze.setLanguage("en");                   // ISO 639-1 code

// Gender uses the Braze.Genders enum. Passing null unsets it.
Braze.setGender(Braze.Genders.FEMALE);

// To unset any attribute, pass null — NOT an empty string.
// An empty string sets the attribute to "", which is different from removing it.
Braze.setFirstName(null);
Braze.setEmail(null);
```

### Custom User Attributes

Custom attributes let you store arbitrary data on user profiles for segmentation and personalization. Keys are limited to 255 characters and cannot start with `$`. The method auto-detects the value type and routes to the appropriate native bridge call internally:

```typescript
// String, number, and boolean values are straightforward
Braze.setCustomUserAttribute("favorite_color", "blue");
Braze.setCustomUserAttribute("age", 28);
Braze.setCustomUserAttribute("is_premium", true);

// Date objects are automatically converted to UNIX timestamps
Braze.setCustomUserAttribute("last_login", new Date());

// String arrays — all elements must be strings
Braze.setCustomUserAttribute("interests", ["sports", "music"]);

// Object (nested custom attribute) — stored as a structured object on the profile
Braze.setCustomUserAttribute("address", { street: "123 Main St", city: "NYC" });

// Object with merge=true as third argument — only updates the specified keys,
// preserving other existing keys. Without merge, the entire object is replaced.
Braze.setCustomUserAttribute("address", { city: "Boston" }, true);

// Object arrays — all elements must be objects
Braze.setCustomUserAttribute("orders", [
  { id: "order-1", total: 42.00 },
  { id: "order-2", total: 18.50 }
]);

// Pass null to remove the attribute entirely
Braze.setCustomUserAttribute("old_attribute", null);

// Increment a numeric attribute. Use negative values to decrement.
// If the attribute doesn't exist yet, it's created with the increment value.
Braze.incrementCustomUserAttribute("login_count", 1);
Braze.incrementCustomUserAttribute("credits", -5);

// Array manipulation — add or remove individual strings from a string array attribute
Braze.addToCustomUserAttributeArray("favorites", "new-item");
Braze.removeFromCustomUserAttributeArray("favorites", "old-item");

// Completely remove a custom attribute from the profile
Braze.unsetCustomUserAttribute("deprecated_field");
```

### Custom Events

Events are the primary way to track user behavior for segmentation and campaign triggering. Event names are limited to 255 characters and cannot start with `$`. Best practice is to use generic, segmentable names (e.g., `product_viewed`) rather than hyper-specific ones (e.g., `viewed_blue_widget_size_large`).

Property values can be strings, numbers, booleans, Date objects, nested objects, or arrays. The SDK's `parseNestedProperties` helper automatically converts any `Date` objects in the property tree to UNIX timestamps before sending to native:

```typescript
// Simple event with no properties
Braze.logCustomEvent("video_watched");

// Event with flat properties
Braze.logCustomEvent("product_viewed", {
  product_id: "sku-123",
  category: "electronics",
  price: 299.99,
  on_sale: true
});

// Event with nested properties and dates — dates are auto-converted
Braze.logCustomEvent("checkout_completed", {
  items: [
    { name: "Widget", quantity: 2 },
    { name: "Gadget", quantity: 1 }
  ],
  total: 44.97,
  completed_at: new Date(),
  shipping: { method: "express", estimated_days: 2 }
});
```

### Purchase Tracking

Purchases are tracked separately from custom events because Braze uses them for revenue analytics and Lifetime Value (LTV) calculations. Note that `price` is a **string**, not a number — it gets rounded to two decimal places internally via `toFixed(2)`. The currency code must be a valid ISO 4217 code (e.g., `"USD"`, `"EUR"`, `"JPY"`):

```typescript
Braze.logPurchase("premium_subscription", "9.99", "USD", 1);

// With purchase properties — same constraints as event properties
Braze.logPurchase("product-sku-456", "29.99", "USD", 2, {
  coupon_code: "SAVE20",
  category: "apparel"
});
```

### Push Notifications

Push setup requires both native and JavaScript work. The native layer handles token registration and notification display; the JavaScript layer handles permission requests and payload processing.

`requestPushPermission()` triggers the OS permission dialog. On iOS, the `provisional` option enables "quiet" authorization where notifications go directly to the notification center without interrupting the user — useful for onboarding flows. On Android 12 and below, this is a no-op since push is enabled by default; on Android 13+, it triggers the runtime permission dialog:

```typescript
Braze.requestPushPermission({
  alert: true,
  badge: true,
  sound: true,
  provisional: false
});
```

To handle cold-start push payloads (when the app was terminated and launched by a push tap), use `getInitialPushPayload()`. This returns the full push payload including the deep link URL, title, body, and any custom key-value pairs. This solves a known React Native race condition where `Linking.getInitialURL()` returns null because React hasn't loaded its JavaScript by the time the native layer processes the URL:

```typescript
useEffect(() => {
  Braze.getInitialPushPayload((pushPayload) => {
    if (pushPayload) {
      console.log("Launched from push:", pushPayload.title);
      if (pushPayload.url) {
        // Navigate to the deep link destination
      }
    }
  });
}, []);
```

On Android, you can also listen for push events in real-time. This listener fires for all push events (received, opened, dismissed) while the app is running. It does not fire on iOS — iOS push handling is done entirely in the native AppDelegate:

```typescript
const pushSub = Braze.addListener(
  Braze.Events.PUSH_NOTIFICATION_EVENT,
  (event) => {
    console.log("Push type:", event.payload_type);
    console.log("Title:", event.title);
    console.log("URL:", event.url);
    console.log("Silent:", event.is_silent);
  }
);
```

### In-App Messages

In-app messages (IAMs) are messages displayed to the user while they're using the app. The SDK supports four types: `slideup` (banner at top/bottom), `modal` (centered overlay), `full` (full-screen), and `html_full` (full-screen custom HTML).

`subscribeToInAppMessage()` registers a listener and optionally enables Braze's default UI. The first parameter controls whether Braze renders the message itself. When `true`, the SDK displays the message using native UI components and you can still listen to the event for logging or analytics. When `false`, you receive the message data but must render it yourself:

```typescript
// Recommended: let Braze handle display, and listen for analytics/logging
const iamSubscription = Braze.subscribeToInAppMessage(true, (event) => {
  const iam = event.inAppMessage;
  console.log("Received IAM:", iam.messageType, iam.message);

  // Optionally log additional analytics
  Braze.logInAppMessageImpression(iam);

  // If the message has buttons, you can programmatically interact with them
  if (iam.buttons.length > 0) {
    console.log("Button 0 text:", iam.buttons[0].text);
  }
});
```

You can also use `addListener` to listen for IAMs without controlling the Braze UI subscription:

```typescript
const iamListener = Braze.addListener(
  Braze.Events.IN_APP_MESSAGE_RECEIVED,
  (event) => {
    console.log("IAM header:", event.inAppMessage.header);
  }
);
```

For programmatic interaction — useful when building custom IAM UIs or automating interactions in test flows:

```typescript
// Log that the user saw the message
Braze.logInAppMessageImpression(inAppMessage);

// Log that the user tapped the message body
Braze.logInAppMessageClicked(inAppMessage);

// Log that the user tapped a specific button (by button ID)
Braze.logInAppMessageButtonClicked(inAppMessage, 0);

// Execute the action associated with a button (e.g., open a URL)
Braze.performInAppMessageButtonAction(inAppMessage, 0);

// Dismiss the currently displayed message
Braze.hideCurrentInAppMessage();
```

### Content Cards

Content Cards are persistent content items that live in a feed, similar to a notification inbox. Unlike in-app messages (which are ephemeral), content cards persist until they expire or are dismissed. They come in three types: `Classic` (title + description + optional image), `ImageOnly` (image with aspect ratio), and `Captioned` (image + title + description).

To show the built-in content cards UI provided by the native Braze SDK:

```typescript
// Launch the default content cards feed. On iOS, passing true auto-dismisses
// the feed when the user taps a card with a deep link scheme URL.
Braze.launchContentCards(true);
```

For custom UIs, fetch the cards programmatically. `getContentCards()` makes a network request and returns fresh data; `getCachedContentCards()` returns the local cache without a network call:

```typescript
const cards = await Braze.getContentCards();
const cachedCards = await Braze.getCachedContentCards();

// Each card has a type, id, and type-specific properties
for (const card of cards) {
  if (card.type === "Classic") {
    console.log(card.title, card.cardDescription);
  } else if (card.type === "Captioned") {
    console.log(card.title, card.image, card.imageAspectRatio);
  } else if (card.type === "ImageOnly") {
    console.log(card.image, card.imageAspectRatio);
  }

  // All cards share common fields from ContentCardBase
  console.log("Pinned:", card.pinned, "URL:", card.url);

  // Control cards should not be displayed — they're used for A/B testing
  if (card.isControl) continue;
}
```

When building a custom UI, you must manually log analytics. The SDK does not auto-track impressions or clicks when you retrieve cards programmatically:

```typescript
// Log when the card becomes visible to the user
Braze.logContentCardImpression(card.id);

// Log when the user taps the card
Braze.logContentCardClicked(card.id);

// Log when the user dismisses/swipes away the card
Braze.logContentCardDismissed(card.id);

// Execute the card's click action (opens URL, deep link, etc.)
Braze.processContentCardClickAction(card.id);
```

To refresh cards from the server without reading the result:

```typescript
Braze.requestContentCardsRefresh();
```

Listen for real-time updates when cards change:

```typescript
const ccSub = Braze.addListener(
  Braze.Events.CONTENT_CARDS_UPDATED,
  (event) => {
    console.log(`${event.cards.length} content cards available`);
  }
);
```

### Banners

Banners are HTML-based content rendered in a native view, positioned at specific placements in your app. They differ from content cards in that they're tied to named placements rather than a feed.

The simplest integration uses the `BrazeBannerView` component with just a `placementID`. The component auto-sizes its height to match the banner content. If no banner is available for the placement, it renders with zero height:

```tsx
<Braze.BrazeBannerView placementID="homepage-banner" />
```

For explicit height control (e.g., to animate height changes or reserve layout space), use the `onHeightChanged` callback and set the height via style:

```tsx
const [bannerHeight, setBannerHeight] = useState(0);

<Braze.BrazeBannerView
  placementID="homepage-banner"
  style={{ width: "100%", height: bannerHeight }}
  onHeightChanged={(height) => setBannerHeight(height)}
/>
```

Banners must be refreshed from the server before they're available. Call this early in your app lifecycle (e.g., in root component `useEffect`) with all placement IDs your app uses:

```typescript
Braze.requestBannersRefresh(["homepage-banner", "profile-banner"]);
```

For programmatic access to banner data (e.g., to check properties or render custom UI), use `getBanner()`. It returns the cached banner for a placement or null if none is available:

```typescript
const banner = await Braze.getBanner("homepage-banner");
if (banner) {
  console.log("HTML content:", banner.html);
  console.log("Is control group:", banner.isControl);

  // Typed property getters — same interface as FeatureFlag
  const subtitle = banner.getStringProperty("subtitle");
  const showCta = banner.getBooleanProperty("show_cta");
}
```

When using banners programmatically (without `BrazeBannerView`), you must manually log impressions and clicks:

```typescript
Braze.logBannerImpression("homepage-banner");
Braze.logBannerClick("homepage-banner", null);           // General click
Braze.logBannerClick("homepage-banner", "cta-button");   // Specific button
```

### Feature Flags

Feature flags let you remotely toggle functionality and configure feature variants without app updates. Each flag has an `id`, an `enabled` boolean, and a map of typed properties.

Refresh flags from the server to get the latest values. This is typically done on app launch or when the user logs in:

```typescript
Braze.refreshFeatureFlags();
```

Retrieve and evaluate flags. `getFeatureFlag()` returns a `FeatureFlag` instance with typed property getters. If no flag exists with the given ID, it returns null. The property getters return null if the key doesn't exist or the type doesn't match:

```typescript
const flag = await Braze.getFeatureFlag("new-checkout-flow");

if (flag?.enabled) {
  // Access typed properties — each getter returns null if the key is missing
  // or if the stored value doesn't match the requested type
  const variant = flag.getStringProperty("variant");       // string | null
  const maxItems = flag.getNumberProperty("max_items");     // number | null
  const showBadge = flag.getBooleanProperty("show_badge");  // boolean | null
  const config = flag.getJSONProperty("layout_config");     // object | null
  const heroImg = flag.getImageProperty("hero_image");      // string (URL) | null
  const launchDate = flag.getTimestampProperty("launch_at"); // number (UNIX) | null
}

// Get all flags at once — useful for debugging or rendering a flags dashboard
const allFlags = await Braze.getAllFeatureFlags();
```

Log an impression when the user sees a feature controlled by a flag. This feeds into Braze analytics for measuring flag impact:

```typescript
Braze.logFeatureFlagImpression("new-checkout-flow");
```

Listen for flag updates to react in real time (e.g., if a flag is toggled while the user is in the app):

```typescript
const ffSub = Braze.addListener(
  Braze.Events.FEATURE_FLAGS_UPDATED,
  (flags) => {
    // flags is the full array of all FeatureFlag objects
    const checkoutFlag = flags.find(f => f.id === "new-checkout-flow");
    if (checkoutFlag?.enabled) {
      // Update UI accordingly
    }
  }
);
```

### Subscription Management

Braze tracks two subscription states per user: push notification subscription and email subscription. Each can be `OPTED_IN` (explicitly opted in), `SUBSCRIBED` (default — subscribed but not explicitly opted in), or `UNSUBSCRIBED` (opted out).

Subscription groups are defined in the Braze dashboard and identified by UUID. They let you manage granular opt-in/opt-out for different message types (e.g., marketing vs. transactional emails):

```typescript
// Set push and email subscription states
Braze.setPushNotificationSubscriptionType(
  Braze.NotificationSubscriptionTypes.OPTED_IN
);
Braze.setEmailNotificationSubscriptionType(
  Braze.NotificationSubscriptionTypes.SUBSCRIBED
);

// Add/remove from subscription groups (UUID from Braze dashboard)
Braze.addToSubscriptionGroup("group-uuid-123");
Braze.removeFromSubscriptionGroup("group-uuid-123");
```

### Location Services

Location features are primarily Android-focused. `requestLocationInitialization()` initializes Braze's location module on Android after the user grants location permissions — calling it on iOS is a no-op. `requestGeofences()` manually triggers a geofence update for a specific coordinate (requires automatic geofence requests to be disabled in your Braze dashboard):

```typescript
// Android only — call after the user grants location permissions
Braze.requestLocationInitialization();

// Android only — manual geofence request for a specific coordinate
Braze.requestGeofences(40.7128, -74.006);

// Cross-platform — set the user's last known location.
// On iOS, horizontalAccuracy is required; on Android, only lat/lng are required.
Braze.setLastKnownLocation(40.7128, -74.006, null, 25.0, null);

// Set a named location as a custom attribute on the user profile
Braze.setLocationCustomAttribute("office", 40.7128, -74.006);
```

### Ad Tracking & Privacy

These methods let you pass advertising identifiers to Braze and manage iOS Privacy Manifest tracking declarations. IDFA and IDFV methods are iOS-only no-ops on Android:

```typescript
// Pass ad tracking status and Google Advertising ID (Android)
Braze.setAdTrackingEnabled(true, "google-advertising-id");

// Pass IDFA after the user grants ATT permission (iOS only)
Braze.setIdentifierForAdvertiser("idfa-string");

// Pass IDFV (iOS only)
Braze.setIdentifierForVendor("idfv-string");

// iOS Privacy Manifest — declare which user data types are tracked.
// This routes specified data collection through a separate tracking endpoint.
// No-op on Android.
Braze.updateTrackingPropertyAllowList({
  adding: [Braze.TrackingProperty.FIRST_NAME, Braze.TrackingProperty.EMAIL],
  removing: [Braze.TrackingProperty.DEVICE_DATA],
  addingCustomEvents: ["purchase_completed"],
  removingCustomAttributes: ["deprecated_attr"]
});
```

### SDK Controls

These are system-level controls for data management and SDK lifecycle. Use `requestImmediateDataFlush()` sparingly — the SDK batches data automatically and flushes on a regular interval. Forcing a flush is useful when you need data to appear in the dashboard immediately (e.g., right after `changeUser`):

```typescript
// Force queued data to flush to Braze servers immediately
Braze.requestImmediateDataFlush();

// Wipe ALL local Braze data and disable the SDK.
// The SDK will not function until enableSDK() is called.
// Use this for GDPR "right to be forgotten" requests.
Braze.wipeData();

// Disable the SDK — stops all tracking, messaging, and data collection
Braze.disableSDK();

// Re-enable after a previous disable
Braze.enableSDK();

// Get the device ID — useful for debugging and support tickets.
// On Android: a random app-specific ID. On iOS: derived from IDFV.
Braze.getDeviceId((err, deviceId) => {
  console.log("Device ID:", deviceId);
});

// Set attribution data from a third-party attribution provider
Braze.setAttributionData("network", "campaign", "ad_group", "creative");
```

### Event Listener Cleanup Pattern

All `addListener` and `subscribeToInAppMessage` calls return an `EmitterSubscription` object with a `.remove()` method. You must call `.remove()` when the component unmounts to prevent memory leaks and duplicate event handling. The standard pattern is to set up all listeners in a single `useEffect` and clean them all up in the return function:

```typescript
useEffect(() => {
  const iamSub = Braze.subscribeToInAppMessage(true, handleIAM);
  const ccSub = Braze.addListener(Braze.Events.CONTENT_CARDS_UPDATED, handleCards);
  const ffSub = Braze.addListener(Braze.Events.FEATURE_FLAGS_UPDATED, handleFlags);
  const authSub = Braze.addListener(Braze.Events.SDK_AUTHENTICATION_ERROR, handleAuthError);
  const pushSub = Braze.addListener(Braze.Events.PUSH_NOTIFICATION_EVENT, handlePush);
  const bannerSub = Braze.addListener(Braze.Events.BANNER_CARDS_UPDATED, handleBanners);

  // Pre-fetch data
  Braze.requestBannersRefresh(["placement-1", "placement-2"]);

  return () => {
    iamSub?.remove();
    ccSub.remove();
    ffSub.remove();
    authSub.remove();
    pushSub.remove();
    bannerSub.remove();
  };
}, []);
```

### Enums Quick Reference

All enum objects are static properties of the `Braze` class:

| Enum | Values | Usage |
|------|--------|-------|
| `Braze.Genders` | `MALE` (`"m"`), `FEMALE` (`"f"`), `OTHER` (`"o"`), `NOT_APPLICABLE` (`"n"`), `PREFER_NOT_TO_SAY` (`"p"`), `UNKNOWN` (`"u"`) | `Braze.setGender(Braze.Genders.FEMALE)` |
| `Braze.NotificationSubscriptionTypes` | `OPTED_IN` (`"optedin"`), `SUBSCRIBED` (`"subscribed"`), `UNSUBSCRIBED` (`"unsubscribed"`) | `Braze.setPushNotificationSubscriptionType(...)` |
| `Braze.ContentCardTypes` | `CLASSIC` (`"Classic"`), `IMAGE_ONLY` (`"ImageOnly"`), `CAPTIONED` (`"Captioned"`) | Type-checking card objects |
| `Braze.MessageType` | `SLIDEUP`, `MODAL`, `FULL`, `HTML_FULL` | IAM type identification |
| `Braze.ClickAction` | `URI`, `NONE`, `NEWS_FEED` (no-op) | IAM click behavior |
| `Braze.DismissType` | `SWIPE`, `AUTO_DISMISS` | IAM close behavior |
| `Braze.Events` | `CONTENT_CARDS_UPDATED`, `BANNER_CARDS_UPDATED`, `IN_APP_MESSAGE_RECEIVED`, `FEATURE_FLAGS_UPDATED`, `SDK_AUTHENTICATION_ERROR`, `PUSH_NOTIFICATION_EVENT` | Event listener names |
| `Braze.TrackingProperty` | `EVERYTHING`, `FIRST_NAME`, `EMAIL`, `DEVICE_DATA`, etc. (18 values) | iOS Privacy Manifest tracking |

---

## AI-Assisted Development with Context7

Connect your IDE to the Braze Docs MCP server through [Context7](https://context7.com) to get accurate, up-to-date SDK guidance. Context7 gives your AI assistant access to the full Braze documentation library so it can generate correct code snippets and answer technical questions based on the latest SDK references.

### Setup

Add to your IDE's MCP configuration:

**Cursor** — Settings > Tools and Integrations > MCP Tools > Add Custom MCP:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

**Claude Desktop** — Settings > Developer > Edit Config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

**VS Code** — Add to `settings.json` or `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### Writing Prompts

Include `use context7` in prompts to pull in Braze documentation context:

```
Using the Braze React Native SDK, show me how to set up push notifications
on both iOS and Android, including the native code changes needed. Use context7.
```

### Plain Text Docs for LLMs

Braze provides AI-optimized documentation files following the [llms.txt standard](https://llmstxt.org/):

- **[llms.txt](https://www.braze.com/docs/llms.txt)** — Index of all Braze developer docs with titles and descriptions
- **[llms-full.txt](https://www.braze.com/docs/llms-full.txt)** — Complete Braze developer documentation in a single plain text file

Note: Context7 provides access to Braze **documentation**. The separate Braze MCP server provides read-only access to your Braze **workspace data** (campaigns, segments, analytics). You can use both together.

## External References

- [Braze React Native SDK GitHub](https://github.com/braze-inc/braze-react-native-sdk)
- [Braze Developer Guide — React Native](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=react%20native)
- [Braze Android SDK Requirements](https://github.com/braze-inc/braze-android-sdk?tab=readme-ov-file#version-information)
- [Braze Swift SDK Requirements](https://github.com/braze-inc/braze-swift-sdk?tab=readme-ov-file#version-information)
- [Braze Expo Plugin](https://github.com/braze-inc/braze-expo-plugin)
- [Braze REST API](https://www.braze.com/docs/api/basics/)
