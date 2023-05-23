const NativeModules = require('react-native').NativeModules;
const NativeEventEmitter = require('react-native').NativeEventEmitter;

import Braze from '../src/index';

console.log = jest.fn();
const testCallback = jest.fn();

const testInAppMessageJson = `{\"message\":\"body body\",\"type\":\"MODAL\",\"text_align_message\":\"CENTER\",\"click_action\":\"NONE\",\"message_close\":\"SWIPE\",\"extras\":{\"test\":\"123\",\"foo\":\"bar\"},\"header\":\"hello\",\"text_align_header\":\"CENTER\",\"image_url\":\"https:\\/\\/cdn-staging.braze.com\\/appboy\\/communication\\/marketing\\/slide_up\\/slide_up_message_parameters\\/images\\/5ba53198bf5cea446b153b77\\/0af410cf267a4686ac6cac571bd2be4da4c8e63c\\/original.jpg?1572663749\",\"image_style\":\"TOP\",\"btns\":[{\"id\":0,\"text\":\"button 1\",\"click_action\":\"URI\",\"uri\":\"https:\\/\\/www.google.com\",\"use_webview\":true,\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479},{\"id\":1,\"text\":\"button 2\",\"click_action\":\"NONE\",\"bg_color\":4279990479,\"text_color\":4294967295,\"border_color\":4279990479}],\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\"}`;

afterEach(() => {
  jest.clearAllMocks();
});

test('it calls BrazeReactBridge.registerAndroidPushToken', () => {
  const token = "some_token";
  Braze.registerAndroidPushToken(token);
  expect(NativeModules.BrazeReactBridge.registerAndroidPushToken).toBeCalledWith(token);
});

test('it calls BrazeReactBridge.setGoogleAdvertisingId', () => {
  const googleAdvertisingId = "some_ga_id";
  const adTrackingEnabled = true;
  Braze.setGoogleAdvertisingId(googleAdvertisingId, adTrackingEnabled);
  expect(NativeModules.BrazeReactBridge.setGoogleAdvertisingId).toBeCalledWith(googleAdvertisingId, adTrackingEnabled);
});

test('it calls BrazeReactBridge.setFirstName', () => {
  const first_name = "some_name";
  Braze.setFirstName(first_name);
  expect(NativeModules.BrazeReactBridge.setFirstName).toBeCalledWith(first_name);
});

test('it calls BrazeReactBridge.setLastName', () => {
  const last_name = "some_name";
  Braze.setLastName(last_name);
  expect(NativeModules.BrazeReactBridge.setLastName).toBeCalledWith(last_name);
});

test('it calls BrazeReactBridge.setLanguage', () => {
  const language = "to";
  Braze.setLanguage(language);
  expect(NativeModules.BrazeReactBridge.setLanguage).toBeCalledWith(language);
});

test('it calls BrazeReactBridge.setEmail', () => {
  const email = "some_email";
  Braze.setEmail(email);
  expect(NativeModules.BrazeReactBridge.setEmail).toBeCalledWith(email);
});

test('it calls BrazeReactBridge.setCountry', () => {
  const country = "some_country";
  Braze.setCountry(country);
  expect(NativeModules.BrazeReactBridge.setCountry).toBeCalledWith(country);
});

test('it calls BrazeReactBridge.setHomeCity', () => {
  const city = "some_city";
  Braze.setHomeCity(city);
  expect(NativeModules.BrazeReactBridge.setHomeCity).toBeCalledWith(city);
});

test('it calls BrazeReactBridge.setPhoneNumber', () => {
  const number = "555-867-5309";
  Braze.setPhoneNumber(number);
  expect(NativeModules.BrazeReactBridge.setPhoneNumber).toBeCalledWith(number);
});

test('it calls BrazeReactBridge.requestFeedRefresh', () => {
  Braze.requestFeedRefresh();
  expect(NativeModules.BrazeReactBridge.requestFeedRefresh).toBeCalled();
});

test('it calls BrazeReactBridge.launchNewsFeed', () => {
  Braze.launchNewsFeed();
  expect(NativeModules.BrazeReactBridge.launchNewsFeed).toBeCalled();
});

