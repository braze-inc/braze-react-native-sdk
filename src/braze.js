import {
  DeviceEventEmitter,
  NativeEventEmitter,
  Platform
} from 'react-native';

import { Button } from './models/button';
import { InAppMessage } from './models/in-app-message';
import {
  CardCategory,
  NotificationSubscriptionTypes,
  Genders,
  TrackingProperty,
  ContentCardTypes,
  Events,
  ClickAction,
  DismissType,
  MessageType
} from './models/enums';

import { callFunctionWithCallback, parseNestedProperties } from './helpers';

export class Braze {
  static BrazeButton = Button;
  static BrazeInAppMessage = InAppMessage;

  static CardCategory = CardCategory;
  static NotificationSubscriptionTypes = NotificationSubscriptionTypes;
  static Genders = Genders;
  static TrackingProperty = TrackingProperty;
  static ContentCardTypes = ContentCardTypes;
  static Events = Events;
  static ClickAction = ClickAction;
  static DismissType = DismissType;
  static MessageType = MessageType;

  static bridge = require('./NativeBrazeReactModule').default; 
  static eventEmitter = Platform.select({
    ios: new NativeEventEmitter(this.bridge),
    android: DeviceEventEmitter
  });

  /**
   * When launching an iOS application that has previously been force closed, React Native's Linking API doesn't
   * support handling deep links embedded in push notifications. This is due to a race condition on startup between
   * the native call to RCTLinkingManager and React's loading of its JavaScript. This function provides a workaround:
   * If an application is launched from a push notification click, we return any Braze deep links in the push payload.
   * @param {function(string)} callback - A callback that retuns the deep link as a string. If there is no deep link, returns null.
   */
  static getInitialURL(callback) {
    if (Platform.OS === 'ios') {
      this.bridge.getInitialURL((err, res) => {
        if (err) {
          console.log(err);
          callback(null);
        } else {
          callback(res);
        }
      });
    } else {
      // BrazeReactBridge.getInitialUrl not implemented on Android
      callback(null);
    }
  }

  /**
   * @deprecated This method is deprecated in favor of `getDeviceId`.
   */
  static getInstallTrackingId(callback) {
    callFunctionWithCallback(
      this.bridge.getDeviceId,
      [],
      callback
    );
  }

  /**
   * Returns a unique ID stored on the device. 
   * 
   * On Android, a randomly generated, app specific ID that is stored on the device. A new ID will be generated if the user 
   * clears the data for the app or removes/re-installs the app. The ID will persist across Braze.changeUser calls.
   * 
   * On iOS, this ID is generated from the IDFV. This behavior will be updated in the next major version.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static getDeviceId(callback) {
    callFunctionWithCallback(
      this.bridge.getDeviceId,
      [],
      callback
    );
  }

  /**
   * When a user first uses Braze on a device they are considered "anonymous". Use this method to identify a user
   *    with a unique ID, which enables the following:
   *
   *    - If the same user is identified on another device, their user profile, usage history and event history will
   *        be shared across devices.
   *    - If your app is used on the same device by multiple people, you can assign each of them a unique identifier
   *        to track them separately. Only the most recent user on a particular browser will receive push
   *        notifications and in-app messages.
   *
   * When you request a user switch (which is any call to changeUser where the new user ID is not the same as the
   *    existing user ID), the current session for the previous user (anonymous or not) is automatically ended and
   *    a new session is started. Similarly, following a call to changeUser, any events which fire are guaranteed to
   *    be for the new user -- if an in-flight server request completes for the old user after the user switch no
   *    events will fire, so you do not need to worry about filtering out events from Braze for old users.
   *
   * Additionally, if you identify a user which has never been identified on another device, the entire history of
   *    that user as an "anonymous" user on this device will be preserved and associated with the newly identified
   *    user. However, if you identify a user which *has* been identified in another app, any history which was
   *    already flushed to the server for the anonymous user on this device will become orphaned and will not be
   *    associated with any future users. These orphaned users are not considered in your user counts and will not
   *    be messaged.
   *
   * Note: Once you identify a user, you cannot revert to the "anonymous" user. The transition from anonymous to
   *    identified tracking is only allowed once because the initial anonymous user receives special treatment to
   *    allow for preservation of their history. As a result, we recommend against changing the user ID just because
   *    your app has entered a "logged out" state because it makes you unable to target the previously logged out user
   *    with re-engagement campaigns. If you anticipate multiple users on the same device, but only want to target one
   *    of them when your app is in a logged out state, we recommend separately keeping track of the user ID you want
   *    to target while logged out and switching back to that user ID as part of your app's logout process.
   *
   * @param {string} userId - A unique identifier for this user.
   * @param {string} signature - An optional authentication signature to be used with the SDK Authentication feature.
   */
  static changeUser(userId, signature) {
    this.bridge.changeUser(
      userId,
      signature != null ? signature : null
    );
  }

