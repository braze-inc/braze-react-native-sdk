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

## Scripts
The `package.json` exposes various `npx` scripts, which can be executed from this directory path:
  - `android`: Builds and runs the Android app
  - `ios`: Builds and runs the iOS app
  - `lint`: Lints the sample project folder with ESLint
  - `start`: Launches the React Native bundler daemon with a clean cache
  - `test`: Runs a suite of unit tests using Jest
  - `set-rn-version`: Sets the required React Native version for `rnx-align-deps`
  - `fix-dependencies`: Uses `rnx-align-deps` to automatically update the necessary dependencies for the required React Native version