test('it calls BrazeReactBridge.getNewsFeedCards', () => {
  Braze.getNewsFeedCards();
  expect(NativeModules.BrazeReactBridge.getNewsFeedCards).toBeCalled();
});

test('it calls BrazeReactBridge.logNewsFeedCardClicked', () => {
  const id = "1234";
  Braze.logNewsFeedCardClicked(id);
  expect(NativeModules.BrazeReactBridge.logNewsFeedCardClicked).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.logNewsFeedCardImpression', () => {
  const id = "1234";
  Braze.logNewsFeedCardImpression(id);
  expect(NativeModules.BrazeReactBridge.logNewsFeedCardImpression).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.launchContentCards', () => {
  Braze.launchContentCards();
  expect(NativeModules.BrazeReactBridge.launchContentCards).toBeCalled();
});

test('it calls BrazeReactBridge.getContentCards', () => {
  Braze.getContentCards();
  expect(NativeModules.BrazeReactBridge.getContentCards).toBeCalled();
});

test('it calls BrazeReactBridge.logContentCardClicked', () => {
  const id = "1234";
  Braze.logContentCardClicked(id);
  expect(NativeModules.BrazeReactBridge.logContentCardClicked).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.logContentCardDismissed', () => {
  const id = "1234";
  Braze.logContentCardDismissed(id);
  expect(NativeModules.BrazeReactBridge.logContentCardDismissed).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.logContentCardImpression', () => {
  const id = "1234";
  Braze.logContentCardImpression(id);
  expect(NativeModules.BrazeReactBridge.logContentCardImpression).toBeCalledWith(id);
});

test('it calls BrazeReactBridge.requestImmediateDataFlush', () => {
  Braze.requestImmediateDataFlush();
  expect(NativeModules.BrazeReactBridge.requestImmediateDataFlush).toBeCalled();
});

test('it calls BrazeReactBridge.wipeData', () => {
  Braze.wipeData();
  expect(NativeModules.BrazeReactBridge.wipeData).toBeCalled();
});

test('it calls BrazeReactBridge.disableSDK', () => {
  Braze.disableSDK();
  expect(NativeModules.BrazeReactBridge.disableSDK).toBeCalled();
});

test('it calls BrazeReactBridge.enableSDK', () => {
  Braze.enableSDK();
  expect(NativeModules.BrazeReactBridge.enableSDK).toBeCalled();
});

test('it calls BrazeReactBridge.requestLocationInitialization', () => {
  Braze.requestLocationInitialization();
  expect(NativeModules.BrazeReactBridge.requestLocationInitialization).toBeCalled();
});

test('it calls BrazeReactBridge.requestGeofences', () => {
  const latitude = 40.7128;
  const longitude = 74.0060;
  Braze.requestGeofences(latitude, longitude);
  expect(NativeModules.BrazeReactBridge.requestGeofences).toBeCalledWith(latitude, longitude);
});

test('it calls BrazeReactBridge.setLocationCustomAttribute', () => {
  const key = "some_key";
  const latitude = 40.7128;
  const longitude = 74.0060;
  Braze.setLocationCustomAttribute(key, latitude, longitude, testCallback);
  expect(NativeModules.BrazeReactBridge.setLocationCustomAttribute).toBeCalledWith(key, latitude, longitude, testCallback);
});

test('it calls BrazeReactBridge.requestContentCardsRefresh', () => {
  Braze.requestContentCardsRefresh();
  expect(NativeModules.BrazeReactBridge.requestContentCardsRefresh).toBeCalled();
});

test('it calls BrazeReactBridge.setDateOfBirth', () => {
  const year = 2011;
  const month = 11;
  const day = 23;
  Braze.setDateOfBirth(year, month, day);
  expect(NativeModules.BrazeReactBridge.setDateOfBirth).toBeCalledWith(year, month, day);
});

test('it calls BrazeReactBridge.changeUser', () => {
  const user_id = "some_id";
  Braze.changeUser(user_id);
  expect(NativeModules.BrazeReactBridge.changeUser).toBeCalledWith(user_id, null);
});

test('it calls BrazeReactBridge.setSdkAuthenticationSignature', () => {
  const signature = "signature";
  Braze.setSdkAuthenticationSignature(signature);
  expect(NativeModules.BrazeReactBridge.setSdkAuthenticationSignature).toBeCalledWith(signature);
});

