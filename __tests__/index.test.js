const NativeEventEmitter = require('react-native').NativeEventEmitter;
const NativeBrazeReactModule = require('../src/specs/NativeBrazeReactModule').default;
const { CampaignProperties } = require('../src/models/campaign-properties');
const { FeatureFlag } = require('../src/models/feature-flag');
const { Banner } = require('../src/models/banner'); 

import Braze from '../src/index';
import { Platform } from 'react-native';

console.log = jest.fn();
const testCallback = jest.fn();

const testInAppMessageJson = `{\"message\":\"body body\",\"type\":\"MODAL\",\"text_align_message\":\"CENTER\",\"click_action\":\"NONE\",\"message_close\":\"SWIPE\",\"extras\":{\"test\":\"123\",\"foo\":\"bar\"},\"header\":\"hello\",\"text_align_header\":\"CENTER\",\"image_url\":\"https:\\/\\/github.com\\/braze-inc\\/braze-react-native-sdk\\/blob\\/master\\/.github\\/assets\\/logo-dark.png?raw=true\",\"image_style\":\"TOP\",\"btns\":[{\"id\":0,\"text\":\"button 1\",\"click_action\":\"URI\",\"uri\":\"https:\\/\\/www.google.com\",\"use_webview\":true,\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479},{\"id\":1,\"text\":\"button 2\",\"click_action\":\"NONE\",\"bg_color\":4279990479,\"text_color\":4294967295,\"border_color\":4279990479}],\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\", \"is_test_send\":false}`;

const testPushPayloadJson = {
  "use_webview": false,
  "is_silent": false,
  "ios": {
    "aps": {
      "alert": {
        "title": "Test Message",
        "body": "Hello World"
      },
      "interruption-level": "active"
    },
    "action_identifier": "com.apple.UNNotificationDefaultActionIdentifier"
  },
  "payload_type": "push_opened",
  "title": "Test Message",
  "braze_properties": {},
  "is_braze_internal": false,
  "body": "Hello World",
  "timestamp": 1728060077,
  "url": "www.braze.com"
};

const testPropertyJson = {
  string_key: { type: 'string', value: 'test_string' },
  boolean_key: { type: 'boolean', value: true },
  number_key: { type: 'number', value: 123.45 },
  timestamp_key: { type: 'datetime', value: 1672531200000 },
  json_key: { type: 'jsonobject', value: { key1: 'value1', key2: 42 } },
  image_key: { type: 'image', value: 'https://example.com/image.png' },
  mismatched_key: { type: 'string', value: 123 },
};

const testFeatureFlagJson = {
  id: 'test_flag_id',
  enabled: true,
  properties: {
    string_prop: { type: 'string', value: 'test_string' },
    bool_prop: { type: 'boolean', value: false },
    number_prop: { type: 'number', value: 123.45 },
    timestamp_prop: { type: 'datetime', value: 1672531200000 },
    json_prop: { type: 'jsonobject', value: { key1: 'value1', key2: 42 } },
    image_prop: { type: 'image', value: 'https://example.com/image.png' },
    mismatched_prop: { type: 'string', value: 123 },
  },
};

afterEach(() => {
  jest.clearAllMocks();
});

test('it calls BrazeReactBridge.registerAndroidPushToken on Android', () => {
  const platform = Platform.OS;
  Platform.OS = 'android';
  const token = "some_token";
  Braze.registerAndroidPushToken(token);
  expect(NativeBrazeReactModule.registerPushToken).toBeCalledWith(token);
  Platform.OS = platform;
});

test('it calls BrazeReactBridge.registerAndroidPushToken on iOS', () => {
  const platform = Platform.OS;
  Platform.OS = 'ios';
  const token = "some_token";
  Braze.registerAndroidPushToken(token);
  expect(NativeBrazeReactModule.registerPushToken).not.toBeCalledWith(token);
  Platform.OS = platform;
});

test('it calls BrazeReactBridge.registerPushToken', () => {
  const token = "some_token";
  Braze.registerPushToken(token);
  expect(NativeBrazeReactModule.registerPushToken).toBeCalledWith(token);
});

test('it calls BrazeReactBridge.registerPushToken with null', () => {
  const token = null;
  Braze.registerPushToken(token);
  expect(NativeBrazeReactModule.registerPushToken).toBeCalledWith(token);
});

test('it calls BrazeReactBridge.setGoogleAdvertisingId', () => {
  const googleAdvertisingId = "some_ga_id";
  const adTrackingEnabled = true;
  Braze.setGoogleAdvertisingId(googleAdvertisingId, adTrackingEnabled);
  expect(NativeBrazeReactModule.setAdTrackingEnabled).toBeCalledWith(adTrackingEnabled, googleAdvertisingId);
});

test('it calls BrazeReactBridge.setAdTrackingEnabled', () => {
  const googleAdvertisingId = "some_ga_id";
  const adTrackingEnabled = true;
  Braze.setAdTrackingEnabled(adTrackingEnabled, googleAdvertisingId);
  expect(NativeBrazeReactModule.setAdTrackingEnabled).toBeCalledWith(adTrackingEnabled, googleAdvertisingId);
});

test('it calls BrazeReactBridge.setIdentifierForVendor', () => {
  const idfv = "some_idfv";
  Braze.setIdentifierForVendor(idfv);
  expect(NativeBrazeReactModule.setIdentifierForVendor).toBeCalledWith(idfv);
});

test('it calls BrazeReactBridge.setIdentifierForAdvertiser', () => {
  const idfa = "some_idfa";
  Braze.setIdentifierForAdvertiser(idfa);
  expect(NativeBrazeReactModule.setIdentifierForAdvertiser).toBeCalledWith(idfa);
});

test('it calls BrazeReactBridge.setFirstName', () => {
  const first_name = "some_name";
  Braze.setFirstName(first_name);
  expect(NativeBrazeReactModule.setFirstName).toBeCalledWith(first_name);
});

