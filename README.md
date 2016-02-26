![Appboy Logo](https://github.com/Appboy/appboy-react-sdk/blob/master/Appboy_Logo_400x100.png)

# React SDK

Effective marketing automation is an essential part of successfully scaling and managing your business. Appboy empowers you to build better customer relationships through a seamless, multi-channel approach that addresses all aspects of the user life cycle Appboy helps you engage your users on an ongoing basis. Visit the following link for details and we'll have you up and running in no time!

## Getting Started (Default setup)

### iOS
1.  Install the Appboy iOS SDK into your iOS project.  See instructions for Cocoapods and manual integration at https://documentation.appboy.com/iOS/.  See notes below for further information.
2. `rnpm install react-native-appboy-sdk@latest --save`

__Note:__ - if you do a Cocoapods integration for the first time, you need to add `#(inherited)` to the `Other linker flags` configuration in your app.
__Note:__ - if you do a manual integration, our library expects the AppboyKit folder to be under the root of the ios project directory.
__Note:__ - We've also inserted the token `APPBOY_LIBRARY_SEARCH_PATH` in the header search path, so that folks who find the default paths insufficient and care replace that token can do so.  If there are any standard search paths that you think would be universally applicable, please leave an issue on the repo or a pull request and we'll update it.

#### iOS without rnpm
rpnm will automatically link the node package to your project.  If you decide not to use it, follow these steps.

1. `npm install react-native-appboy-sdk@latest --save`
2. In the XCode's "Project navigator", right click on your project's Libraries folder ➜ `Add Files to <...>`
3. Go to `node_modules` ➜ `react-native-appboy-sdk` ➜ `ios` ➜ select `AppboyReactBridge.xcodeproj`
4. Add `AppboyReactBridge.a` to `Build Phases -> Link Binary With Libraries`
5. Update the 'Header Search Paths' in the AppboyReactBridge Xcode project to reference the headers directory of your installation of the Appboy iOS SDK.

#### iOS completing the integration
1.  Follow the directions at https://documentation.appboy.com/ to finish your integration. 
2.  When you need to make Appboy calls from javascript, use the following declaration to import the javascript module:

```
const ReactAppboy = require('react-native-appboy-sdk');
``` 

### Android
1. `npm install react-native-appboy-sdk@latest --save`

```gradle
// file: android/settings.gradle
...

include ':appboy-react-bridge'
project(':appboy-react-bridge').projectDir = new File(settingsDir, '../node_modules/react-native-appboy-sdk/android')
```
```gradle
// file: android/app/build.gradle
...

dependencies {
    ...
    compile project(':appboy-react-bridge')
}
```

2.  Follow the directions at https://documentation.appboy.com/ to finish your integration. 
3.  When you need to make Appboy calls from javascript, use the following declaration to import the javascript module:

```
const ReactAppboy = require('react-native-appboy-sdk');
```
