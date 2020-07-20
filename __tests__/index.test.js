const ReactAppboy = require('../index');
const NativeModules = require('react-native').NativeModules;
const EventEmitter = require('EventEmitter');
const RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

/**
 * Mock the NativeEventEmitter as a normal JS EventEmitter.
 */
class NativeEventEmitter extends EventEmitter {
  constructor() {
    super(RCTDeviceEventEmitter.sharedSubscriber);
  }
}

jest.mock('NativeEventEmitter');

jest.mock('NativeModules', () => {
  return {
    AppboyReactBridge: {
      registerAndroidPushToken: jest.fn(),
      setFirstName: jest.fn(),
      setLastName: jest.fn(),
      setLanguage: jest.fn(),
      setEmail: jest.fn(),
      setPhoneNumber: jest.fn(),
      changeUser: jest.fn(),
      setSDKFlavor: jest.fn(),
      logCustomEvent: jest.fn(),
      logPurchase: jest.fn(),
      setCountry: jest.fn(),
      setHomeCity: jest.fn(),
      setAvatarImageUrl: jest.fn(),
      setDateOfBirth: jest.fn(),
      setTwitterData: jest.fn(),
      setFacebookData: jest.fn(),
      setAttributionData: jest.fn(),
      launchNewsFeed: jest.fn(),
      launchContentCards: jest.fn(),
      getContentCards: jest.fn(),
      logContentCardClicked: jest.fn(),
      logContentCardDismissed: jest.fn(),
      logContentCardImpression: jest.fn(),
      logContentCardsDisplayed: jest.fn(),
      requestFeedRefresh: jest.fn(),
      requestImmediateDataFlush: jest.fn(),
      enableSDK: jest.fn(),
      disableSDK: jest.fn(),
      wipeData: jest.fn(),
      setDateCustomUserAttribute: jest.fn(),
      setCustomUserAttributeArray: jest.fn(),
      setBoolCustomUserAttribute: jest.fn(),
      setStringCustomUserAttribute: jest.fn(),
      setIntCustomUserAttribute: jest.fn(),
      setDoubleCustomUserAttribute: jest.fn(),
      incrementCustomUserAttribute: jest.fn(),
      setGender: jest.fn(),
      setPushNotificationSubscriptionType: jest.fn(),
      setEmailNotificationSubscriptionType: jest.fn(),
      addToCustomAttributeArray: jest.fn(),
      removeFromCustomAttributeArray: jest.fn(),
      unsetCustomUserAttribute: jest.fn(),
      getCardCountForCategories: jest.fn(),
      getUnreadCardCountForCategories: jest.fn(),
      getInitialUrl: jest.fn(),
      getInstallTrackingId: jest.fn(),
      requestLocationInitialization: jest.fn(),
      requestGeofences: jest.fn(),
      setLocationCustomAttribute: jest.fn(),
      requestContentCardsRefresh: jest.fn(),
      hideCurrentInAppMessage: jest.fn(),
      logInAppMessageClicked: jest.fn(),
      logInAppMessageImpression: jest.fn(),
      logInAppMessageButtonClicked: jest.fn()
    }
  };
});

console.log = jest.fn();
testCallback = jest.fn();

const testInAppMessageJson = `{\"message\":\"body body\",\"type\":\"MODAL\",\"text_align_message\":\"CENTER\",\"click_action\":\"NONE\",\"message_close\":\"SWIPE\",\"extras\":{\"test\":\"123\",\"foo\":\"bar\"},\"header\":\"hello\",\"text_align_header\":\"CENTER\",\"image_url\":\"https:\\/\\/cdn-staging.braze.com\\/appboy\\/communication\\/marketing\\/slide_up\\/slide_up_message_parameters\\/images\\/5ba53198bf5cea446b153b77\\/0af410cf267a4686ac6cac571bd2be4da4c8e63c\\/original.jpg?1572663749\",\"image_style\":\"TOP\",\"btns\":[{\"id\":0,\"text\":\"button 1\",\"click_action\":\"URI\",\"uri\":\"https:\\/\\/www.google.com\",\"use_webview\":true,\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479},{\"id\":1,\"text\":\"button 2\",\"click_action\":\"NONE\",\"bg_color\":4279990479,\"text_color\":4294967295,\"border_color\":4279990479}],\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\"}`;

afterEach(() => {
  jest.clearAllMocks();
});