test('it calls BrazeReactBrige.setFirstNameWithNull', () => {
  Braze.setFirstName(null);
  expect(NativeBrazeReactModule.setFirstName).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.setLastName', () => {
  const last_name = "some_name";
  Braze.setLastName(last_name);
  expect(NativeBrazeReactModule.setLastName).toBeCalledWith(last_name);
});

test('it calls BrazeReactBrige.setLastNameWithNull', () => {
  Braze.setLastName(null);
  expect(NativeBrazeReactModule.setLastName).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.setLanguage', () => {
  const language = "to";
  Braze.setLanguage(language);
  expect(NativeBrazeReactModule.setLanguage).toBeCalledWith(language);
});

test('it calls BrazeReactBrige.setLanguageWithNull', () => {
  Braze.setLanguage(null);
  expect(NativeBrazeReactModule.setLanguage).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.setEmail', () => {
  const email = "some_email";
  Braze.setEmail(email);
  expect(NativeBrazeReactModule.setEmail).toBeCalledWith(email);
});

test('it calls BrazeReactBrige.setEmailWithNull', () => {
  Braze.setEmail(null);
  expect(NativeBrazeReactModule.setEmail).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.setCountry', () => {
  const country = "some_country";
  Braze.setCountry(country);
  expect(NativeBrazeReactModule.setCountry).toBeCalledWith(country);
});

test('it calls BrazeReactBrige.setCountryWithNull', () => {
  Braze.setCountry(null);
  expect(NativeBrazeReactModule.setCountry).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.setHomeCity', () => {
  const city = "some_city";
  Braze.setHomeCity(city);
  expect(NativeBrazeReactModule.setHomeCity).toBeCalledWith(city);
});

test('it calls BrazeReactBrige.setHomeCityWithNull', () => {
  Braze.setHomeCity(null);
  expect(NativeBrazeReactModule.setHomeCity).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.setPhoneNumber', () => {
  const number = "555-867-5309";
  Braze.setPhoneNumber(number);
  expect(NativeBrazeReactModule.setPhoneNumber).toBeCalledWith(number);
});

test('it calls BrazeReactBrige.setPhoneNumberWithNull', () => {
  Braze.setPhoneNumber(null);
  expect(NativeBrazeReactModule.setPhoneNumber).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.getBanner', () => {
  Braze.getBanner("some_banner_id");
  expect(NativeBrazeReactModule.getBanner).toBeCalledWith("some_banner_id");
});

test('it calls BrazeReactBridge.requestBannersRefresh', () => {
  Braze.requestBannersRefresh(["sdk-test-1", "sdk-test-2"]);
  expect(NativeBrazeReactModule.requestBannersRefresh).toBeCalledWith(["sdk-test-1", "sdk-test-2"]);
});

test('it calls BrazeReactBridge.launchContentCards without parameters', () => {
  Braze.launchContentCards();
  expect(NativeBrazeReactModule.launchContentCards).toBeCalledWith(false);
});

test('it calls BrazeReactBridge.launchContentCards with parameters', () => {
  Braze.launchContentCards(true);
  expect(NativeBrazeReactModule.launchContentCards).toBeCalledWith(true);

  Braze.launchContentCards(false);
  expect(NativeBrazeReactModule.launchContentCards).toBeCalledWith(false);
});

test('it calls BrazeReactBridge.getContentCards', () => {
  Braze.getContentCards();
  expect(NativeBrazeReactModule.getContentCards).toBeCalled();
});

test('it calls BrazeReactBridge.getCachedContentCards', () => {
  Braze.getCachedContentCards();
  expect(NativeBrazeReactModule.getCachedContentCards).toBeCalled();
});

test('it calls BrazeReactBridge.logContentCardClicked', () => {
  const id = "1234";
  Braze.logContentCardClicked(id);
  expect(NativeBrazeReactModule.logContentCardClicked).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.logContentCardDismissed', () => {
  const id = "1234";
  Braze.logContentCardDismissed(id);
  expect(NativeBrazeReactModule.logContentCardDismissed).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.logContentCardImpression', () => {
  const id = "1234";
  Braze.logContentCardImpression(id);
  expect(NativeBrazeReactModule.logContentCardImpression).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.requestImmediateDataFlush', () => {
  Braze.requestImmediateDataFlush();
  expect(NativeBrazeReactModule.requestImmediateDataFlush).toBeCalled();
});

test('it calls BrazeReactBridge.wipeData', () => {
  Braze.wipeData();
  expect(NativeBrazeReactModule.wipeData).toBeCalled();
});

test('it calls BrazeReactBridge.disableSDK', () => {
  Braze.disableSDK();
  expect(NativeBrazeReactModule.disableSDK).toBeCalled();
});

test('it calls BrazeReactBridge.enableSDK', () => {
  Braze.enableSDK();
  expect(NativeBrazeReactModule.enableSDK).toBeCalled();
});

test('it calls BrazeReactBridge.requestLocationInitialization', () => {
  Braze.requestLocationInitialization();
  expect(NativeBrazeReactModule.requestLocationInitialization).toBeCalled();
});

test('it calls BrazeReactBridge.requestGeofences', () => {
  const latitude = 40.7128;
  const longitude = 74.0060;
  Braze.requestGeofences(latitude, longitude);
  expect(NativeBrazeReactModule.requestGeofences).toBeCalledWith(latitude, longitude);
});

test('it calls BrazeReactBridge.setLocationCustomAttribute', () => {
  const key = "some_key";
  const latitude = 40.7128;
  const longitude = 74.0060;
  Braze.setLocationCustomAttribute(key, latitude, longitude, testCallback);
  expect(NativeBrazeReactModule.setLocationCustomAttribute).toBeCalledWith(key, latitude, longitude, testCallback);
});