  /**
   * Returns a unique ID stored for the user.
   * If the user is anonymous, there is no ID stored for the user and this method will return `null`.
   * 
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static getUserId(callback) {
    callFunctionWithCallback(
      this.bridge.getUserId,
      [],
      callback
    );
  }  

  /**
   * Sets the signature to be used to authenticate the current user. You can also set the signature when calling `changeUser`.
   * This signature will only have an effect if SDK Authentication is enabled.
   *
   * @param signature - The signature to add to network requests to authenticate the current user.
   */
  static setSdkAuthenticationSignature(signature) {
    this.bridge.setSdkAuthenticationSignature(signature);
  }

  /**
   * An alias serves as an alternative unique user identifier. Use aliases to identify users along different
   *    dimensions than your core user ID:
   *       * Set a consistent identifier for analytics that will follow a given user both before and after they have
   *         logged in to a mobile app or website.
   *       * Add the identifiers used by a third party vendor to your Braze users in order to more easily reconcile
   *         your data externally.
   *
   * Note: Each alias consists of two parts: a name for the identifier itself, and a label indicating the type of
   *    alias. Users can have multiple aliases with different labels, but only one name per label.
   *
   * @param {string} aliasName - An identifier for alias name.
   * @param {string} aliasLabel - An identifier for alias label.
   */
  static addAlias(aliasName, aliasLabel) {
    this.bridge.addAlias(aliasName, aliasLabel);
  }

  /**
   * @deprecated This method is deprecated in favor of `registerPushToken`.
   */
  static registerAndroidPushToken(token) {
    if (Platform.OS === 'android') {
      this.bridge.registerPushToken(token);
    }
  }

  /**
  * This method posts a token to Braze's servers to associate the token with the current device.
  * @param {string} token - The device's push token.
  */
  static registerPushToken(token) {
    this.bridge.registerPushToken(token);
  }

  /**
   * This method sets the Google Advertising ID and associated ad-tracking enabled field for this device. Note that the
   * SDK does not automatically collect this data.
   *
   * No-op on iOS.
   *
   * @param {string} googleAdvertisingId - The Google Advertising ID
   * @param {boolean} adTrackingEnabled - Whether ad-tracking is enabled for the Google Advertising ID
   */
  static setGoogleAdvertisingId(googleAdvertisingId, adTrackingEnabled) {
    this.bridge.setAdTrackingEnabled(
      adTrackingEnabled,
      googleAdvertisingId
    );
  }

  /**
   * Reports that the current user performed a custom named event.
   * @param {string} eventName - The identifier for the event to track. Best practice is to track generic events
   *      useful for segmenting, instead of specific user actions (i.e. track watched_sports_video instead of
   *      watched_video_adrian_peterson_td_mnf). Value is limited to 255 characters in length, cannot begin with a $,
   *      and can only contain alphanumeric characters and punctuation.
   * @param {object} [eventProperties] - Hash of properties for this event. Keys are limited to 255
   *      characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
   *      Values can be numeric, boolean, Date, or strings 255 characters or shorter.
   */
  static logCustomEvent(eventName, eventProperties) {
    parseNestedProperties(eventProperties);
    this.bridge.logCustomEvent(eventName, eventProperties);
  }