test('it calls AppboyReactBridge.registerAndroidPushToken', () => {
  const token = "some_token";
  ReactAppboy.registerAndroidPushToken(token);
  expect(NativeModules.AppboyReactBridge.registerAndroidPushToken).toBeCalledWith(token);
});

test('it calls AppboyReactBridge.setFirstName', () => {
  const first_name = "some_name";
  ReactAppboy.setFirstName(first_name);
  expect(NativeModules.AppboyReactBridge.setFirstName).toBeCalledWith(first_name);
});

test('it calls AppboyReactBridge.setLastName', () => {
  const last_name = "some_name";
  ReactAppboy.setLastName(last_name);
  expect(NativeModules.AppboyReactBridge.setLastName).toBeCalledWith(last_name);
});

test('it calls AppboyReactBridge.setLanguage', () => {
  const language = "to";
  ReactAppboy.setLanguage(language);
  expect(NativeModules.AppboyReactBridge.setLanguage).toBeCalledWith(language);
});

test('it calls AppboyReactBridge.setEmail', () => {
  const email = "some_email";
  ReactAppboy.setEmail(email);
  expect(NativeModules.AppboyReactBridge.setEmail).toBeCalledWith(email);
});

test('it calls AppboyReactBridge.setCountry', () => {
  const country = "some_country";
  ReactAppboy.setCountry(country);
  expect(NativeModules.AppboyReactBridge.setCountry).toBeCalledWith(country);
});

test('it calls AppboyReactBridge.setHomeCity', () => {
  const city = "some_city";
  ReactAppboy.setHomeCity(city);
  expect(NativeModules.AppboyReactBridge.setHomeCity).toBeCalledWith(city);
});

test('it calls AppboyReactBridge.setPhoneNumber', () => {
  const number = "555-867-5309";
  ReactAppboy.setPhoneNumber(number);
  expect(NativeModules.AppboyReactBridge.setPhoneNumber).toBeCalledWith(number);
});

test('it calls AppboyReactBridge.launchNewsFeed', () => {
  ReactAppboy.launchNewsFeed();
  expect(NativeModules.AppboyReactBridge.launchNewsFeed).toBeCalled();
});

test('it calls AppboyReactBridge.launchContentCards', () => {
  ReactAppboy.launchContentCards();
  expect(NativeModules.AppboyReactBridge.launchContentCards).toBeCalled();
});

test('it calls AppboyReactBridge.getContentCards', () => {
  ReactAppboy.getContentCards();
  expect(NativeModules.AppboyReactBridge.getContentCards).toBeCalled();
});

test('it calls AppboyReactBridge.logContentCardClicked', () => {
  const id = "1234";
  ReactAppboy.logContentCardClicked(id);
  expect(NativeModules.AppboyReactBridge.logContentCardClicked).toBeCalledWith(id);
});

test('it calls AppboyReactBridge.logContentCardDismissed', () => {
  const id = "1234";
  ReactAppboy.logContentCardDismissed(id);
  expect(NativeModules.AppboyReactBridge.logContentCardDismissed).toBeCalledWith(id);
});

test('it calls AppboyReactBridge.logContentCardImpression', () => {
  const id = "1234";
  ReactAppboy.logContentCardImpression(id);
  expect(NativeModules.AppboyReactBridge.logContentCardImpression).toBeCalledWith(id);
});

test('it calls AppboyReactBridge.logContentCardsDisplayed', () => {
  ReactAppboy.logContentCardsDisplayed();
  expect(NativeModules.AppboyReactBridge.logContentCardsDisplayed).toBeCalled();
});

test('it calls AppboyReactBridge.requestFeedRefresh', () => {
  ReactAppboy.requestFeedRefresh();
  expect(NativeModules.AppboyReactBridge.requestFeedRefresh).toBeCalled();
});

test('it calls AppboyReactBridge.requestImmediateDataFlush', () => {
  ReactAppboy.requestImmediateDataFlush();
  expect(NativeModules.AppboyReactBridge.requestImmediateDataFlush).toBeCalled();
});

test('it calls AppboyReactBridge.wipeData', () => {
  ReactAppboy.wipeData();
  expect(NativeModules.AppboyReactBridge.wipeData).toBeCalled();
});

test('it calls AppboyReactBridge.disableSDK', () => {
  ReactAppboy.disableSDK();
  expect(NativeModules.AppboyReactBridge.disableSDK).toBeCalled();
});