test('it calls BrazeReactBridge.setLastKnownLocation', () => {
  const latitude = 40.7128;
  const longitude = 74.0060;
  const altitude = 24.0;
  const horizontalAccuracy = 25.0;
  const verticalAccuracy = 26.0;
  Braze.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy);
  expect(NativeBrazeReactModule.setLastKnownLocation).toBeCalledWith(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy);
});

test('it calls BrazeReactBridge.setLastKnownLocation with 3 null', () => {
  const latitude = 40.7128;
  const longitude = 74.0060;
  const altitude = null;
  const horizontalAccuracy = null;
  const verticalAccuracy = null;
  Braze.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy);
  expect(NativeBrazeReactModule.setLastKnownLocation).toBeCalledWith(latitude, longitude, 0, -1, -1);
});

test('it calls BrazeReactBridge.setLastKnownLocation with 2 null', () => {
  const latitude = 40.7128;
  const longitude = 74.0060;
  const altitude = null;
  const horizontalAccuracy = 25.0;
  const verticalAccuracy = null;
  Braze.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy);
  expect(NativeBrazeReactModule.setLastKnownLocation).toBeCalledWith(latitude, longitude, 0, horizontalAccuracy, -1);
});

test('it calls BrazeReactBridge.setLastKnownLocation with 1 null', () => {
  const latitude = 40.7128;
  const longitude = 74.0060;
  const altitude = 24.0;
  const horizontalAccuracy = 25.0;
  const verticalAccuracy = null;
  Braze.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy);
  expect(NativeBrazeReactModule.setLastKnownLocation).toBeCalledWith(latitude, longitude, altitude, horizontalAccuracy, -1);
});

test('it calls BrazeReactBridge.requestContentCardsRefresh', () => {
  Braze.requestContentCardsRefresh();
  expect(NativeBrazeReactModule.requestContentCardsRefresh).toBeCalled();
});

test('it calls BrazeReactBridge.setDateOfBirth', () => {
  const year = 2011;
  const month = 11;
  const day = 23;
  Braze.setDateOfBirth(year, month, day);
  expect(NativeBrazeReactModule.setDateOfBirth).toBeCalledWith(year, month, day);
});

test('it calls BrazeReactBridge.changeUser', () => {
  const user_id = "some_id";
  Braze.changeUser(user_id);
  expect(NativeBrazeReactModule.changeUser).toBeCalledWith(user_id, null);
});

test('it calls BrazeReactBridge.getUserId', () => {
  const user_id = "some_user_id";
  Braze.changeUser(user_id);
  NativeBrazeReactModule.getUserId.mockImplementation((callback) => {
    callback(null, "some_user_id");
  });
});

test('it calls BrazeReactBridge.getUserId with null', () => {
  const user_id = null;
  Braze.changeUser(user_id);
  NativeBrazeReactModule.getUserId.mockImplementation((callback) => {
    callback(null, null);
  });
});

test('it calls BrazeReactBridge.setSdkAuthenticationSignature', () => {
  const signature = "signature";
  Braze.setSdkAuthenticationSignature(signature);
  expect(NativeBrazeReactModule.setSdkAuthenticationSignature).toBeCalledWith(signature);
});

test('it calls BrazeReactBridge.addAlias', () => {
  const aliasName = "name";
  const aliasLabel = "label";
  Braze.addAlias(aliasName, aliasLabel);
  expect(NativeBrazeReactModule.addAlias).toBeCalledWith(aliasName, aliasLabel);
});

test('it calls BrazeReactBridge.logCustomEvent', () => {
  const event_name = "event_name";
  const event_properties = "event_properties";
  Braze.logCustomEvent(event_name, event_properties);
  expect(NativeBrazeReactModule.logCustomEvent).toBeCalledWith(event_name, event_properties);
});

test('it calls BrazeReactBridge.logPurchase', () => {
  const product_id = "product_id";
  const price = "price";
  const currency_code = "currency_code";
  const quantity = "quantity";
  const purchase_properties = "purchase_properties";
  Braze.logPurchase(product_id, price, currency_code, quantity, purchase_properties);
  expect(NativeBrazeReactModule.logPurchase).toBeCalledWith(product_id, price, currency_code, quantity, purchase_properties);
});

test('it calls BrazeReactBridge.setAttributionData', () => {
  const network = "some_network";
  const campaign = "some_campaign";
  const adGroup = "some_adGroup";
  const creative = "some_creative";
  Braze.setAttributionData(network, campaign, adGroup, creative);
  expect(NativeBrazeReactModule.setAttributionData).toBeCalledWith(network, campaign, adGroup, creative);
});

test('it calls BrazeReactBridge.setDateCustomUserAttribute', () => {
  const key = "some_key";
  const date = new Date('December 17, 1995 03:24:00');
  Braze.setCustomUserAttribute(key, date, testCallback);
  expect(NativeBrazeReactModule.setDateCustomUserAttribute).toBeCalledWith(key, Math.floor(date.getTime() / 1000), testCallback);
});

test('it calls BrazeReactBridge.setCustomUserAttributeArray', () => {
  const key = "some_key";
  const array = ['a', 'b'];
  Braze.setCustomUserAttribute(key, array, testCallback);
  expect(NativeBrazeReactModule.setCustomUserAttributeArray).toBeCalledWith(key, array, testCallback);
});

test('it calls BrazeReactBridge.setCustomUserAttributeObjectArray', () => {
  const key = "some_key";
  const array = [{'one': 1, 'two': 2, 'three': 3}, {'eight': 8, 'nine': 9}];
  Braze.setCustomUserAttribute(key, array, testCallback);
  expect(NativeBrazeReactModule.setCustomUserAttributeObjectArray).toBeCalledWith(key, array, testCallback);
});

test('it calls BrazeReactBridge.setCustomUserAttributeObject 4 parameters', () => {
  const key = "some_key";
  const hash = {'do': 're', 'mi': 'fa'};
  const merge = true;
  Braze.setCustomUserAttribute(key, hash, merge, testCallback);

  expect(NativeBrazeReactModule.setCustomUserAttributeObject).toBeCalledWith(key, hash, merge, testCallback);
});