  /**
   * Reports that the current user made an in-app purchase. Useful for tracking and segmenting users.
   * @param {string} productId - A string identifier for the product purchased, e.g. an SKU. Value is limited to
   *      255 characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
   * @param {float} price - The price paid. Base units depend on the currency. As an example, USD should be
   *      reported as Dollars.Cents, whereas JPY should be reported as a whole number of Yen. All provided
   *      values will be rounded to two digits with toFixed(2)
   * @param {string} [currencyCode=USD] - Currencies should be represented as an ISO 4217 currency code. Supported
   *      currency symbols include: AED, AFN, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF,
   *      BMD, BND, BOB, BRL, BSD, BTC, BTN, BWP, BYR, BZD, CAD, CDF, CHF, CLF, CLP, CNY, COP, CRC, CUC, CUP, CVE,
   *      CZK, DJF, DKK, DOP, DZD, EEK, EGP, ERN, ETB, EUR, FJD, FKP, GBP, GEL, GGP, GHS, GIP, GMD, GNF, GTQ, GYD,
   *      HKD, HNL, HRK, HTG, HUF, IDR, ILS, IMP, INR, IQD, IRR, ISK, JEP, JMD, JOD, JPY, KES, KGS, KHR, KMF, KPW,
   *      KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LTL, LVL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRO, MTL,
   *      MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR,
   *      RON, RSD, RUB, RWF, SAR, SBD, SCR, SDG, SEK, SGD, SHP, SLL, SOS, SRD, STD, SVC, SYP, SZL, THB, TJS, TMT,
   *      TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VEF, VND, VUV, WST, XAF, XAG, XAU, XCD, XDR, XOF,
   *      XPD, XPF, XPT, YER, ZAR, ZMK, ZMW, and ZWL. Any other provided currency symbol will result in a logged
   *      warning and no other action taken by the SDK.
   * @param {integer} [quantity=1] - The quantity of items purchased expressed as a whole number. Must be at least 1
   *      and at most 100.
   * @param {object} [purchaseProperties] - Hash of properties for this purchase. Keys are limited to 255
   *      characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
   *      Values can be numeric, boolean, Date, or strings 255 characters or shorter.
   */
  static logPurchase(
    productId,
    price,
    currencyCode,
    quantity,
    purchaseProperties
  ) {
    parseNestedProperties(purchaseProperties);
    this.bridge.logPurchase(
      productId,
      price,
      currencyCode,
      quantity,
      purchaseProperties
    );
  }

  // Braze user methods
  /**
   * Sets a custom user attribute. This can be any key/value pair and is used to collect extra information about the
   *    user.
   * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
   *    a $, and can only contain alphanumeric characters and punctuation.
   * @param value - Can be numeric, boolean, a Date object, a string, or an array of strings. Strings are limited to
   *    255 characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
   *    Passing a null value will remove this custom attribute from the user.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static setCustomUserAttribute(key, value, thirdParam, fourthParam) {
    const merge = typeof thirdParam === 'boolean' ? thirdParam : false;
    const callback = typeof thirdParam === 'boolean' ? fourthParam : thirdParam;

    var valueType = typeof value;
    if (value instanceof Date) {
      callFunctionWithCallback(
        this.bridge.setDateCustomUserAttribute,
        [key, Math.floor(value.getTime() / 1000)],
        callback
      );
    } else if (value instanceof Array) {
      if (value.every(item => typeof item === 'string')) {
        callFunctionWithCallback(
          this.bridge.setCustomUserAttributeArray,
          [key, value],
          callback
        );
      } else if (value.every(item => typeof item === 'object')) {
        callFunctionWithCallback(
          this.bridge.setCustomUserAttributeObjectArray,
          [key, value],
          callback
        );
      } else {
        console.log(`User attribute ${value} was not a valid array. Custom attribute arrays can only contain all strings or all objects.`);
      }
    } else if (valueType === 'object') {
      callFunctionWithCallback(
        this.bridge.setCustomUserAttributeObject,
        [key, value, merge],
        callback
      );
    } else if (valueType === 'boolean') {
      callFunctionWithCallback(
        this.bridge.setBoolCustomUserAttribute,
        [key, value],
        callback
      );
    } else if (valueType === 'string') {
      callFunctionWithCallback(
        this.bridge.setStringCustomUserAttribute,
        [key, value],
        callback
      );
    } else if (valueType === 'number') {
      if (parseInt(value) === parseFloat(value)) {
        callFunctionWithCallback(
          this.bridge.setIntCustomUserAttribute,
          [key, value],
          callback
        );
      } else {
        callFunctionWithCallback(
          this.bridge.setDoubleCustomUserAttribute,
          [key, value],
          callback
        );
      }
    }
  }

  /**
   * Increment/decrement the value of a custom attribute. Only numeric custom attributes can be incremented. Attempts to
   *    increment a custom attribute that is not numeric be ignored. If you increment a custom attribute that has not
   *    previously been set, a custom attribute will be created and assigned the value of incrementValue. To decrement
   *    the value of a custom attribute, use a negative incrementValue.
   * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
   *    a $, and can only contain alphanumeric characters and punctuation.
   * @param {integer} value - May be negative to decrement.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static incrementCustomUserAttribute(key, value, callback) {
    callFunctionWithCallback(
      this.bridge.incrementCustomUserAttribute,
      [key, value],
      callback
    );
  }

  /**
   * Sets the first name of the user.
   * @param {string} firstName - Limited to 255 characters in length.
   */
  static setFirstName(firstName) {
    this.bridge.setFirstName(firstName);
  }