test('it calls AppboyReactBridge.enableSDK', () => {
  ReactAppboy.enableSDK();
  expect(NativeModules.AppboyReactBridge.enableSDK).toBeCalled();
});

test('it calls AppboyReactBridge.requestLocationInitialization', () => {
  ReactAppboy.requestLocationInitialization();
  expect(NativeModules.AppboyReactBridge.requestLocationInitialization).toBeCalled();
});

test('it calls AppboyReactBridge.requestGeofences', () => {
  const latitude = 40.7128;
  const longitude = 74.0060;
  ReactAppboy.requestGeofences(latitude, longitude);
  expect(NativeModules.AppboyReactBridge.requestGeofences).toBeCalledWith(latitude, longitude);
});

test('it calls AppboyReactBridge.setLocationCustomAttribute', () => {
  const key = "some_key";
  const latitude = 40.7128;
  const longitude = 74.0060;
  ReactAppboy.setLocationCustomAttribute(key, latitude, longitude, testCallback);
  expect(NativeModules.AppboyReactBridge.setLocationCustomAttribute).toBeCalledWith(key, latitude, longitude, testCallback);
});

test('it calls AppboyReactBridge.requestContentCardsRefresh', () => {
  ReactAppboy.requestContentCardsRefresh();
  expect(NativeModules.AppboyReactBridge.requestContentCardsRefresh).toBeCalled();
});

test('it calls AppboyReactBridge.setAvatarImageUrl', () => {
  const url = "braze.com";
  ReactAppboy.setAvatarImageUrl(url);
  expect(NativeModules.AppboyReactBridge.setAvatarImageUrl).toBeCalledWith(url);
});

test('it calls AppboyReactBridge.setDateOfBirth', () => {
  const year = 2011;
  const month = 11;
  const day = 23;
  ReactAppboy.setDateOfBirth(year, month, day);
  expect(NativeModules.AppboyReactBridge.setDateOfBirth).toBeCalledWith(year, month, day);
});

test('it calls AppboyReactBridge.changeUser', () => {
  const user_id = "some_id";
  ReactAppboy.changeUser(user_id);
  expect(NativeModules.AppboyReactBridge.setSDKFlavor).toBeCalled();
  expect(NativeModules.AppboyReactBridge.changeUser).toBeCalledWith(user_id);
});

test('it calls AppboyReactBridge.logCustomEvent', () => {
  const event_name = "event_name";
  const event_properties = "event_properties";
  ReactAppboy.logCustomEvent(event_name, event_properties);
  expect(NativeModules.AppboyReactBridge.setSDKFlavor).toBeCalled();
  expect(NativeModules.AppboyReactBridge.logCustomEvent).toBeCalledWith(event_name, event_properties);
});

test('it calls AppboyReactBridge.logPurchase', () => {
  const product_id = "product_id";
  const price = "price";
  const currency_code = "currency_code";
  const quantity = "quantity";
  const purchase_properties = "purchase_properties";
  ReactAppboy.logPurchase(product_id, price, currency_code, quantity, purchase_properties);
  expect(NativeModules.AppboyReactBridge.logPurchase).toBeCalledWith(product_id, price, currency_code, quantity, purchase_properties);
});

test('it calls AppboyReactBridge.setTwitterData', () => {
  const id = "some_id";
  const screen_name = "some_screen_name";
  const name = "some_name";
  const description = "some_description";
  const followers_count = 22;
  const friends_count = 33;
  const statuses_count = 44;
  const profile_image_url = "braze.com"
  ReactAppboy.setTwitterData(id, screen_name, name, description, followers_count, friends_count, statuses_count, profile_image_url);
  expect(NativeModules.AppboyReactBridge.setTwitterData).toBeCalledWith(id, screen_name, name, description, followers_count, friends_count, statuses_count, profile_image_url);
});