test('it calls BrazeReactBridge.setCustomUserAttributeObject 3 parameters', () => {
  const key = "some_key";
  const hash = {'do': 're', 'mi': 'fa'};
  // When not given, merge defaults to 'false'
  const merge = false;
  Braze.setCustomUserAttribute(key, hash, testCallback);

  expect(NativeBrazeReactModule.setCustomUserAttributeObject).toBeCalledWith(key, hash, merge, testCallback);
});

test('it calls BrazeReactBridge.setCustomUserAttributeObject with null value', () => {
  const key = "some_key";
  const hash = null;
  // When not given, merge defaults to 'false'
  const merge = false;
  Braze.setCustomUserAttribute(key, hash, testCallback);

  expect(NativeBrazeReactModule.setCustomUserAttributeObject).toBeCalledWith(key, hash, merge, testCallback);
});

test('it calls BrazeReactBridge.setBoolCustomUserAttribute', () => {
  const key = "some_key";
  const bool_value = true;
  Braze.setCustomUserAttribute(key, bool_value, testCallback);
  expect(NativeBrazeReactModule.setBoolCustomUserAttribute).toBeCalledWith(key, bool_value, testCallback);
});

test('it calls BrazeReactBridge.setStringCustomUserAttribute', () => {
  const key = "some_key";
  const string_value = "some string";
  Braze.setCustomUserAttribute(key, string_value, testCallback);
  expect(NativeBrazeReactModule.setStringCustomUserAttribute).toBeCalledWith(key, string_value, testCallback);
});

test('it calls BrazeReactBridge.setIntCustomUserAttribute', () => {
  const key = "some_key";
  const int_value = 55;
  Braze.setCustomUserAttribute(key, int_value, testCallback);
  expect(NativeBrazeReactModule.setIntCustomUserAttribute).toBeCalledWith(key, int_value, testCallback);
});

test('it calls BrazeReactBridge.setDoubleCustomUserAttribute', () => {
  const key = "some_key";
  const double_value = 3.14;
  Braze.setCustomUserAttribute(key, double_value, testCallback);
  expect(NativeBrazeReactModule.setDoubleCustomUserAttribute).toBeCalledWith(key, double_value, testCallback);
});

test('it calls BrazeReactBridge.incrementCustomUserAttribute', () => {
  const key = "some_key";
  const value = 5;
  Braze.incrementCustomUserAttribute(key, value, testCallback);
  expect(NativeBrazeReactModule.incrementCustomUserAttribute).toBeCalledWith(key, value, testCallback);
});

test('it calls BrazeReactBridge.setGender', () => {
  const gender = "male";
  Braze.setGender(gender, testCallback);
  expect(NativeBrazeReactModule.setGender).toBeCalledWith(gender, testCallback);
});

test('it calls BrazeReactBrige.setGenderWithNull', () => {
  Braze.setGender(null, testCallback);
  expect(NativeBrazeReactModule.setGender).toBeCalledWith(null, testCallback);
});

test('it calls BrazeReactBridge.addToSubscriptionGroup', () => {
  const groupId = "some_group_id";
  Braze.addToSubscriptionGroup(groupId, testCallback);
  expect(NativeBrazeReactModule.addToSubscriptionGroup).toBeCalledWith(groupId, testCallback);
});

test('it calls BrazeReactBridge.removeFromSubscriptionGroup', () => {
  const groupId = "some_group_id";
  Braze.removeFromSubscriptionGroup(groupId, testCallback);
  expect(NativeBrazeReactModule.removeFromSubscriptionGroup).toBeCalledWith(groupId, testCallback);
});

test('it calls BrazeReactBridge.setPushNotificationSubscriptionType', () => {
  const sub_type = "some_sub_type";
  Braze.setPushNotificationSubscriptionType(sub_type, testCallback);
  expect(NativeBrazeReactModule.setPushNotificationSubscriptionType).toBeCalledWith(sub_type, testCallback);
});

test('it calls BrazeReactBridge.setEmailNotificationSubscriptionType', () => {
  const sub_type = "some_sub_type";
  Braze.setEmailNotificationSubscriptionType(sub_type, testCallback);
  expect(NativeBrazeReactModule.setEmailNotificationSubscriptionType).toBeCalledWith(sub_type, testCallback);
});

test('it calls BrazeReactBridge.addToCustomUserAttributeArray', () => {
  const key = "some_key";
  const value = "some_value"
  Braze.addToCustomUserAttributeArray(key, value, testCallback);
  expect(NativeBrazeReactModule.addToCustomUserAttributeArray).toBeCalledWith(key, value, testCallback);
});

test('it calls BrazeReactBridge.removeFromCustomUserAttributeArray', () => {
  const key = "some_key";
  const value = "some_value"
  Braze.removeFromCustomUserAttributeArray(key, value, testCallback);
  expect(NativeBrazeReactModule.removeFromCustomUserAttributeArray).toBeCalledWith(key, value, testCallback);
});

test('it calls BrazeReactBridge.unsetCustomUserAttribute', () => {
  const key = "some_key";
  Braze.unsetCustomUserAttribute(key, testCallback);
  expect(NativeBrazeReactModule.unsetCustomUserAttribute).toBeCalledWith(key, testCallback);
});

test('it calls BrazeReactBridge.getInitialURL if defined', () => {
  NativeBrazeReactModule.getInitialURL.mockImplementation((callback) => {
    callback(null, testPushPayloadJson["url"]);
  });
  Braze.getInitialURL(testCallback);
  expect(NativeBrazeReactModule.getInitialURL).toBeCalled();
  expect(testCallback).toBeCalledWith(testPushPayloadJson["url"]);
});

