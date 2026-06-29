# Braze React Native Sample App (`BrazeProject`)

`BrazeProject` is a bare (non-Expo) React Native app that demonstrates how to
integrate the Braze React Native SDK and exercises all of its major surfaces.

For an **Expo-managed** sample, see the
[Braze Expo Plugin example](https://github.com/braze-inc/braze-expo-plugin/tree/main/example).

## Quickstart

From this directory (`public/BrazeProject`):

```bash
yarn install     # node deps (do NOT use npm here)
bundle install   # Ruby gems for CocoaPods (iOS only)

# iOS only — install pods (from ios/). RCT_NEW_ARCH_ENABLED=0 to test the old architecture.
cd ios && pod install && cd ..

yarn ios         # build + run on iOS
# or
yarn android     # build + run on Android
```

If Metro isn't already running, `yarn start` launches it (with a clean cache).
This app runs Metro on **port 8082** (set via `RCT_METRO_PORT` in `.env`) to avoid
clashing with other RN apps on the default 8081.

## How Braze is initialized

The SDK is initialized in [`BrazeProject.tsx`](./BrazeProject.tsx) via
`Braze.initialize(defaultApiKey, defaultEndpoint)`, where the key/endpoint come
from [`constants/brazeConfig.ts`](./constants/brazeConfig.ts).

Native config is also required and is **not** driven by `brazeConfig.ts`:

| Platform | File | Notable settings |
|---|---|---|
| Android | [`android/app/src/main/res/values/braze.xml`](./android/app/src/main/res/values/braze.xml) | API key, server endpoint, FCM sender id, automatic push deep-link handling |
| iOS | [`ios/BrazeProject/Info.plist`](./ios/BrazeProject/Info.plist) | iOS-side Braze/push configuration |

## App structure

- [`App.tsx`](./App.tsx) → [`BrazeProject.tsx`](./BrazeProject.tsx) — root
  component, where `Braze.initialize` runs and where SDK event listeners
  are registered.
- [`screens/`](./screens) — one screen per SDK feature area:
  - `HomeScreen` — entry/navigation
  - `UserManagementScreen` — user IDs, aliases, custom attributes, subscriptions
  - `ContentCardsScreen` — content cards
  - `FeatureFlagsScreen` — feature flags
  - `BannersScreen` — banner placements (the app requests placements like
    `placement_1`, `placement_2`, `sdk-test-2` on launch)
- [`components/`](./components) — shared UI (`Button`, `Card`, `Input`, `Toast`,
  `ScreenLayout`, …) so screens stay focused on SDK calls.

## Android deep link sample (`DeepLinkLabelActivity`)

The app includes a **deep-link-only** native activity for **manual deep link
testing**. It does not appear in the launcher; it opens only when a matching URL
is dispatched to the app (via `adb`, a push payload, or another app).

The URL must match the `<intent-filter>` on `DeepLinkLabelActivity` in
[`android/app/src/main/AndroidManifest.xml`](./android/app/src/main/AndroidManifest.xml):

```
helloreact://example.com/path?label=<any-string>
```

The activity shows a title ("Deep link inspector") and a pretty-printed JSON dump
of the incoming intent (action, data, flags, categories, `queryParameters`, and
`extras` via `Bundle.getString` — assumes string extras). Short JSON is centered
vertically under the title; long output scrolls.

- `helloreact://example.com/path?label=9201u3` → JSON reflects that URI and query
- `helloreact://example.com/path/foo?label=hello` → matches `pathPrefix` `/path`

Test with `adb` (package **`com.brazeproject`**):

```bash
adb shell am start -a android.intent.action.VIEW \
  -d 'helloreact://example.com/path?label=your_test_value' com.brazeproject
```

## Scripts

Run from this directory:

| Script | Description |
|---|---|
| `yarn android` | Builds and runs the Android app |
| `yarn ios` | Builds and runs the iOS app |
| `yarn start` | Launches the Metro bundler with a clean cache |
| `yarn test` | Runs the Jest unit test suite |
| `yarn lint` | Lints the sample project with ESLint |
| `yarn set-rn-version` | Sets the target React Native version for `rnx-align-deps` |
| `yarn fix-dependencies` | Uses `rnx-align-deps` to align deps to the target RN version |