test('it does not call AppboyReactBridge.setTwitterData when required arguments are missing, and logs to the console', () => {
  let id = null;
  const screen_name = "some_screen_name";
  const name = "some_name";
  const description = "some_description";
  let followers_count = 22;
  let friends_count = 33;
  let statuses_count = 44;
  const profile_image_url = "braze.com"
  ReactAppboy.setTwitterData(id, screen_name, name, description, followers_count, friends_count, statuses_count, profile_image_url);
  id = "some_id";
  followers_count = null;
  ReactAppboy.setTwitterData(id, screen_name, name, description, followers_count, friends_count, statuses_count, profile_image_url);
  followers_count = 22;
  friends_count = null;
  ReactAppboy.setTwitterData(id, screen_name, name, description, followers_count, friends_count, statuses_count, profile_image_url);
  friends_count = 33;
  statuses_count = null;
  ReactAppboy.setTwitterData(id, screen_name, name, description, followers_count, friends_count, statuses_count, profile_image_url);
  expect(console.log).toHaveBeenCalledTimes(4);
  expect(NativeModules.AppboyReactBridge.setTwitterData).not.toHaveBeenCalled();
});

test('it calls AppboyReactBridge.setFacebookData', () => {
  const facebook_user_dictionary = "some_facebook_user_dictionary";
  const number_of_friends = 55;
  const likes = 600;
  ReactAppboy.setFacebookData(facebook_user_dictionary, number_of_friends, likes);
  expect(NativeModules.AppboyReactBridge.setFacebookData).toBeCalledWith(facebook_user_dictionary, number_of_friends, likes);
});

test('it does not call AppboyReactBridge.setFacebookData when required arguments are missing, and logs to the console', () => {
  const facebook_user_dictionary = "some_facebook_user_dictionary";
  const number_of_friends = null;
  const likes = 600;
  ReactAppboy.setFacebookData(facebook_user_dictionary, number_of_friends, likes);
  expect(console.log).toHaveBeenCalled();
  expect(NativeModules.AppboyReactBridge.setFacebookData).not.toHaveBeenCalled();
});

test('it calls AppboyReactBridge.setAttributionData', () => {
  const network = "some_network";
  const campaign = "some_campaign";
  const adGroup = "some_adGroup";
  const creative = "some_creative";
  ReactAppboy.setAttributionData(network, campaign, adGroup, creative);
  expect(NativeModules.AppboyReactBridge.setAttributionData).toBeCalledWith(network, campaign, adGroup, creative);
});

test('it calls AppboyReactBridge.setDateCustomUserAttribute', () => {
  const key = "some_key";
  const date = new Date('December 17, 1995 03:24:00');
  ReactAppboy.setCustomUserAttribute(key, date, testCallback);
  expect(NativeModules.AppboyReactBridge.setDateCustomUserAttribute).toBeCalledWith(key, Math.floor(date.getTime() / 1000), testCallback);
});

test('it calls AppboyReactBridge.setCustomUserAttributeArray', () => {
  const key = "some_key";
  const array = ['a','b'];
  ReactAppboy.setCustomUserAttribute(key, array, testCallback);
  expect(NativeModules.AppboyReactBridge.setCustomUserAttributeArray).toBeCalledWith(key, array, testCallback);
});

test('it calls AppboyReactBridge.setBoolCustomUserAttribute', () => {
  const key = "some_key";
  const bool_value = true;
  ReactAppboy.setCustomUserAttribute(key, bool_value, testCallback);
  expect(NativeModules.AppboyReactBridge.setBoolCustomUserAttribute).toBeCalledWith(key, bool_value, testCallback);
});

test('it calls AppboyReactBridge.setStringCustomUserAttribute', () => {
  const key = "some_key";
  const string_value = "some string";
  ReactAppboy.setCustomUserAttribute(key, string_value, testCallback);
  expect(NativeModules.AppboyReactBridge.setStringCustomUserAttribute).toBeCalledWith(key, string_value, testCallback);
});

test('it calls AppboyReactBridge.setIntCustomUserAttribute', () => {
  const key = "some_key";
  const int_value = 55;
  ReactAppboy.setCustomUserAttribute(key, int_value, testCallback);
  expect(NativeModules.AppboyReactBridge.setIntCustomUserAttribute).toBeCalledWith(key, int_value, testCallback);
});

test('it calls AppboyReactBridge.setDoubleCustomUserAttribute', () => {
  const key = "some_key";
  const double_value = 3.14;
  ReactAppboy.setCustomUserAttribute(key, double_value, testCallback);
  expect(NativeModules.AppboyReactBridge.setDoubleCustomUserAttribute).toBeCalledWith(key, double_value, testCallback);
});