test('it calls BrazeReactBridge.getInitialPushPayload if defined', () => {
  NativeBrazeReactModule.getInitialPushPayload.mockImplementation((callback) => {
    callback(null, testPushPayloadJson);
  });
  Braze.getInitialPushPayload(testCallback);
  expect(NativeBrazeReactModule.getInitialPushPayload).toBeCalled();
  expect(testCallback).toBeCalledWith(testPushPayloadJson);
});

test('it calls BrazeReactBridge.getDeviceId', () => {
  NativeBrazeReactModule.getDeviceId.mockImplementation((callback) => {
    callback(null, "some_tracking_id");
  });
  Braze.getDeviceId(testCallback);
  expect(NativeBrazeReactModule.getDeviceId).toBeCalled();
  expect(testCallback).toBeCalledWith(null, "some_tracking_id");
});

test('it calls the callback with null and logs the error if BrazeReactBridge.getInitialUrl returns an error', () => {
  NativeBrazeReactModule.getInitialURL.mockImplementation((callback) => {
    callback("error", null);
  });
  Braze.getInitialURL(testCallback);
  expect(NativeBrazeReactModule.getInitialURL).toBeCalled();
  expect(testCallback).toBeCalledWith(null);
  expect(console.log).toBeCalledWith("error");
});

test('it calls the callback with null and logs the error if BrazeReactBridge.getInitialPushPayload returns an error', () => {
  NativeBrazeReactModule.getInitialPushPayload.mockImplementation((callback) => {
    callback("error", null);
  });
  Braze.getInitialPushPayload(testCallback);
  expect(NativeBrazeReactModule.getInitialPushPayload).toBeCalled();
  expect(testCallback).toBeCalledWith(null);
  expect(console.log).toBeCalledWith("error");
});

test('it calls the callback with null if BrazeReactBridge.getInitialUrl is running on Android', () => {
  const platform = Platform.OS;
  Platform.OS = 'android';
  Braze.getInitialURL(testCallback);
  expect(testCallback).toBeCalledWith(null);
  Platform.OS = platform;
});

test('it calls the callback with null if BrazeReactBridge.getInitialPushPayload is running on Android', () => {
  const platform = Platform.OS;
  Platform.OS = 'android';
  Braze.getInitialPushPayload(testCallback);
  expect(testCallback).toBeCalledWith(null);
  Platform.OS = platform;
});

test('it calls BrazeReactBridge.subscribeToInAppMessage', () => {
  Braze.subscribeToInAppMessage(true, testCallback);
  expect(NativeBrazeReactModule.subscribeToInAppMessage).toBeCalledWith(true, testCallback);

  Braze.subscribeToInAppMessage(false, testCallback);
  expect(NativeBrazeReactModule.subscribeToInAppMessage).toBeCalledWith(false, testCallback);
});

test('it calls BrazeReactBridge.hideCurrentInAppMessage', () => {
  Braze.hideCurrentInAppMessage();
  expect(NativeBrazeReactModule.hideCurrentInAppMessage).toBeCalled();
});

test('it adds a listener', () => {
  let counter = 0;
  let testFunction = () => { counter += 1 };
  let testEvent = Braze.Events.CONTENT_CARDS_UPDATED;
  const nativeEmitter = new NativeEventEmitter();
  Braze.addListener(testEvent, testFunction);
  nativeEmitter.emit(testEvent);
  expect(counter).toBe(1);
});

it('instantiates a BrazeInAppMessage object', () => {
  const testMessageBody = "some message body";
  const testMessageType = 'MODAL';
  const testUri = "https:\\/\\/www.sometesturi.com";
  const testImageUrl = "https:\\/\\/www.sometestimageuri.com";
  const testZippedAssetsUrl = "https:\\/\\/www.sometestzippedassets.com";
  const testUseWebView = true;
  const testDuration = 42;
  const testExtras = '{\"test\":\"123\",\"foo\":\"bar\"}';
  const testClickAction = 'URI';
  const testDismissType = 'SWIPE';
  const testHeader = "some header";
  const testButton0 = '{\"id\":0,\"text\":\"button 1\",\"click_action\":\"URI\",\"uri\":\"https:\\/\\/www.google.com\",\"use_webview\":true,\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479}';
  const testButton1 = '{\"id\":1,\"text\":\"button 2\",\"click_action\":\"NONE\",\"bg_color\":4279990479,\"text_color\":4294967295,\"border_color\":4279990479}';
  const testButtonString = `[${testButton0}, ${testButton1}]`;
  const testButtons = [];
  const testIsTestSend = true;
  testButtons.push(new Braze.BrazeButton(JSON.parse(testButton0)));
  testButtons.push(new Braze.BrazeButton(JSON.parse(testButton1)));
  const testJson = `{\"message\":\"${testMessageBody}\",\"type\":\"${testMessageType}\",\"text_align_message\":\"CENTER\",\"click_action\":\"${testClickAction}\",\"message_close\":\"SWIPE\",\"extras\":${testExtras},\"header\":\"${testHeader}\",\"text_align_header\":\"CENTER\",\"image_url\":\"${testImageUrl}\",\"image_style\":\"TOP\",\"btns\":${testButtonString},\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\",\"uri\":\"${testUri}\",\"zipped_assets_url\":\"${testZippedAssetsUrl}\",\"duration\":${testDuration},\"message_close\":\"${testDismissType}\",\"use_webview\":${testUseWebView}, \"is_test_send\":${testIsTestSend}}`
  const inAppMessage = new Braze.BrazeInAppMessage(testJson);
  expect(inAppMessage.message).toBe(testMessageBody);
  expect(inAppMessage.messageType).toBe(testMessageType.toLowerCase());
  expect(inAppMessage.uri).toBe(JSON.parse(`"${testUri}"`));
  expect(inAppMessage.useWebView).toBe(testUseWebView);
  expect(inAppMessage.zippedAssetsUrl).toBe(JSON.parse(`"${testZippedAssetsUrl}"`));
  expect(inAppMessage.duration).toBe(testDuration);
  expect(inAppMessage.extras).toEqual(JSON.parse(testExtras));
  expect(inAppMessage.clickAction).toBe(testClickAction.toLowerCase());
  expect(inAppMessage.dismissType).toBe(testDismissType.toLowerCase());
  expect(inAppMessage.imageUrl).toBe(JSON.parse(`"${testImageUrl}"`));
  expect(inAppMessage.header).toBe(testHeader);
  expect(inAppMessage.inAppMessageJsonString).toBe(testJson);
  expect(inAppMessage.buttons).toEqual(testButtons);
  expect(inAppMessage.isTestSend).toEqual(testIsTestSend);
});