  /**
   * Sets the last name of the user.
   * @param {string} lastName - Limited to 255 characters in length.
   */
  static setLastName(lastName) {
    this.bridge.setLastName(lastName);
  }

  /**
   * Sets the email address of the user.
   * @param {string} email - Must pass RFC-5322 email address validation.
   */
  static setEmail(email) {
    this.bridge.setEmail(email);
  }

  /**
   * Sets the gender of the user.
   * @param {Genders} gender - Options: f = female, m = male, n = N/A, o = other, p = prefer not to say, u = unknown
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static setGender(gender, callback) {
    callFunctionWithCallback(
      this.bridge.setGender,
      [gender],
      callback
    );
  }

  /**
   * Sets the language for the user.
   * @param {string} language - Should be valid ISO 639-1 language code.
   */
  static setLanguage(language) {
    this.bridge.setLanguage(language);
  }

  /**
   * Sets the country for the user.
   * @param {string} country - Limited to 255 characters in length.
   */
  static setCountry(country) {
    this.bridge.setCountry(country);
  }

  /**
   * Sets the home city for the user.
   * @param {string} homeCity - Limited to 255 characters in length.
   */
  static setHomeCity(homeCity) {
    this.bridge.setHomeCity(homeCity);
  }

  /**
   * Sets the phone number of the user.
   * @param {string} phoneNumber - A phone number is considered valid if it is no more than 255 characters in length and
   *    contains only numbers, whitespace, and the following special characters +.-()
   */
  static setPhoneNumber(phoneNumber) {
    this.bridge.setPhoneNumber(phoneNumber);
  }

  /**
   * Sets the date of birth of the user.
   * @param {integer} year
   * @param {integer} month - 1-12
   * @param {integer} day
   */
  static setDateOfBirth(year, month, day) {
    this.bridge.setDateOfBirth(year, month, day);
  }