test('it calls BrazeReactBridge.addAlias', () => {
  const aliasName = "name";
  const aliasLabel = "label";
  Braze.addAlias(aliasName, aliasLabel);
  expect(NativeModules.BrazeReactBridge.addAlias).toBeCalledWith(aliasName, aliasLabel);
});

test('it calls BrazeReactBridge.logCustomEvent', () => {
  const event_name = "event_name";
  const event_properties = "event_properties";
  Braze.logCustomEvent(event_name, event_properties);
  expect(NativeModules.BrazeReactBridge.logCustomEvent).toBeCalledWith(event_name, event_properties);
});

test('it calls BrazeReactBridge.logPurchase', () => {
  const product_id = "product_id";
  const price = "price";
  const currency_code = "currency_code";
  const quantity = "quantity";
  const purchase_properties = "purchase_properties";
  Braze.logPurchase(product_id, price, currency_code, quantity, purchase_properties);
  expect(NativeModules.BrazeReactBridge.logPurchase).toBeCalledWith(product_id, price, currency_code, quantity, purchase_properties);
});

test('it calls BrazeReactBridge.setAttributionData', () => {
  const network = "some_network";
  const campaign = "some_campaign";
  const adGroup = "some_adGroup";
  const creative = "some_creative";
  Braze.setAttributionData(network, campaign, adGroup, creative);
  expect(NativeModules.BrazeReactBridge.setAttributionData).toBeCalledWith(network, campaign, adGroup, creative);
});

test('it calls BrazeReactBridge.setDateCustomUserAttribute', () => {
  const key = "some_key";
  const date = new Date('December 17, 1995 03:24:00');
  Braze.setCustomUserAttribute(key, date, testCallback);
  expect(NativeModules.BrazeReactBridge.setDateCustomUserAttribute).toBeCalledWith(key, Math.floor(date.getTime() / 1000), testCallback);
});

test('it calls BrazeReactBridge.setCustomUserAttributeArray', () => {
  const key = "some_key";
  const array = ['a', 'b'];
  Braze.setCustomUserAttribute(key, array, testCallback);
  expect(NativeModules.BrazeReactBridge.setCustomUserAttributeArray).toBeCalledWith(key, array, testCallback);
});

test('it calls BrazeReactBridge.setBoolCustomUserAttribute', () => {
  const key = "some_key";
  const bool_value = true;
  Braze.setCustomUserAttribute(key, bool_value, testCallback);
  expect(NativeModules.BrazeReactBridge.setBoolCustomUserAttribute).toBeCalledWith(key, bool_value, testCallback);
});

test('it calls BrazeReactBridge.setStringCustomUserAttribute', () => {
  const key = "some_key";
  const string_value = "some string";
  Braze.setCustomUserAttribute(key, string_value, testCallback);
  expect(NativeModules.BrazeReactBridge.setStringCustomUserAttribute).toBeCalledWith(key, string_value, testCallback);
});

test('it calls BrazeReactBridge.setIntCustomUserAttribute', () => {
  const key = "some_key";
  const int_value = 55;
  Braze.setCustomUserAttribute(key, int_value, testCallback);
  expect(NativeModules.BrazeReactBridge.setIntCustomUserAttribute).toBeCalledWith(key, int_value, testCallback);
});

test('it calls BrazeReactBridge.setDoubleCustomUserAttribute', () => {
  const key = "some_key";
  const double_value = 3.14;
  Braze.setCustomUserAttribute(key, double_value, testCallback);
  expect(NativeModules.BrazeReactBridge.setDoubleCustomUserAttribute).toBeCalledWith(key, double_value, testCallback);
});

test('it calls BrazeReactBridge.incrementCustomUserAttribute', () => {
  const key = "some_key";
  const value = 5;
  Braze.incrementCustomUserAttribute(key, value, testCallback);
  expect(NativeModules.BrazeReactBridge.incrementCustomUserAttribute).toBeCalledWith(key, value, testCallback);
});

test('it calls BrazeReactBridge.setGender', () => {
  const gender = "male";
  Braze.setGender(gender, testCallback);
  expect(NativeModules.BrazeReactBridge.setGender).toBeCalledWith(gender, testCallback);
});