it('instantiates a BrazeInAppMessage object with the desired defaults', () => {
  const defaultMessageBody = '';
  const defaultMessageType = 'SLIDEUP';
  const defaultUri = '';
  const defaultImageUrl = '';
  const defaultZippedAssetsUrl = '';
  const defaultUseWebView = false;
  const defaultDuration = 5;
  const defaultExtras = {};
  const defaultClickAction = 'NONE';
  const defaultDismissType = 'AUTO_DISMISS';
  const defaultHeader = '';
  const defaultButtons = [];
  const defaultIsTestSend = false;
  const testJson = `{}`;
  const inAppMessage = new Braze.BrazeInAppMessage(testJson);
  expect(inAppMessage.message).toBe(defaultMessageBody);
  expect(inAppMessage.messageType).toBe(defaultMessageType.toLowerCase());
  expect(inAppMessage.uri).toBe(defaultUri);
  expect(inAppMessage.useWebView).toBe(defaultUseWebView);
  expect(inAppMessage.zippedAssetsUrl).toBe(defaultZippedAssetsUrl);
  expect(inAppMessage.duration).toBe(defaultDuration);
  expect(inAppMessage.extras).toEqual(defaultExtras);
  expect(inAppMessage.clickAction).toBe(defaultClickAction.toLowerCase());
  expect(inAppMessage.dismissType).toBe(defaultDismissType.toLowerCase());
  expect(inAppMessage.imageUrl).toBe(defaultImageUrl);
  expect(inAppMessage.header).toBe(defaultHeader);
  expect(inAppMessage.inAppMessageJsonString).toBe(testJson);
  expect(inAppMessage.buttons).toEqual(defaultButtons);
  expect(inAppMessage.isTestSend).toEqual(defaultIsTestSend);
});

it('returns the original JSON when calling BrazeInAppMessage.toString()', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  expect(inAppMessage.toString()).toBe(testInAppMessageJson);
});

test('it calls BrazeReactBridge.logInAppMessageClicked', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  Braze.logInAppMessageClicked(inAppMessage);
  expect(NativeBrazeReactModule.logInAppMessageClicked).toBeCalledWith(testInAppMessageJson);
});

test('it calls BrazeReactBridge.logInAppMessageImpression', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  Braze.logInAppMessageImpression(inAppMessage);
  expect(NativeBrazeReactModule.logInAppMessageImpression).toBeCalledWith(testInAppMessageJson);
});

test('it calls BrazeReactBridge.logInAppMessageButtonClicked', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  const testId = 23;
  Braze.logInAppMessageButtonClicked(inAppMessage, testId);
  expect(NativeBrazeReactModule.logInAppMessageButtonClicked).toBeCalledWith(testInAppMessageJson, testId);
});

test('calls BrazeReactBridge.requestPushPermission', () => {
  const options = {
    "alert": true,
    "badge": true,
    "sound": true,
    "timeSensitive": true,
    "provisional": true,
  }

  Braze.requestPushPermission(options);
  expect(NativeBrazeReactModule.requestPushPermission).toBeCalledWith(options);
})

it('instantiates a BrazeButton object', () => {
  const testId = 53;
  const testClickAction = 'URI';
  const testText = 'some text';
  const testUri = "https:\\/\\/www.sometesturi.com";
  const testUseWebView = true;
  const testButtonJson = `{\"id\":${testId},\"text\":\"${testText}\",\"click_action\":\"${testClickAction}\",\"uri\":\"${testUri}\",\"use_webview\":${testUseWebView},\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479}`;
  const button = new Braze.BrazeButton(JSON.parse(testButtonJson));
  expect(button.id).toBe(testId);
  expect(button.clickAction).toBe(testClickAction.toLowerCase());
  expect(button.text).toBe(testText);
  expect(button.uri).toBe(JSON.parse(`"${testUri}"`));
  expect(button.useWebView).toBe(testUseWebView);
  expect(button.toString()).toBe("BrazeButton text:" + button.text + " uri:" + button.uri + " clickAction:"
    + button.clickAction.toString() + " useWebView:" + button.useWebView.toString());
});

it('instantiates a BrazeButton object with the desired defaults', () => {
  const defaultUri = '';
  const defaultText = '';
  const defaultUseWebView = false;
  const defaultClickAction = 'NONE';
  const defaultId = 0;
  const inAppMessage = new Braze.BrazeButton(`{}`);
  expect(inAppMessage.uri).toBe(defaultUri);
  expect(inAppMessage.useWebView).toBe(defaultUseWebView);
  expect(inAppMessage.text).toBe(defaultText);
  expect(inAppMessage.clickAction).toBe(defaultClickAction.toLowerCase());
  expect(inAppMessage.id).toBe(defaultId);
});

test('it calls BrazeReactBridge.getFeatureFlag', () => {
  const testId = 'test';
  Braze.getFeatureFlag('test');
  expect(NativeBrazeReactModule.getFeatureFlag).toBeCalledWith(testId);
});

test('it calls BrazeReactBridge.getAllFeatureFlags', () => {
  Braze.getAllFeatureFlags();
  expect(NativeBrazeReactModule.getAllFeatureFlags).toBeCalled();
});

test('it calls BrazeReactBridge.refreshFeatureFlags', () => {
  Braze.refreshFeatureFlags();
  expect(NativeBrazeReactModule.refreshFeatureFlags).toBeCalled();
});

