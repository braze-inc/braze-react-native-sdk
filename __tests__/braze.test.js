jest.mock('../src/models/banner', () => {
  const mockBannerFn = jest.fn().mockImplementation((data) => ({
    id: data ? data.id : null,
  }));
  return {
    Banner: mockBannerFn,
  };
});

const NativeEventEmitter = require('react-native').NativeEventEmitter;
const NativeBrazeReactModule = require('../src/specs/NativeBrazeReactModule').default;
const { CampaignProperties } = require('../src/models/campaign-properties');
const { FeatureFlag } = require('../src/models/feature-flag');

import Braze from '../src/index';
import { Platform } from 'react-native';

console.log = jest.fn();
const testCallback = jest.fn();

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

afterEach(() => {
  jest.clearAllMocks();
});

describe('Braze - Core Methods', () => {
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

  test('it calls BrazeReactBridge.initialize with apiKey and endpoint', () => {
    const apiKey = 'test-api-key';
    const endpoint = 'test.endpoint.com';
    Braze.initialize(apiKey, endpoint);
    expect(NativeBrazeReactModule.initialize).toBeCalledWith(apiKey, endpoint);
  });

  test('it calls BrazeReactBridge.getUserId with callback', () => {
    const mockCallback = jest.fn();
    Braze.getUserId(mockCallback);
    expect(NativeBrazeReactModule.getUserId).toBeCalledWith(mockCallback);
  });
});

describe('Braze - User String Attributes', () => {
  describe.each([
    ['setFirstName', 'some_name'],
    ['setLastName', 'some_name'],
    ['setLanguage', 'to'],
    ['setEmail', 'some_email'],
    ['setCountry', 'some_country'],
    ['setHomeCity', 'some_city'],
    ['setPhoneNumber', '555-867-5309'],
  ])('user string attribute setters: %s', (method, value) => {
    test(`calls BrazeReactBridge.${method} with value`, () => {
      Braze[method](value);
      expect(NativeBrazeReactModule[method]).toBeCalledWith(value);
    });

    test(`calls BrazeReactBridge.${method} with null`, () => {
      Braze[method](null);
      expect(NativeBrazeReactModule[method]).toBeCalledWith(null);
    });
  });
});