  /**
   * Adds the user to a subscription group.
   * @param {string} groupId - The string UUID corresponding to the subscription group, provided by the Braze dashboard.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static addToSubscriptionGroup(groupId, callback) {
    callFunctionWithCallback(
      this.bridge.addToSubscriptionGroup,
      [groupId],
      callback
    );
  }

  /**
   * Removes the user from a subscription group.
   * @param {string} groupId - The string UUID corresponding to the subscription group, provided by the Braze dashboard.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static removeFromSubscriptionGroup(groupId, callback) {
    callFunctionWithCallback(
      this.bridge.removeFromSubscriptionGroup,
      [groupId],
      callback
    );
  }

  /**
   * Sets whether the user should be sent push campaigns.
   * @param {NotificationSubscriptionTypes} notificationSubscriptionType - Notification setting (explicitly
   *    opted-in, subscribed, or unsubscribed).
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static setPushNotificationSubscriptionType(
    notificationSubscriptionType,
    callback
  ) {
    callFunctionWithCallback(
      this.bridge.setPushNotificationSubscriptionType,
      [notificationSubscriptionType],
      callback
    );
  }

  /**
   * Sets whether the user should be sent email campaigns.
   * @param {NotificationSubscriptionTypes} notificationSubscriptionType - Notification setting (explicitly
   *    opted-in, subscribed, or unsubscribed).
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static setEmailNotificationSubscriptionType(
    notificationSubscriptionType,
    callback
  ) {
    callFunctionWithCallback(
      this.bridge.setEmailNotificationSubscriptionType,
      [notificationSubscriptionType],
      callback
    );
  }

  /**
   * Adds a string to a custom atttribute string array, or creates that array if one doesn't exist.
   * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
   *    a $, and can only contain alphanumeric characters and punctuation.
   * @param {string} value - The string to be added to the array. Strings are limited to 255 characters in length, cannot
   *    begin with a $, and can only contain alphanumeric characters and punctuation.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static addToCustomUserAttributeArray(key, value, callback) {
    callFunctionWithCallback(
      this.bridge.addToCustomUserAttributeArray,
      [key, value],
      callback
    );
  }

  /**
   * Removes a string from a custom attribute string array.
   * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
   *    a $, and can only contain alphanumeric characters and punctuation.
   * @param {string} value - The string to be removed from the array. Strings are limited to 255 characters in length,
   *    cannot beging with a $, and can only contain alphanumeric characters and punctuation.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static removeFromCustomUserAttributeArray(key, value, callback) {
    callFunctionWithCallback(
      this.bridge.removeFromCustomUserAttributeArray,
      [key, value],
      callback
    );
  }

  /**
   * Unsets a custom user attribute.
   * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
   *    a $, and can only contain alphanumeric characters and punctuation.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static unsetCustomUserAttribute(key, callback) {
    callFunctionWithCallback(
      this.bridge.unsetCustomUserAttribute,
      [key],
      callback
    );
  }

  /**
   * Sets user attribution data.
   *
   * @param {string} network - The attribution network
   * @param {string} campaign - The attribution campaign
   * @param {string} adGroup - The attribution adGroup
   * @param {string} creative - The attribution creative
   */
  static setAttributionData(network, campaign, adGroup, creative) {
    this.bridge.setAttributionData(
      network,
      campaign,
      adGroup,
      creative
    );
  }

  // News Feed
  /**
   * Launches the News Feed UI element.
   */
  static launchNewsFeed() {
    this.bridge.launchNewsFeed();
  }

  /**
   * Returns an array of News Feed cards.
   * @returns {Promise<NewsFeedCard[]>}
   */
  static getNewsFeedCards() {
    return this.bridge.getNewsFeedCards();
  }

  /**
   * Manually log a click to Braze for a particular News Feed card.
   * The SDK will only log a card click when the card has the url property with a valid value.
   * @param {string} id
   */
  static logNewsFeedCardClicked(id) {
    this.bridge.logNewsFeedCardClicked(id);
  }

  /**
   * Manually log an impression to Braze for a particular News Feed card.
   * @param {string} id
   */
  static logNewsFeedCardImpression(id) {
    this.bridge.logNewsFeedCardImpression(id);
  }

  // Content Cards
  /**
   * Launches the Content Cards UI element.
   */
  static launchContentCards() {
    this.bridge.launchContentCards();
  }

  /**
   * Returns a content cards array after performing a refresh.
   * @returns {Promise<ContentCard[]>}
   */
  static getContentCards() {
    return this.bridge.getContentCards();
  }

  /**
   * Returns the most recent Content Cards array from the cache.
   * @returns {Promise<ContentCard[]>}
   */
  static getCachedContentCards() {
    return this.bridge.getCachedContentCards();
  }

  /**
   * Manually log a click to Braze for a particular card.
   * The SDK will only log a card click when the card has the url property with a valid value.
   * @param {string} id
   */
  static logContentCardClicked(id) {
    this.bridge.logContentCardClicked(id);
  }

  /**
   * Manually log a dismissal to Braze for a particular card.
   * @param {string} id
   */
  static logContentCardDismissed(id) {
    this.bridge.logContentCardDismissed(id);
  }

  /**
   * Manually log an impression to Braze for a particular card.
   * @param {string} id
   */
  static logContentCardImpression(id) {
    this.bridge.logContentCardImpression(id);
  }

  /**
   * Perform the action of a particular card.
   * @param {string} id
   */
  static processContentCardClickAction(id) {
    this.bridge.processContentCardClickAction(id);
  }

  /**
   * Requests a News Feed refresh.
   */
  static requestFeedRefresh() {
    this.bridge.requestFeedRefresh();
  }