test('it calls BrazeReactBridge.logFeatureFlagImpression', () => {
  Braze.logFeatureFlagImpression('test');
  expect(NativeBrazeReactModule.logFeatureFlagImpression).toBeCalled();
})

test('it calls BrazeReactBridge.getFeatureFlagBooleanProperty', () => {
  Braze.getFeatureFlagBooleanProperty('id', 'key');
  expect(NativeBrazeReactModule.getFeatureFlagBooleanProperty).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagStringProperty', () => {
  Braze.getFeatureFlagStringProperty('id', 'key');
  expect(NativeBrazeReactModule.getFeatureFlagStringProperty).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagNumberProperty', () => {
  Braze.getFeatureFlagNumberProperty('id', 'key');
  expect(NativeBrazeReactModule.getFeatureFlagNumberProperty).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagTimestampProperty', () => {
  Braze.getFeatureFlagTimestampProperty('id', 'key');
  expect(NativeBrazeReactModule.getFeatureFlagTimestampProperty).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagJSONProperty', () => {
  Braze.getFeatureFlagJSONProperty('id', 'key');
  expect(NativeBrazeReactModule.getFeatureFlagJSONProperty).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagImageProperty', () => {
  Braze.getFeatureFlagImageProperty('id', 'key');
  expect(NativeBrazeReactModule.getFeatureFlagImageProperty).toBeCalled();
});

test('it calls BrazeReactBridge.updateTrackingPropertyAllowList', () => {
  const allowList = {
    adding: [Braze.TrackingProperty.ALL_CUSTOM_ATTRIBUTES],
    removing: [Braze.TrackingProperty.ANALYTICS_EVENTS, Braze.TrackingProperty.EMAIL],
    addingCustomEvents: ['123', '234'],
    removingCustomEvents: ['233'],
    addingCustomAttributes: ['attr-1'],
    removingCustomAttributes: ['attr-2', 'attr3']
  };
  Braze.updateTrackingPropertyAllowList(allowList);
  expect(NativeBrazeReactModule.updateTrackingPropertyAllowList).toBeCalledWith(allowList);
});

// Tests for CampaignProperties class

describe('CampaignProperties', () => {
  let campaignProperties;

  beforeEach(() => {
    campaignProperties = new CampaignProperties(testPropertyJson);
  });

  test('constructor correctly assigns properties', () => {
    expect(campaignProperties.properties).toEqual(testPropertyJson);
  });

  // - Test cases for getStringProperty
  test('getStringProperty returns the correct value for a valid key', () => {
    const value = campaignProperties.getStringProperty('string_key');
    expect(value).toBe('test_string');
  });

  test('getStringProperty returns null for a mismatched type', () => {
    const value = campaignProperties.getStringProperty('boolean_key');
    expect(value).toBeNull();
  });

  test('getStringProperty returns null for a non-existent key', () => {
    const value = campaignProperties.getStringProperty('non_existent_key');
    expect(value).toBeNull();
  });

  // - Test cases for getBooleanProperty
  test('getBooleanProperty returns the correct value for a valid key', () => {
    const value = campaignProperties.getBooleanProperty('boolean_key');
    expect(value).toBe(true);
  });

  test('getBooleanProperty returns null for a mismatched type', () => {
    const value = campaignProperties.getBooleanProperty('string_key');
    expect(value).toBeNull();
  });

  test('getBooleanProperty returns null for a non-existent key', () => {
    const value = campaignProperties.getBooleanProperty('non_existent_key');
    expect(value).toBeNull();
  });

  // - Test cases for getNumberProperty
  test('getNumberProperty returns the correct value for a valid key', () => {
    const value = campaignProperties.getNumberProperty('number_key');
    expect(value).toBe(123.45);
  });

  test('getNumberProperty returns null for a mismatched type', () => {
    const value = campaignProperties.getNumberProperty('string_key');
    expect(value).toBeNull();
  });

  test('getNumberProperty returns null for a non-existent key', () => {
    const value = campaignProperties.getNumberProperty('non_existent_key');
    expect(value).toBeNull();
  });

  // - Test cases for getTimestampProperty
  test('getTimestampProperty returns the correct value for a valid key', () => {
    const value = campaignProperties.getTimestampProperty('timestamp_key');
    expect(value).toBe(1672531200000);
  });

  test('getTimestampProperty returns null for a mismatched type', () => {
    const value = campaignProperties.getTimestampProperty('string_key');
    expect(value).toBeNull();
  });

  test('getTimestampProperty returns null for a non-existent key', () => {
    const value = campaignProperties.getTimestampProperty('non_existent_key');
    expect(value).toBeNull();
  });

  // - Test cases for getJSONProperty
  test('getJSONProperty returns the correct value for a valid key', () => {
    const value = campaignProperties.getJSONProperty('json_key');
    expect(value).toEqual({ key1: 'value1', key2: 42 });
  });

  test('getJSONProperty returns null for a mismatched type', () => {
    const value = campaignProperties.getJSONProperty('string_key');
    expect(value).toBeNull();
  });

  test('getJSONProperty returns null for a non-existent key', () => {
    const value = campaignProperties.getJSONProperty('non_existent_key');
    expect(value).toBeNull();
  });

  // - Test cases for getImageProperty
  test('getImageProperty returns the correct value for a valid key', () => {
    const value = campaignProperties.getImageProperty('image_key');
    expect(value).toBe('https://example.com/image.png');
  });

  test('getImageProperty returns null for a mismatched type', () => {
    const value = campaignProperties.getImageProperty('string_key');
    expect(value).toBeNull();
  });

  test('getImageProperty returns null for a non-existent key', () => {
    const value = campaignProperties.getImageProperty('non_existent_key');
    expect(value).toBeNull();
  });
});

// Tests for FeatureFlag class