test('it calls BrazeReactBridge.addToSubscriptionGroup', () => {
  const groupId = "some_group_id";
  Braze.addToSubscriptionGroup(groupId, testCallback);
  expect(NativeModules.BrazeReactBridge.addToSubscriptionGroup).toBeCalledWith(groupId, testCallback);
});

test('it calls BrazeReactBridge.removeFromSubscriptionGroup', () => {
  const groupId = "some_group_id";
  Braze.removeFromSubscriptionGroup(groupId, testCallback);
  expect(NativeModules.BrazeReactBridge.removeFromSubscriptionGroup).toBeCalledWith(groupId, testCallback);
});

test('it calls BrazeReactBridge.setPushNotificationSubscriptionType', () => {
  const sub_type = "some_sub_type";
  Braze.setPushNotificationSubscriptionType(sub_type, testCallback);
  expect(NativeModules.BrazeReactBridge.setPushNotificationSubscriptionType).toBeCalledWith(sub_type, testCallback);
});

test('it calls BrazeReactBridge.setEmailNotificationSubscriptionType', () => {
  const sub_type = "some_sub_type";
  Braze.setEmailNotificationSubscriptionType(sub_type, testCallback);
  expect(NativeModules.BrazeReactBridge.setEmailNotificationSubscriptionType).toBeCalledWith(sub_type, testCallback);
});

test('it calls BrazeReactBridge.addToCustomAttributeArray', () => {
  const key = "some_key";
  const value = "some_value"
  Braze.addToCustomUserAttributeArray(key, value, testCallback);
  expect(NativeModules.BrazeReactBridge.addToCustomAttributeArray).toBeCalledWith(key, value, testCallback);
});

test('it calls BrazeReactBridge.removeFromCustomAttributeArray', () => {
  const key = "some_key";
  const value = "some_value"
  Braze.removeFromCustomUserAttributeArray(key, value, testCallback);
  expect(NativeModules.BrazeReactBridge.removeFromCustomAttributeArray).toBeCalledWith(key, value, testCallback);
});

test('it calls BrazeReactBridge.unsetCustomUserAttribute', () => {
  const key = "some_key";
  Braze.unsetCustomUserAttribute(key, testCallback);
  expect(NativeModules.BrazeReactBridge.unsetCustomUserAttribute).toBeCalledWith(key, testCallback);
});

test('it calls BrazeReactBridge.getCardCountForCategories', () => {
  const category = "some_category";
  Braze.getCardCountForCategories(category, testCallback);
  expect(NativeModules.BrazeReactBridge.getCardCountForCategories).toBeCalledWith(category, testCallback);
});

test('it calls BrazeReactBridge.getUnreadCardCountForCategories', () => {
  const category = "some_category";
  Braze.getUnreadCardCountForCategories(category, testCallback);
  expect(NativeModules.BrazeReactBridge.getUnreadCardCountForCategories).toBeCalledWith(category, testCallback);
});

test('it calls BrazeReactBridge.getInitialUrl if defined', () => {
  NativeModules.BrazeReactBridge.getInitialUrl.mockImplementation((callback) => {
    callback(null, "some_data");
  });
  Braze.getInitialURL(testCallback);
  expect(NativeModules.BrazeReactBridge.getInitialUrl).toBeCalled();
  expect(testCallback).toBeCalledWith("some_data");
});

test('it calls BrazeReactBridge.getInstallTrackingId', () => {
  NativeModules.BrazeReactBridge.getInstallTrackingId.mockImplementation((callback) => {
    callback(null, "some_tracking_id");
  });
  Braze.getInstallTrackingId(testCallback);
  expect(NativeModules.BrazeReactBridge.getInstallTrackingId).toBeCalled();
  expect(testCallback).toBeCalledWith(null, "some_tracking_id");
});

test('it calls the callback with null and logs the error if BrazeReactBridge.getInitialUrl returns an error', () => {
  NativeModules.BrazeReactBridge.getInitialUrl.mockImplementation((callback) => {
    callback("error", null);
  });
  Braze.getInitialURL(testCallback);
  expect(NativeModules.BrazeReactBridge.getInitialUrl).toBeCalled();
  expect(testCallback).toBeCalledWith(null);
  expect(console.log).toBeCalledWith("error");
});