  /**
   * Returns the current number of News Feed cards for the given category.
   * @param {CardCategory} category - Card category. Use Braze.CardCategory.ALL to get the total card count.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once. There is also a slight
   * race condition around calling changeUser, which requests a feed refresh, so the counts may not always be accurate.
   */
  static getCardCountForCategories(category, callback) {
    callFunctionWithCallback(
      this.bridge.getCardCountForCategories,
      [category],
      callback
    );
  }

  /**
   * Returns the number of unread News Feed cards for the given category.
   * @param {CardCategory} category - Card category. Use Braze.CardCategory.ALL to get the total unread card count.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once. There is also a slight
   * race condition around calling changeUser, which requests a feed refresh, so the counts may not always be accurate.
   */
  static getUnreadCardCountForCategories(category, callback) {
    callFunctionWithCallback(
      this.bridge.getUnreadCardCountForCategories,
      [category],
      callback
    );
  }

  // Flush Controls
  /**
   * Requests an immediate flush of any data waiting to be sent to Braze's servers.
   */
  static requestImmediateDataFlush() {
    this.bridge.requestImmediateDataFlush();
  }

  // Data Controls
  /**
   * Wipes Data on the Braze SDK. On iOS, the SDK will be disabled for the rest of the app run.
   */
  static wipeData() {
    this.bridge.wipeData();
  }

  /**
   * Disables the Braze SDK immediately.
   */
  static disableSDK() {
    this.bridge.disableSDK();
  }

  /**
   * Enables the Braze SDK after a previous call to disableSDK().
   */
  static enableSDK() {
    this.bridge.enableSDK();
  }

  /**
   * Call this method once a user grants location permissions on Android
   * to initialize Braze location features. Calling this method is a no-op on
   * iOS.
   */
  static requestLocationInitialization() {
    this.bridge.requestLocationInitialization();
  }

  /**
   * Call this method to request a Braze Geofences update for a manually provided
   * GPS coordinate. Automatic Braze Geofence requests must be disabled to properly
   * use this method. Calling this method is a no-op on iOS.
   * @param {double} latitude - Location latitude.
   * @param {double} longitude - Location longitude.
   */
  static requestGeofences(latitude, longitude) {
    this.bridge.requestGeofences(latitude, longitude);
  }

  /**
   * Sets a custom location attribute for the user.
   * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
   * a $, and can only contain alphanumeric characters and punctuation.
   * @param {double} latitude - Location latitude.
   * @param {double} longitude - Location longitude.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   */
  static setLocationCustomAttribute(key, latitude, longitude, callback) {
    callFunctionWithCallback(
      this.bridge.setLocationCustomAttribute,
      [key, latitude, longitude],
      callback
    );
  }