test('it calls AppboyReactBridge.incrementCustomUserAttribute', () => {
  const key = "some_key";
  const value = 5;
  ReactAppboy.incrementCustomUserAttribute(key, value, testCallback);
  expect(NativeModules.AppboyReactBridge.incrementCustomUserAttribute).toBeCalledWith(key, value, testCallback);
});

test('it calls AppboyReactBridge.setGender', () => {
  const gender = "male";
  ReactAppboy.setGender(gender, testCallback);
  expect(NativeModules.AppboyReactBridge.setGender).toBeCalledWith(gender, testCallback);
});

test('it calls AppboyReactBridge.setPushNotificationSubscriptionType', () => {
  const sub_type = "some_sub_type";
  ReactAppboy.setPushNotificationSubscriptionType(sub_type, testCallback);
  expect(NativeModules.AppboyReactBridge.setPushNotificationSubscriptionType).toBeCalledWith(sub_type, testCallback);
});

test('it calls AppboyReactBridge.setEmailNotificationSubscriptionType', () => {
  const sub_type = "some_sub_type";
  ReactAppboy.setEmailNotificationSubscriptionType(sub_type, testCallback);
  expect(NativeModules.AppboyReactBridge.setEmailNotificationSubscriptionType).toBeCalledWith(sub_type, testCallback);
});

test('it calls AppboyReactBridge.addToCustomAttributeArray', () => {
  const key = "some_key";
  const value = "some_value"
  ReactAppboy.addToCustomUserAttributeArray(key, value, testCallback);
  expect(NativeModules.AppboyReactBridge.addToCustomAttributeArray).toBeCalledWith(key, value, testCallback);
});

test('it calls AppboyReactBridge.removeFromCustomAttributeArray', () => {
  const key = "some_key";
  const value = "some_value"
  ReactAppboy.removeFromCustomUserAttributeArray(key, value, testCallback);
  expect(NativeModules.AppboyReactBridge.removeFromCustomAttributeArray).toBeCalledWith(key, value, testCallback);
});

test('it calls AppboyReactBridge.unsetCustomUserAttribute', () => {
  const key = "some_key";
  ReactAppboy.unsetCustomUserAttribute(key, testCallback);
  expect(NativeModules.AppboyReactBridge.unsetCustomUserAttribute).toBeCalledWith(key, testCallback);
});

test('it calls AppboyReactBridge.getCardCountForCategories', () => {
  const category = "some_category";
  ReactAppboy.getCardCountForCategories(category, testCallback);
  expect(NativeModules.AppboyReactBridge.getCardCountForCategories).toBeCalledWith(category, testCallback);
});

test('it calls AppboyReactBridge.getUnreadCardCountForCategories', () => {
  const category = "some_category";
  ReactAppboy.getUnreadCardCountForCategories(category, testCallback);
  expect(NativeModules.AppboyReactBridge.getUnreadCardCountForCategories).toBeCalledWith(category, testCallback);
});

test('it calls AppboyReactBridge.getInitialUrl if defined', () => {
  NativeModules.AppboyReactBridge.getInitialUrl.mockImplementation((callback) => {
    callback(null, "some_data");
  });
  ReactAppboy.getInitialURL(testCallback);
  expect(NativeModules.AppboyReactBridge.getInitialUrl).toBeCalled();
  expect(testCallback).toBeCalledWith("some_data");
});

test('it calls AppboyReactBridge.getInstallTrackingId', () => {
  NativeModules.AppboyReactBridge.getInstallTrackingId.mockImplementation((callback) => {
    callback(null, "some_tracking_id");
  });
  ReactAppboy.getInstallTrackingId(testCallback);
  expect(NativeModules.AppboyReactBridge.getInstallTrackingId).toBeCalled();
  expect(testCallback).toBeCalledWith(null, "some_tracking_id");
});

test('it calls the callback with null and logs the error if AppboyReactBridge.getInitialUrl returns an error', () => {
  NativeModules.AppboyReactBridge.getInitialUrl.mockImplementation((callback) => {
    callback("error", null);
  });
  ReactAppboy.getInitialURL(testCallback);
  expect(NativeModules.AppboyReactBridge.getInitialUrl).toBeCalled();
  expect(testCallback).toBeCalledWith(null);
  expect(console.log).toBeCalledWith("error");
});

test('it calls the callback with null if AppboyReactBridge.getInitialUrl is not defined', () => {
  NativeModules.AppboyReactBridge.getInitialUrl = null;
  ReactAppboy.getInitialURL(testCallback);
  expect(testCallback).toBeCalledWith(null);
});

