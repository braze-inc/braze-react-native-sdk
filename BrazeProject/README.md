# Braze React Native Sample App
This sample app integrates the Braze SDK into a bare React Native setting for testing and validation purposes.

For an Expo-managed sample, refer to the sample app in the [Braze Expo Plugin](https://github.com/braze-inc/braze-expo-plugin/tree/main/example).

## Quickstart
To run the app, first run:

```bash
yarn install
```

Then, depending on your platform of choice, run either:

```bash
yarn ios
```

or

```bash
yarn android
```

## Android deep link sample (`DeepLinkLabelActivity`)

The sample app includes a **deep-link-only** native activity used for **manual deep link testing**. It does not appear in the launcher; it opens only when a matching URL is dispatched to the app (for example via `adb`, a push payload, or another app).

### Deep link pattern

The URL must match the `<intent-filter>` on `DeepLinkLabelActivity` in `android/app/src/main/AndroidManifest.xml`:

```
helloreact://example.com/path?label=<any-string>
```

### Examples

The activity shows a **title** (“Deep link inspector”) and a **pretty-printed JSON** dump of the incoming intent (action, data, flags, categories, `queryParameters`, and `extras` via `Bundle.getString`—assumes string extras). Short JSON is **centered vertically** under the title; long output scrolls.

- `helloreact://example.com/path?label=9201u3` → JSON reflects that URI and query
- `helloreact://example.com/path/foo?label=hello` → matches `pathPrefix` `/path`; JSON reflects the URI

### Test with `adb`

With the app installed on a connected device or emulator (`applicationId` / package **`com.brazeproject`**):

```bash
adb shell am start -a android.intent.action.VIEW \
  -d 'helloreact://example.com/path?label=your_test_value' com.brazeproject
```

## Scripts
The `package.json` exposes various `npx` scripts, which can be executed from this directory path:
  - `android`: Builds and runs the Android app
  - `ios`: Builds and runs the iOS app
  - `lint`: Lints the sample project folder with ESLint
  - `start`: Launches the React Native bundler daemon with a clean cache
  - `test`: Runs a suite of unit tests using Jest
  - `set-rn-version`: Sets the required React Native version for `rnx-align-deps`
  - `fix-dependencies`: Uses `rnx-align-deps` to automatically update the necessary dependencies for the required React Native version