  /**
   * Sets the last known location for the user.
   * For Android, latitude and longitude are required, with altitude, horizontal accuracy, and vertical accuracy being optional parameters.
   * For iOS, latitude, longitude, and horizontal accuracy are required, with altitude and vertical accuracy being optional parameters.
   * Calling this method with invalid parameters for a specific platform is a no-op. Latitude, longitude, and horizontal accuracy are the minimum required parameters to work for all platforms.
   * @param {number} latitude - Location latitude. Required.
   * @param {number} longitude - Location longitude. Required.
   * @param {number | null} altitude - Location altitude. May be null for both platforms. Providing an `altitude` requires a valid `verticalAccuracy` to be provided as well.
   * @param {number | null} horizontalAccuracy - Location horizontal accuracy. Equivalent to accuracy for Android. May be null for Android only; required for iOS.
   * @param {number | null} verticalAccuracy - Location vertical accuracy. May be null for both platforms unless `altitude` is supplied.
   */
  static setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy) {
    if (!horizontalAccuracy) {
      horizontalAccuracy = -1;
    }
    if (!verticalAccuracy) {
      verticalAccuracy = -1;
    }
    if (!altitude) {
      verticalAccuracy = -1;
      altitude = 0;
    }
    this.bridge.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy);
  }

  /**
   * Requests a refresh of the content cards from Braze's servers.
   */
  static requestContentCardsRefresh() {
    this.bridge.requestContentCardsRefresh();
  }

  /**
   * Call this method to have the SDK publish an "inAppMessageReceived" event containing the in-app message data to the
   * Javascript layer. You can listen to this event with `Braze.addListener()`.
   *
   * @param {boolean} useBrazeUI - Whether to use the default Braze UI for in-app messages.
   * @param {function(event)} subscriber - The method to call when an in-app message is received.
   */
  static subscribeToInAppMessage(useBrazeUI, subscriber) {
    let withBrazeUI = false;
    if (useBrazeUI != null) {
      withBrazeUI = useBrazeUI;
    }
    this.bridge.subscribeToInAppMessage(withBrazeUI, subscriber);

    if (typeof subscriber === "function") {
      return this.eventEmitter.addListener(Events.IN_APP_MESSAGE_RECEIVED, subscriber);
    }
  }

  /**
   * Dismisses the currently displayed in app message.
   */
  static hideCurrentInAppMessage() {
    this.bridge.hideCurrentInAppMessage();
  }

  /**
   * Logs a click for the provided in-app message data
   * @param {InAppMessage} inAppMessage
   */
  static logInAppMessageClicked(inAppMessage) {
    const inAppMessageString = inAppMessage.toString();
    this.bridge.logInAppMessageClicked(inAppMessageString);
  }

  /**
   * Logs an impression for the provided in-app message data
   * @param {InAppMessage} inAppMessage
   */
  static logInAppMessageImpression(inAppMessage) {
    const inAppMessageString = inAppMessage.toString();
    this.bridge.logInAppMessageImpression(inAppMessageString);
  }

  /**
   * Logs a button click for the provided in-app message button data
   * @param {InAppMessage} inAppMessage
   * @param {number} buttonId
   */
  static logInAppMessageButtonClicked(inAppMessage, buttonId) {
    const inAppMessageString = inAppMessage.toString();
    this.bridge.logInAppMessageButtonClicked(
      inAppMessageString,
      buttonId
    );
  }

  /**
   * Perform the action of an in-app message button
   * @param {InAppMessage} inAppMessage
   * @param {number} ID of the button.
   */
  static performInAppMessageButtonAction(inAppMessage, buttonId) {
    console.log('Processing In-App Message Button Action: ', inAppMessage, ' ', buttonId);
    const inAppMessageString = inAppMessage.toString();
    this.bridge.performInAppMessageAction(inAppMessageString, buttonId);
  }

  /**
   * Perform the action of an in-app message
   * @param {InAppMessage} inAppMessage
   */
  static performInAppMessageAction(inAppMessage) {
    console.log('Processing In-App Message Action: ', inAppMessage);
    const inAppMessageString = inAppMessage.toString();
    this.bridge.performInAppMessageAction(inAppMessageString, -1);
  }

  /**
   * Requests a push permission prompt. On Android 12 and below, this is a no-op.
   *
   * @param {*} permissionOptions
   */
  static requestPushPermission(permissionOptions) {
    if (!permissionOptions) {
      permissionOptions = {
        "alert": true,
        "badge": true,
        "sound": true,
        "provisional": false
      }
    }
    this.bridge.requestPushPermission(permissionOptions);
  }

  /**
   * Returns feature flags array
   * @returns {Promise<FeatureFlag[]>}
   */
  static getAllFeatureFlags() {
    return this.bridge.getAllFeatureFlags();
  }

  /**
   * Returns feature flag
   * @returns {Promise<FeatureFlag|null>}
   */
  static getFeatureFlag(id) {
    return this.bridge.getFeatureFlag(id);
  }

  /**
   * Requests a refresh of Feature Flags from the Braze server.
   */
  static refreshFeatureFlags() {
    this.bridge.refreshFeatureFlags();
  }

  /**
   * Logs an impression for the Feature Flag with the provided ID.
   */
  static logFeatureFlagImpression(id) {
    this.bridge.logFeatureFlagImpression(id);
  }

  /**
   * Returns the boolean property for the given feature flag ID.
   * @returns {Promise<boolean|null>}
   */
  static getFeatureFlagBooleanProperty(id, key) {
    return this.bridge.getFeatureFlagBooleanProperty(id, key);
  }

  /**
   * Returns the string property for the given feature flag ID.
   * @returns {Promise<string|null>}
   */
  static getFeatureFlagStringProperty(id, key) {
    return this.bridge.getFeatureFlagStringProperty(id, key);
  }

  /**
   * Returns the number property for the given feature flag ID.
   * @returns {Promise<number|null>}
   */
  static getFeatureFlagNumberProperty(id, key) {
    return this.bridge.getFeatureFlagNumberProperty(id, key);
  }

  /**
   * Returns the timestamp property for the given feature flag ID.
   * @returns {Promise<number|null>}
   */
  static getFeatureFlagTimestampProperty(id, key) {
    return this.bridge.getFeatureFlagTimestampProperty(id, key);
  }

  /**
   * Returns the JSON property for the given feature flag ID.
   * @returns {Promise<object|null>}
   */
  static getFeatureFlagJSONProperty(id, key) {
    return this.bridge.getFeatureFlagJSONProperty(id, key);
  }

  /**
   * Returns the image property for the given feature flag ID.
   * @returns {Promise<string|null>}
   */
  static getFeatureFlagImageProperty(id, key) {
    return this.bridge.getFeatureFlagImageProperty(id, key);
  }

  /**
   * This method informs Braze whether ad-tracking has been enabled for this device. Note that the SDK does not
   * automatically collect this data.
   *
   * @param {string} adTrackingEnabled - Whether ad-tracking is enabled.
   * @param {string} googleAdvertisingId - The Google Advertising ID. (Android only)
   */
  static setAdTrackingEnabled(adTrackingEnabled, googleAdvertisingId) {
    return this.bridge.setAdTrackingEnabled(
      adTrackingEnabled,
      googleAdvertisingId
    );
  }

  /**
   * Updates the list of data types you wish to declare or remove as tracked user data.
   *
   * For more details, refer to Braze's [Privacy Manifest documentation](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/privacy_manifest/).
   *
   * No-op on Android.
   *
   * @param {TrackingPropertyAllowList} allowList - The list of tracking properties to update.
   */
  static updateTrackingPropertyAllowList(allowList) {
    if (allowList.adding && !this.isValidTrackingPropertyArray(allowList.adding)) {
      console.log("'adding' property must be an array of strings. Setting array to empty.");
      allowList.adding = [];
    }
    if (allowList.removing && !this.isValidTrackingPropertyArray(allowList.removing)) {
      console.log("'removing' property must be an array of strings. Setting array to empty.");
      allowList.removing = [];
    }
    if (allowList.addingCustomEvents && !this.isValidTrackingPropertyArray(allowList.addingCustomEvents)) {
      console.log("'addingCustomEvents' property must be an array of strings. Setting array to empty.");
      allowList.addingCustomEvents = [];
    }
    if (allowList.removingCustomEvents && !this.isValidTrackingPropertyArray(allowList.removingCustomEvents)) {
      console.log("'removingCustomEvents' property must be an array of strings. Setting array to empty.");
      allowList.removingCustomEvents = [];
    }
    if (allowList.addingCustomAttributes && !this.isValidTrackingPropertyArray(allowList.addingCustomAttributes)) {
      console.log("'addingCustomAttributes' property must be an array of strings. Setting array to empty.");
      allowList.addingCustomAttributes = [];
    }
    if (allowList.removingCustomAttributes && !this.isValidTrackingPropertyArray(allowList.removingCustomAttributes)) {
      console.log("'removingCustomAttributes' property must be an array of strings. Setting array to empty.");
      allowList.removingCustomAttributes = [];
    }
    return this.bridge.updateTrackingPropertyAllowList(allowList);
  }

  // Events
  
  /**
   * Subscribes to the specific SDK event.
   * When you want to stop listening, call `.remove()` on the returned
   * subscription.
   * @param {Events} event
   * @param {function} subscriber
   */
  static addListener(event, subscriber) {
    if (Platform.OS === 'android') {
      this.bridge.addListener(event);
    }
    return this.eventEmitter.addListener(event, subscriber);
  }

  // Helper Functions

  /**
   * Validates an array to be processed in the `TrackingPropertyAllowList`.
   *
   * @param {array} array
   * @returns Whether the array is valid according to the tracking property allow list.
   */
  static isValidTrackingPropertyArray(array) {
    return Array.isArray(array) && array.every(item => typeof item === 'string');
  }
}