test('it calls the callback with null if BrazeReactBridge.getInitialUrl is not defined', () => {
  NativeModules.BrazeReactBridge.getInitialUrl = null;
  Braze.getInitialURL(testCallback);
  expect(testCallback).toBeCalledWith(null);
});

test('it calls BrazeReactBridge.subscribeToInAppMessage', () => {
  Braze.subscribeToInAppMessage(true);
  expect(NativeModules.BrazeReactBridge.subscribeToInAppMessage).toBeCalledWith(true);

  Braze.subscribeToInAppMessage(false);
  expect(NativeModules.BrazeReactBridge.subscribeToInAppMessage).toBeCalledWith(false);
});

test('it calls BrazeReactBridge.hideCurrentInAppMessage', () => {
  Braze.hideCurrentInAppMessage();
  expect(NativeModules.BrazeReactBridge.hideCurrentInAppMessage).toBeCalled();
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
  testButtons.push(new Braze.BrazeButton(JSON.parse(testButton0)));
  testButtons.push(new Braze.BrazeButton(JSON.parse(testButton1)));
  const testJson = `{\"message\":\"${testMessageBody}\",\"type\":\"${testMessageType}\",\"text_align_message\":\"CENTER\",\"click_action\":\"${testClickAction}\",\"message_close\":\"SWIPE\",\"extras\":${testExtras},\"header\":\"${testHeader}\",\"text_align_header\":\"CENTER\",\"image_url\":\"${testImageUrl}\",\"image_style\":\"TOP\",\"btns\":${testButtonString},\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\",\"uri\":\"${testUri}\",\"zipped_assets_url\":\"${testZippedAssetsUrl}\",\"duration\":${testDuration},\"message_close\":\"${testDismissType}\",\"use_webview\":${testUseWebView}}`
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
});

it('returns the original JSON when calling BrazeInAppMessage.toString()', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  expect(inAppMessage.toString()).toBe(testInAppMessageJson);
});

test('it calls BrazeReactBridge.logInAppMessageClicked', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  Braze.logInAppMessageClicked(inAppMessage);
  expect(NativeModules.BrazeReactBridge.logInAppMessageClicked).toBeCalledWith(testInAppMessageJson);
});

test('it calls BrazeReactBridge.logInAppMessageImpression', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  Braze.logInAppMessageImpression(inAppMessage);
  expect(NativeModules.BrazeReactBridge.logInAppMessageImpression).toBeCalledWith(testInAppMessageJson);
});

test('it calls BrazeReactBridge.logInAppMessageButtonClicked', () => {
  const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
  const testId = 23;
  Braze.logInAppMessageButtonClicked(inAppMessage, testId);
  expect(NativeModules.BrazeReactBridge.logInAppMessageButtonClicked).toBeCalledWith(testInAppMessageJson, testId);
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
  expect(NativeModules.BrazeReactBridge.requestPushPermission).toBeCalledWith(options);
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
  expect(NativeModules.BrazeReactBridge.getFeatureFlag).toBeCalledWith(testId);
});

test('it calls BrazeReactBridge.getAllFeatureFlags', () => {
  Braze.getAllFeatureFlags();
  expect(NativeModules.BrazeReactBridge.getAllFeatureFlags).toBeCalled();
});

test('it calls BrazeReactBridge.refreshFeatureFlags', () => {
  Braze.refreshFeatureFlags();
  expect(NativeModules.BrazeReactBridge.refreshFeatureFlags).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagBooleanProperty', () => {
  Braze.getFeatureFlagBooleanProperty('id', 'key');
  expect(NativeModules.BrazeReactBridge.getFeatureFlagBooleanProperty).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagStringProperty', () => {
  Braze.getFeatureFlagStringProperty('id', 'key');
  expect(NativeModules.BrazeReactBridge.getFeatureFlagStringProperty).toBeCalled();
});

test('it calls BrazeReactBridge.getFeatureFlagNumberProperty', () => {
  Braze.getFeatureFlagNumberProperty('id', 'key');
  expect(NativeModules.BrazeReactBridge.getFeatureFlagNumberProperty).toBeCalled();
});