test('it calls AppboyReactBridge.hideCurrentInAppMessage', () => {
  ReactAppboy.hideCurrentInAppMessage();
  expect(NativeModules.AppboyReactBridge.hideCurrentInAppMessage).toBeCalled();
});

test('it adds a listener', () => {
  let counter = 0;
  let testFunction = () => {counter += 1};
  let testEvent = ReactAppboy.Events.CONTENT_CARDS_UPDATED;
  const nativeEmitter = new NativeEventEmitter();
  ReactAppboy.addListener(testEvent, testFunction);
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
  testButtons.push(new ReactAppboy.BrazeButton(JSON.parse(testButton0)));
  testButtons.push(new ReactAppboy.BrazeButton(JSON.parse(testButton1)));
  const testJson = `{\"message\":\"${testMessageBody}\",\"type\":\"${testMessageType}\",\"text_align_message\":\"CENTER\",\"click_action\":\"${testClickAction}\",\"message_close\":\"SWIPE\",\"extras\":${testExtras},\"header\":\"${testHeader}\",\"text_align_header\":\"CENTER\",\"image_url\":\"${testImageUrl}\",\"image_style\":\"TOP\",\"btns\":${testButtonString},\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\",\"uri\":\"${testUri}\",\"zipped_assets_url\":\"${testZippedAssetsUrl}\",\"duration\":${testDuration},\"message_close\":\"${testDismissType}\",\"use_webview\":${testUseWebView}}`
  const inAppMessage = new ReactAppboy.BrazeInAppMessage(testJson);
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
  const testJson = `{}`;
  const inAppMessage = new ReactAppboy.BrazeInAppMessage(testJson);
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
});

it('returns the original JSON when calling BrazeInAppMessage.toString()', () => {
  const inAppMessage = new ReactAppboy.BrazeInAppMessage(testInAppMessageJson);
  expect(inAppMessage.toString()).toBe(testInAppMessageJson);
});

test('it calls AppboyReactBridge.logInAppMessageClicked', () => {
  const inAppMessage = new ReactAppboy.BrazeInAppMessage(testInAppMessageJson);
  ReactAppboy.logInAppMessageClicked(inAppMessage);
  expect(NativeModules.AppboyReactBridge.logInAppMessageClicked).toBeCalledWith(testInAppMessageJson);
});

test('it calls AppboyReactBridge.logInAppMessageImpression', () => {
  const inAppMessage = new ReactAppboy.BrazeInAppMessage(testInAppMessageJson);
  ReactAppboy.logInAppMessageImpression(inAppMessage);
  expect(NativeModules.AppboyReactBridge.logInAppMessageImpression).toBeCalledWith(testInAppMessageJson);
});

test('it calls AppboyReactBridge.logInAppMessageButtonClicked', () => {
  const inAppMessage = new ReactAppboy.BrazeInAppMessage(testInAppMessageJson);
  const testId = 23;
  ReactAppboy.logInAppMessageButtonClicked(inAppMessage, testId);
  expect(NativeModules.AppboyReactBridge.logInAppMessageButtonClicked).toBeCalledWith(testInAppMessageJson, testId);
});

it('instantiates a BrazeButton object', () => {
  const testId = 53;
  const testClickAction = 'URI';
  const testText = 'some text';
  const testUri = "https:\\/\\/www.sometesturi.com";
  const testUseWebView = true;
  const testButtonJson = `{\"id\":${testId},\"text\":\"${testText}\",\"click_action\":\"${testClickAction}\",\"uri\":\"${testUri}\",\"use_webview\":${testUseWebView},\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479}`;
  const button = new ReactAppboy.BrazeButton(JSON.parse(testButtonJson));
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
  const defaultText= '';
  const defaultUseWebView = false;
  const defaultClickAction = 'NONE';
  const defaultId = 0;
  const inAppMessage = new ReactAppboy.BrazeButton(`{}`);
  expect(inAppMessage.uri).toBe(defaultUri);
  expect(inAppMessage.useWebView).toBe(defaultUseWebView);
  expect(inAppMessage.text).toBe(defaultText);
  expect(inAppMessage.clickAction).toBe(defaultClickAction.toLowerCase());
  expect(inAppMessage.id).toBe(defaultId);
});