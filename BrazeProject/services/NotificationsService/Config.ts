import { Platform } from 'react-native';
import {
  BRAZE_FIREBASE_CLOUD_MESSAGING_SENDER_ID_KEY_ANDROID,
  BRAZE_API_KEY_ANDROID_ROI,
  BRAZE_API_KEY_ANDROID_UK,
  BRAZE_API_KEY_IOS_ROI,
  BRAZE_API_KEY_IOS_UK,
  BRAZE_ENDPOINT_ROI,
  BRAZE_ENDPOINT_UK,
} from 'react-native-dotenv';

export namespace Config {
  interface ConfigData {
    apiKey: string;
    endpoint: string;
    logLevel: number;
  }

  interface ConfigDataAndroid extends ConfigData {
    firebaseCloudMessagingSenderIdKey: string;
    type: 'android';
  }

  interface ConfigDataIOS extends ConfigData {
    // "type" attribute here is just to make TS happy
    type: 'iOS';
  }

  export const UK = Platform.select<ConfigDataAndroid | ConfigDataIOS>({
    android: {
      apiKey: BRAZE_API_KEY_ANDROID_UK,
      endpoint: BRAZE_ENDPOINT_UK,
      firebaseCloudMessagingSenderIdKey: BRAZE_FIREBASE_CLOUD_MESSAGING_SENDER_ID_KEY_ANDROID,
      logLevel: 2,
      type: 'android',
    },
    ios: {
      logLevel: 0,
      endpoint: BRAZE_ENDPOINT_UK,
      apiKey: BRAZE_API_KEY_IOS_UK,
      type: 'iOS',
    },
  })!;

  export const ROI = Platform.select<ConfigDataAndroid | ConfigDataIOS>({
    android: {
      apiKey: BRAZE_API_KEY_ANDROID_ROI,
      endpoint: BRAZE_ENDPOINT_ROI,
      firebaseCloudMessagingSenderIdKey: BRAZE_FIREBASE_CLOUD_MESSAGING_SENDER_ID_KEY_ANDROID,
      logLevel: 2,
      type: 'android',
    },
    ios: {
      logLevel: 0,
      endpoint: BRAZE_ENDPOINT_ROI,
      apiKey: BRAZE_API_KEY_IOS_ROI,
      type: 'iOS',
    },
  })!;
}