describe('FeatureFlag', () => {
  let featureFlagInstance;

  beforeEach(() => {
    featureFlagInstance = new FeatureFlag(testFeatureFlagJson);
  });

  // - Test the constructor to ensure properties are assigned correctly
  test('constructor correctly assigns id, enabled, and properties', () => {
    expect(featureFlagInstance.id).toBe('test_flag_id');
    expect(featureFlagInstance.enabled).toBe(true);
    expect(featureFlagInstance.properties).toBeInstanceOf(CampaignProperties);
  });

  // - Test cases for getBooleanProperty
  test('getBooleanProperty correctly delegates to CampaignProperties', () => {
    const value = featureFlagInstance.getBooleanProperty('bool_prop');
    expect(value).toBe(false);
  });

  test('getBooleanProperty returns null for a non-existent key', () => {
    const value = featureFlagInstance.getBooleanProperty('non_existent_key');
    expect(value).toBeNull();
  });

  test('getBooleanProperty returns null for a mismatched type', () => {
    const value = featureFlagInstance.getBooleanProperty('string_prop');
    expect(value).toBeNull();
  });

  // - Test cases for getStringProperty
  test('getStringProperty correctly delegates to CampaignProperties', () => {
    const value = featureFlagInstance.getStringProperty('string_prop');
    expect(value).toBe('test_string');
  });

  test('getStringProperty returns null for a non-existent key', () => {
    const value = featureFlagInstance.getStringProperty('non_existent_key');
    expect(value).toBeNull();
  });

  test('getStringProperty returns null for a mismatched type', () => {
    const value = featureFlagInstance.getStringProperty('bool_prop');
    expect(value).toBeNull();
  });

  // - Test cases for getNumberProperty
  test('getNumberProperty correctly delegates to CampaignProperties', () => {
    const value = featureFlagInstance.getNumberProperty('number_prop');
    expect(value).toBe(123.45);
  });

  test('getNumberProperty returns null for a non-existent key', () => {
    const value = featureFlagInstance.getNumberProperty('non_existent_key');
    expect(value).toBeNull();
  });

  test('getNumberProperty returns null for a mismatched type', () => {
    const value = featureFlagInstance.getNumberProperty('string_prop');
    expect(value).toBeNull();
  });

  // - Test cases for getTimestampProperty
  test('getTimestampProperty correctly delegates to CampaignProperties', () => {
    const value = featureFlagInstance.getTimestampProperty('timestamp_prop');
    expect(value).toBe(1672531200000);
  });

  test('getTimestampProperty returns null for a non-existent key', () => {
    const value = featureFlagInstance.getTimestampProperty('non_existent_key');
    expect(value).toBeNull();
  });

  test('getTimestampProperty returns null for a mismatched type', () => {
    const value = featureFlagInstance.getTimestampProperty('string_prop');
    expect(value).toBeNull();
  });

  // - Test cases for getJSONProperty
  test('getJSONProperty correctly delegates to CampaignProperties', () => {
    const value = featureFlagInstance.getJSONProperty('json_prop');
    expect(value).toEqual({ key1: 'value1', key2: 42 });
  });

  test('getJSONProperty returns null for a non-existent key', () => {
    const value = featureFlagInstance.getJSONProperty('non_existent_key');
    expect(value).toBeNull();
  });

  test('getJSONProperty returns null for a mismatched type', () => {
    const value = featureFlagInstance.getJSONProperty('string_prop');
    expect(value).toBeNull();
  });

  // - Test cases for getImageProperty
  test('getImageProperty correctly delegates to CampaignProperties', () => {
    const value = featureFlagInstance.getImageProperty('image_prop');
    expect(value).toBe('https://example.com/image.png');
  });

  test('getImageProperty returns null for a non-existent key', () => {
    const value = featureFlagInstance.getImageProperty('non_existent_key');
    expect(value).toBeNull();
  });

  test('getImageProperty returns null for a mismatched type', () => {
    const value = featureFlagInstance.getImageProperty('string_prop');
    expect(value).toBeNull();
  });
});

// Test Braze.getBanner

jest.mock('../src/models/banner', () => {
    return {
        Banner: jest.fn().mockImplementation((data) => ({
            id: data ? data.id : null,
        })),
    };
});

describe('Braze.getBanner', () => {
    const testPlacementId = 'sdk-test-banner';
    const mockRawBannerData = {
        id: 'banner_id_123',
        placementId: testPlacementId,
        html: 'test html',
        expiresAt: 1672531200,
        properties: {}
    };

    // - Test successful retrieval and correct instance creation
    test('it resolves with a Banner instance on success', async () => {
        NativeBrazeReactModule.getBanner.mockResolvedValue(mockRawBannerData);
        const banner = await Braze.getBanner(testPlacementId);

        expect(NativeBrazeReactModule.getBanner).toBeCalledWith(testPlacementId);
        expect(Banner).toHaveBeenCalledWith(mockRawBannerData);
        expect(banner.id).toBe(mockRawBannerData.id);
    });

    // - Test no banner found on the native side
    test('it resolves with null if the native bridge returns null', async () => {
        NativeBrazeReactModule.getBanner.mockResolvedValue(null);
        const banner = await Braze.getBanner(testPlacementId);

        expect(NativeBrazeReactModule.getBanner).toBeCalledWith(testPlacementId);
        expect(banner).toBeNull();        
        expect(Banner).not.toHaveBeenCalled();
    });

    // - Test native bridge throws an error
    test('it resolves with null and logs an error if the bridge call fails', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const mockError = new Error('Native bridge timeout');
        NativeBrazeReactModule.getBanner.mockRejectedValue(mockError);
        const banner = await Braze.getBanner(testPlacementId);

        expect(NativeBrazeReactModule.getBanner).toBeCalledWith(testPlacementId);
        expect(console.error).toHaveBeenCalledWith("Error fetching banner:", mockError);
        expect(banner).toBeNull();

        console.error = originalError;
    });
});