describe('Braze - User Management', () => {
  test('it calls BrazeReactBridge.changeUser', () => {
    const user_id = "some_id";
    Braze.changeUser(user_id);
    expect(NativeBrazeReactModule.changeUser).toBeCalledWith(user_id, null);
  });

  test('it calls BrazeReactBridge.changeUser with signature', () => {
    const user_id = "some_id";
    const signature = "some_signature";
    Braze.changeUser(user_id, signature);
    expect(NativeBrazeReactModule.changeUser).toBeCalledWith(user_id, signature);
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

  test('it calls BrazeReactBridge.setDateOfBirth', () => {
    const year = 2011;
    const month = 11;
    const day = 23;
    Braze.setDateOfBirth(year, month, day);
    expect(NativeBrazeReactModule.setDateOfBirth).toBeCalledWith(year, month, day);
  });
});

describe('Braze - Custom User Attributes', () => {
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

  describe.each([
    ['setBoolCustomUserAttribute', true],
    ['setStringCustomUserAttribute', 'some string'],
    ['setIntCustomUserAttribute', 55],
    ['setIntCustomUserAttribute', 42],
    ['setDoubleCustomUserAttribute', 3.14],
  ])('custom attribute type setters: %s', (expectedMethod, value) => {
    test(`calls BrazeReactBridge.${expectedMethod}`, () => {
      const key = 'some_key';
      Braze.setCustomUserAttribute(key, value, testCallback);
      expect(NativeBrazeReactModule[expectedMethod]).toBeCalledWith(key, value, testCallback);
    });
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

  test('it calls BrazeReactBridge.setCustomUserAttribute with invalid array', () => {
    const key = 'some_key';
    const invalidArray = [1, 2, 3]; // Invalid - should be all strings or all objects
    const mockCallback = jest.fn();
    console.log = jest.fn();

    Braze.setCustomUserAttribute(key, invalidArray, mockCallback);

    expect(console.log).toBeCalledWith(
      `User attribute ${invalidArray} was not a valid array. Custom attribute arrays can only contain all strings or all objects.`
    );
  });
});

describe('Braze - Subscription Groups', () => {
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
});

describe('Braze - Analytics', () => {
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

  test('it calls BrazeReactBridge.requestImmediateDataFlush', () => {
    Braze.requestImmediateDataFlush();
    expect(NativeBrazeReactModule.requestImmediateDataFlush).toBeCalled();
  });
});

describe('Braze - SDK Control', () => {
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
});

describe('Braze - Location', () => {
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

  describe.each([
    ['all params', 24.0, 25.0, 26.0, 24.0, 25.0, 26.0],
    ['altitude and accuracies null', null, null, null, 0, -1, -1],
    ['altitude and verticalAccuracy null', null, 25.0, null, 0, 25.0, -1],
    ['verticalAccuracy null', 24.0, 25.0, null, 24.0, 25.0, -1],
  ])('setLastKnownLocation with %s', (_, altitude, horizontalAccuracy, verticalAccuracy, expectedAlt, expectedHoriz, expectedVert) => {
    test('calls BrazeReactBridge.setLastKnownLocation', () => {
      const latitude = 40.7128;
      const longitude = 74.0060;
      Braze.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy);
      expect(NativeBrazeReactModule.setLastKnownLocation).toBeCalledWith(latitude, longitude, expectedAlt, expectedHoriz, expectedVert);
    });
  });
});

describe('Braze - Content Cards', () => {
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

  test('it calls BrazeReactBridge.requestContentCardsRefresh', () => {
    Braze.requestContentCardsRefresh();
    expect(NativeBrazeReactModule.requestContentCardsRefresh).toBeCalled();
  });

  test('it calls BrazeReactBridge.processContentCardClickAction', () => {
    const id = "card_123";
    Braze.processContentCardClickAction(id);
    expect(NativeBrazeReactModule.processContentCardClickAction).toBeCalledWith(id);
  });

  test('it calls BrazeReactBridge.processContentCardClickAction with empty string', () => {
    const id = "";
    Braze.processContentCardClickAction(id);
    expect(NativeBrazeReactModule.processContentCardClickAction).toBeCalledWith(id);
  });
});

describe('Braze - Banners', () => {
  test('it calls BrazeReactBridge.getBanner', () => {
    Braze.getBanner("some_banner_id");
    expect(NativeBrazeReactModule.getBanner).toBeCalledWith("some_banner_id");
  });

  test('it calls BrazeReactBridge.requestBannersRefresh', () => {
    Braze.requestBannersRefresh(["sdk-test-1", "sdk-test-2"]);
    expect(NativeBrazeReactModule.requestBannersRefresh).toBeCalledWith(["sdk-test-1", "sdk-test-2"]);
  });

  test('it calls BrazeReactBridge.logBannerImpression', () => {
    const placementId = "test_placement";
    Braze.logBannerImpression(placementId);
    expect(NativeBrazeReactModule.logBannerImpression).toBeCalledWith(placementId);
  });

  describe.each([
    ['null buttonId', null],
    ['valid buttonId', 'button_123'],
  ])('logBannerClick with %s', (_, buttonId) => {
    test('calls BrazeReactBridge.logBannerClick', () => {
      const placementId = "test_placement";
      Braze.logBannerClick(placementId, buttonId);
      expect(NativeBrazeReactModule.logBannerClick).toBeCalledWith(placementId, buttonId);
    });
  });

  describe('Braze.getBanner', () => {
    const testPlacementId = 'sdk-test-banner';
    const mockRawBannerData = {
      trackingId: 'banner_id_123',
      placementId: testPlacementId,
      html: 'test html',
      expiresAt: 1672531200,
      properties: {}
    };

    test('it resolves with a Banner instance on success', async () => {
      NativeBrazeReactModule.getBanner.mockResolvedValue(mockRawBannerData);
      const banner = await Braze.getBanner(testPlacementId);

      expect(NativeBrazeReactModule.getBanner).toBeCalledWith(testPlacementId);
      expect(banner).not.toBeNull();
      expect(typeof banner).toBe('object');
    });

    test('it resolves with null if the native bridge returns null', async () => {
      NativeBrazeReactModule.getBanner.mockResolvedValue(null);
      const banner = await Braze.getBanner(testPlacementId);

      expect(NativeBrazeReactModule.getBanner).toBeCalledWith(testPlacementId);
      expect(banner).toBeNull();
    });

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
});

describe('Braze - Feature Flags', () => {
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

  describe.each([
    ['getFeatureFlagBooleanProperty'],
    ['getFeatureFlagStringProperty'],
    ['getFeatureFlagNumberProperty'],
    ['getFeatureFlagTimestampProperty'],
    ['getFeatureFlagJSONProperty'],
    ['getFeatureFlagImageProperty'],
  ])('feature flag property getter: %s', (methodName) => {
    test(`calls BrazeReactBridge.${methodName}`, () => {
      Braze[methodName]('id', 'key');
      expect(NativeBrazeReactModule[methodName]).toBeCalled();
    });
  });
});

describe('Braze - In-App Messages', () => {
  describe.each([
    ['true', true, true],
    ['false', false, false],
    ['null', null, false],
    ['undefined', undefined, false],
  ])('subscribeToInAppMessage with useBrazeUI %s', (_, useBrazeUI, expectedFlag) => {
    test('calls BrazeReactBridge.subscribeToInAppMessage with correct flag', () => {
      Braze.subscribeToInAppMessage(useBrazeUI, testCallback);
      expect(NativeBrazeReactModule.subscribeToInAppMessage).toBeCalledWith(expectedFlag, testCallback);
    });
  });

  test('it calls BrazeReactBridge.subscribeToInAppMessage with non-function subscriber', () => {
    Braze.subscribeToInAppMessage(true, "not_a_function");
    expect(NativeBrazeReactModule.subscribeToInAppMessage).toBeCalledWith(true, "not_a_function");
  });

  test('it calls BrazeReactBridge.hideCurrentInAppMessage', () => {
    Braze.hideCurrentInAppMessage();
    expect(NativeBrazeReactModule.hideCurrentInAppMessage).toBeCalled();
  });
});

describe('Braze - Push Notifications', () => {
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

  test('it calls BrazeReactBridge.getInitialPushPayload on Android', () => {
    const platform = Platform.OS;
    Platform.OS = 'android';
    NativeBrazeReactModule.getInitialPushPayload.mockImplementation((callback) => {
      callback(null, testPushPayloadJson);
    });
    Braze.getInitialPushPayload(testCallback);
    expect(NativeBrazeReactModule.getInitialPushPayload).toBeCalled();
    expect(testCallback).toBeCalledWith(testPushPayloadJson);
    Platform.OS = platform;
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
  });

  test('it calls BrazeReactBridge.requestPushPermission with null options', () => {
    Braze.requestPushPermission(null);
    const expectedOptions = {
      "alert": true,
      "badge": true,
      "sound": true,
      "provisional": false
    };
    expect(NativeBrazeReactModule.requestPushPermission).toBeCalledWith(expectedOptions);
  });
});

describe('Braze - Tracking Properties', () => {
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

  test('it calls BrazeReactBridge.updateTrackingPropertyAllowList with invalid adding array', () => {
    console.log = jest.fn();
    const allowList = {
      adding: [123, 456], // Invalid - should be strings
    };
    Braze.updateTrackingPropertyAllowList(allowList);
    expect(console.log).toHaveBeenCalledWith("'adding' property must be an array of strings. Setting array to empty.");
    expect(NativeBrazeReactModule.updateTrackingPropertyAllowList).toBeCalledWith({
      adding: []
    });
  });

  test('it calls BrazeReactBridge.updateTrackingPropertyAllowList with invalid removing array', () => {
    console.log = jest.fn();
    const allowList = {
      removing: 'not_an_array', // Not an array
    };
    Braze.updateTrackingPropertyAllowList(allowList);
    expect(console.log).toHaveBeenCalledWith("'removing' property must be an array of strings. Setting array to empty.");
    expect(NativeBrazeReactModule.updateTrackingPropertyAllowList).toBeCalledWith({
      removing: []
    });
  });

  test('it calls BrazeReactBridge.updateTrackingPropertyAllowList with invalid addingCustomEvents array', () => {
    console.log = jest.fn();
    const allowList = {
      addingCustomEvents: { invalid: 'object' },
    };
    Braze.updateTrackingPropertyAllowList(allowList);
    expect(console.log).toHaveBeenCalledWith("'addingCustomEvents' property must be an array of strings. Setting array to empty.");
    expect(NativeBrazeReactModule.updateTrackingPropertyAllowList).toBeCalledWith({
      addingCustomEvents: []
    });
  });

  test('it calls BrazeReactBridge.updateTrackingPropertyAllowList with invalid removingCustomEvents array', () => {
    console.log = jest.fn();
    const allowList = {
      removingCustomEvents: ['valid', 123],
    };
    Braze.updateTrackingPropertyAllowList(allowList);
    expect(console.log).toHaveBeenCalledWith("'removingCustomEvents' property must be an array of strings. Setting array to empty.");
  });

  test('it calls BrazeReactBridge.updateTrackingPropertyAllowList with invalid addingCustomAttributes array', () => {
    console.log = jest.fn();
    const allowList = {
      addingCustomAttributes: true,
    };
    Braze.updateTrackingPropertyAllowList(allowList);
    expect(console.log).toHaveBeenCalledWith("'addingCustomAttributes' property must be an array of strings. Setting array to empty.");
  });

  test('it calls BrazeReactBridge.updateTrackingPropertyAllowList with invalid removingCustomAttributes array', () => {
    console.log = jest.fn();
    const allowList = {
      removingCustomAttributes: ['valid', null, 'another'],
    };
    Braze.updateTrackingPropertyAllowList(allowList);
    expect(console.log).toHaveBeenCalledWith("'removingCustomAttributes' property must be an array of strings. Setting array to empty.");
  });
});

describe('Braze.isValidTrackingPropertyArray', () => {
  describe.each([
    ['valid string array', ['property1', 'property2', 'property3'], true],
    ['empty array', [], true],
    ['single string array', ['property1'], true],
    ['array with non-string elements', ['property1', 123, 'property3'], false],
    ['array with boolean', ['property1', true, 'property3'], false],
    ['array with null', ['property1', null, 'property3'], false],
    ['array with object', ['property1', {}, 'property3'], false],
    ['non-array string', 'not_an_array', false],
    ['null', null, false],
    ['undefined', undefined, false],
    ['object', { property1: 'value' }, false],
  ])('%s', (description, input, expected) => {
    test(`returns ${expected}`, () => {
      const result = Braze.isValidTrackingPropertyArray(input);
      expect(result).toBe(expected);
    });
  });
});

describe('Braze - Event Listeners', () => {
  test('it adds a listener', () => {
    let counter = 0;
    let testFunction = () => { counter += 1 };
    let testEvent = Braze.Events.CONTENT_CARDS_UPDATED;
    const nativeEmitter = new NativeEventEmitter();
    Braze.addListener(testEvent, testFunction);
    nativeEmitter.emit(testEvent);
    expect(counter).toBe(1);
  });

  test('it adds a listener on Android platform', () => {
    const platform = Platform.OS;
    Platform.OS = 'android';
    NativeBrazeReactModule.addListener = jest.fn();
    let testFunction = () => {};
    let testEvent = Braze.Events.IN_APP_MESSAGE_RECEIVED;

    Braze.addListener(testEvent, testFunction);

    expect(NativeBrazeReactModule.addListener).toBeCalledWith(testEvent);

    Platform.OS = platform;
    delete NativeBrazeReactModule.addListener;
  });
});
