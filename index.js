import { NativeEventEmitter, DeviceEventEmitter, NativeModules, Platform } from 'react-native';
const { AppboyReactBridge } = NativeModules;

/**
* This default callback logs errors and null or false results. AppboyReactBridge methods with callbacks will
* default to this if there is no user-provided callback.
* @callback appboyCallback
* @param {object} error - The callback error object
* @param {object} result - The method return value
*/
function appboyCallback(error, result) {
  if (error) {
    console.log(error);
  } else if (result == null || result === false) {
    console.log('Appboy API method returned null or false.');
  }
}

/**
* A helper method that wraps calls to AppboyReactBridge and passes in the
* default Appboy callback if no callback is provided.
* @param {function} methodName - The AppboyReactBridge function to call
* @param {array} argsArray - An array of arguments to pass into methodName
* @param {function(error, result)} callback - The user-provided callback
*/
function callFunctionWithCallback(methodName, argsArray, callback) {
  // If user-provided callback is null, undefined, or not a function, use default Appboy callback
  if (typeof callback === 'undefined' || callback == null || typeof callback !== 'function') {
    callback = appboyCallback;
  }
  argsArray.push(callback);

  methodName.apply(this, argsArray);
}

const feedUpdatedEmitter = new NativeEventEmitter(AppboyReactBridge);

var ReactAppboy = {
  /**
  * When launching an iOS application that has previously been force closed, React Native's Linking API doesn't
  * support handling deep links embedded in push notifications. This is due to a race condition on startup between
  * the native call to RCTLinkingManager and React's loading of its JavaScript. This function provides a workaround:
  * If an application is launched from a push notification click, we return any Appboy deep links in the push payload.
  * @param {function(string)} callback - A callback that retuns the deep link as a string. If there is no deep link, returns null.
  */
  getInitialURL: function(callback) {
    if (AppboyReactBridge.getInitialUrl) {
      AppboyReactBridge.getInitialUrl((err, res) => {
        if (err) {
          console.log(err);
          callback(null);
        } else {
          callback(res);
        }
      });
    } else {
      // AppboyReactBridge.getInitialUrl not implemented on Android
      callback(null);
    }
  },

  /**
  * When a user first uses Appboy on a device they are considered "anonymous". Use this method to identify a user
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
  *    events will fire, so you do not need to worry about filtering out events from Appboy for old users.
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
  */
  changeUser: function(userId) {
    AppboyReactBridge.setSDKFlavor();
    AppboyReactBridge.changeUser(userId);
  },

  /**
  * This method posts a token to Appboy's servers to associate the token with the current device.
  *
  * @param {string} token - The device's push token.
  */
  registerPushToken: function(token) {
    AppboyReactBridge.registerPushToken(token);
  },

  /**
  * Reports that the current user performed a custom named event.
  * @param {string} eventName - The identifier for the event to track. Best practice is to track generic events
  *      useful for segmenting, instead of specific user actions (i.e. track watched_sports_video instead of
  *      watched_video_adrian_peterson_td_mnf). Value is limited to 255 characters in length, cannot begin with a $,
  *      and can only contain alphanumeric characters and punctuation.
  * @param {object} [eventProperties] - Hash of properties for this event. Keys are limited to 255
  *      characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
  *      Values can be numeric, boolean, or strings 255 characters or shorter.
  */
  logCustomEvent: function(eventName, eventProperties) {
    AppboyReactBridge.setSDKFlavor();
    AppboyReactBridge.logCustomEvent(eventName, eventProperties);
  },

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
  *      Values can be numeric, boolean, or strings 255 characters or shorter.
  */
  logPurchase: function(productId, price, currencyCode, quantity, purchaseProperties) {
    AppboyReactBridge.logPurchase(productId, price, currencyCode, quantity, purchaseProperties);
  },

  /**
  * Submits feedback to Appboy.
  * @param {string} email - The email of the user submitting feedback.
  * @param {string} feedback - The content of the user feedback.
  * @param {boolean} isBug - If the feedback is reporting a bug or not.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  submitFeedback: function(email, feedback, isBug, callback) {
    callFunctionWithCallback(AppboyReactBridge.submitFeedback, [email, feedback, isBug], callback);
  },

  // Appboy user methods
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
  setCustomUserAttribute: function(key, value, callback) {
    var valueType = typeof (value);
    if (value instanceof Date) {
      callFunctionWithCallback(AppboyReactBridge.setDateCustomUserAttribute, [key, Math.floor(value.getTime() / 1000)], callback);
    } else if (value instanceof Array) {
      callFunctionWithCallback(AppboyReactBridge.setCustomUserAttributeArray, [key, value], callback);
    } else if (valueType === 'boolean') {
      callFunctionWithCallback(AppboyReactBridge.setBoolCustomUserAttribute, [key, value], callback);
    } else if (valueType === 'string') {
      callFunctionWithCallback(AppboyReactBridge.setStringCustomUserAttribute, [key, value], callback);
    } else if (valueType === 'number') {
      if (parseInt(value) === parseFloat(value)) {
        callFunctionWithCallback(AppboyReactBridge.setIntCustomUserAttribute, [key, value], callback);
      } else {
        callFunctionWithCallback(AppboyReactBridge.setDoubleCustomUserAttribute, [key, value], callback);
      }
    }
  },

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
  incrementCustomUserAttribute: function(key, value, callback) {
    callFunctionWithCallback(AppboyReactBridge.incrementCustomUserAttribute, [key, value], callback);
  },

  /**
  * Sets the first name of the user.
  * @param {string} firstName - Limited to 255 characters in length.
  */
  setFirstName: function(firstName) {
    AppboyReactBridge.setFirstName(firstName);
  },

  /**
  * Sets the last name of the user.
  * @param {string} lastName - Limited to 255 characters in length.
  */
  setLastName: function(lastName) {
    AppboyReactBridge.setLastName(lastName);
  },

  /**
  * Sets the email address of the user.
  * @param {string} email - Must pass RFC-5322 email address validation.
  */
  setEmail: function(email) {
    AppboyReactBridge.setEmail(email);
  },

  /**
  * Sets the gender of the user.
  * @param {Genders} gender - Options: f = female, m = male, n = N/A, o = other, p = prefer not to say, u = unknown
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  setGender: function(gender, callback) {
    callFunctionWithCallback(AppboyReactBridge.setGender, [gender], callback);
  },

  /**
  * Sets the country for the user.
  * @param {string} country - Limited to 255 characters in length.
  */
  setCountry: function(country) {
    AppboyReactBridge.setCountry(country);
  },

  /**
  * Sets the home city for the user.
  * @param {string} homeCity - Limited to 255 characters in length.
  */
  setHomeCity: function(homeCity) {
    AppboyReactBridge.setHomeCity(homeCity);
  },

  /**
  * Sets the phone number of the user.
  * @param {string} phoneNumber - A phone number is considered valid if it is no more than 255 characters in length and
  *    contains only numbers, whitespace, and the following special characters +.-()
  */
  setPhoneNumber: function(phoneNumber) {
    AppboyReactBridge.setPhoneNumber(phoneNumber);
  },

  /**
  * Sets the url for the avatar image for the user, which will be displayed on the user profile and throughout the Appboy
  *    dashboard.
  * @param {string} avatarImageUrl
  */
  setAvatarImageUrl: function(avatarImageUrl) {
    AppboyReactBridge.setAvatarImageUrl(avatarImageUrl);
  },

  /**
  * Sets the date of birth of the user.
  * @param {integer} year
  * @param {integer} month - 1-12
  * @param {integer} day
  */
  setDateOfBirth: function(year, month, day) {
    AppboyReactBridge.setDateOfBirth(year, month, day);
  },

  /**
  * Sets whether the user should be sent push campaigns.
  * @param {NotificationSubscriptionTypes} notificationSubscriptionType - Notification setting (explicitly
  *    opted-in, subscribed, or unsubscribed).
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  setPushNotificationSubscriptionType: function(notificationSubscriptionType, callback) {
    callFunctionWithCallback(AppboyReactBridge.setPushNotificationSubscriptionType, [notificationSubscriptionType], callback);
  },

  /**
  * Sets whether the user should be sent email campaigns.
  * @param {NotificationSubscriptionTypes} notificationSubscriptionType - Notification setting (explicitly
  *    opted-in, subscribed, or unsubscribed).
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  setEmailNotificationSubscriptionType: function(notificationSubscriptionType, callback) {
    callFunctionWithCallback(AppboyReactBridge.setEmailNotificationSubscriptionType, [notificationSubscriptionType], callback);
  },

  /**
  * Adds a string to a custom atttribute string array, or creates that array if one doesn't exist.
  * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
  *    a $, and can only contain alphanumeric characters and punctuation.
  * @param {string} value - The string to be added to the array. Strings are limited to 255 characters in length, cannot
  *    begin with a $, and can only contain alphanumeric characters and punctuation.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  addToCustomUserAttributeArray: function(key, value, callback) {
    callFunctionWithCallback(AppboyReactBridge.addToCustomAttributeArray, [key, value], callback);
  },

  /**
  * Removes a string from a custom attribute string array.
  * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
  *    a $, and can only contain alphanumeric characters and punctuation.
  * @param {string} value - The string to be removed from the array. Strings are limited to 255 characters in length,
  *    cannot beging with a $, and can only contain alphanumeric characters and punctuation.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  removeFromCustomUserAttributeArray: function(key, value, callback) {
    callFunctionWithCallback(AppboyReactBridge.removeFromCustomAttributeArray, [key, value], callback);
  },

  /**
  * Unsets a custom user attribute.
  * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
  *    a $, and can only contain alphanumeric characters and punctuation.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  unsetCustomUserAttribute: function(key, callback) {
    callFunctionWithCallback(AppboyReactBridge.unsetCustomUserAttribute, [key], callback);
  },

  /**
   * Sets user Twitter data.
   *
   * @param {integer} id - The Twitter user Id. May not be null.
   * @param {string} screenName - The user's Twitter handle
   * @param {string} name - The user's name
   * @param {string} description - A description of the user
   * @param {integer} followersCount - Number of Twitter users following this user. May not be null.
   * @param {integer} friendsCount - Number of Twitter users this user is following. May not be null.
   * @param {integer} statusesCount - Number of Tweets by this user. May not be null.
   * @param {string} profileImageUrl - Link to profile image
   */
  setTwitterData: function(id, screenName, name, description, followersCount, friendsCount, statusesCount, profileImageUrl) {
    if (id !== null && followersCount !== null && friendsCount !== null && statusesCount !== null) {
      AppboyReactBridge.setTwitterData(id, screenName, name, description, followersCount, friendsCount, statusesCount, profileImageUrl);
    } else {
      console.log('Invalid null argument(s) passed to ReactAppboy.setTwitterData(). Twitter data not set.');
    }
  },

  /**
   * Sets user Facebook data.
   *
   * @param {object} facebookUserDictionary - The dictionary returned from facebook with facebook graph api endpoint "/me". Please
   * refer to https://developers.facebook.com/docs/graph-api/reference/v2.7/user for more information.
   * Note: Android only supports the firstName, lastName, email, bio, cityName, gender, and birthday fields. All other user fields will be dropped.
   * @param {integer} numberOfFriends - The length of the friends array from facebook. You can get the array from the dictionary returned
   * from facebook with facebook graph api endpoint "/me/friends", under the key "data". Please refer to
   * https://developers.facebook.com/docs/graph-api/reference/v2.7/user/friends for more information. May not be null.
   * @param {Array} likes - The array of user's facebook likes from facebook. You can get the array from the dictionary returned
   * from facebook with facebook graph api endpoint "/me/likes", under the key "data"; Please refer to
   * https://developers.facebook.com/docs/graph-api/reference/v2.7/user/likes for more information.
   */
  setFacebookData: function(facebookUserDictionary, numberOfFriends, likes) {
    if (numberOfFriends !== null) {
      AppboyReactBridge.setFacebookData(facebookUserDictionary, numberOfFriends, likes);
    } else {
      console.log('Invalid null argument(s) passed to ReactAppboy.setFacebookData(). Facebook data not set.');
    }
  },

  // News Feed
  /**
  * Launches the News Feed UI element.
  */
  launchNewsFeed: function() {
    AppboyReactBridge.launchNewsFeed();
  },

  /**
   * Requests a News Feed refresh.
   */
  requestFeedRefresh: function() {
    AppboyReactBridge.requestFeedRefresh();
  },

  /**
   * Add an event listener that responds to the news feed being refreshed by a call to `requestFeedRefresh()`
   * @param listener {function({updateSuccessful})} The function to respond to feed refreshes
   * @returns {EmitterSubscription} A subscription object. Be sure to call `remove()` when your component unmounts.
   */
  subscribeToFeedRefresh: function(listener) {
    if (Platform.OS === 'ios'){
      return feedUpdatedEmitter.addListener('FeedUpdated', listener);
    } else {
      return DeviceEventEmitter.addListener('FeedUpdated', listener);
    }
  },

  /**
  * Returns the current number of News Feed cards for the given category.
  * @param {CardCategory} category - Card category. Use ReactAppboy.CardCategory.ALL to get the total card count.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once. There is also a slight
  * race condition around calling changeUser, which requests a feed refresh, so the counts may not always be accurate.
  * Be sure to call `subscribeToFeedRefresh` and `requestFeedRefresh` to receive accurate results.
  */
  getCardCountForCategories: function(category, callback) {
    callFunctionWithCallback(AppboyReactBridge.getCardCountForCategories, [category], callback);
  },

  /**
  * Returns the number of unread News Feed cards for the given category.
  * @param {CardCategory} category - Card category. Use ReactAppboy.CardCategory.ALL to get the total unread card count.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once. There is also a slight
  * race condition around calling changeUser, which requests a feed refresh, so the counts may not always be accurate.
  * Be sure to call `subscribeToFeedRefresh` and `requestFeedRefresh` to receive accurate results.
  */
  getUnreadCardCountForCategories: function(category, callback) {
    callFunctionWithCallback(AppboyReactBridge.getUnreadCardCountForCategories, [category], callback);
  },

  /**
  * This method will find the cards of given categories and return them.
  * When the given categories don't exist in any card, this method will return an empty array.
  * @param {CardCategory} category - Card category. Use ReactAppboy.CardCategory.ALL to get the total unread card count.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once. There is also a slight
  * race condition around calling changeUser, which requests a feed refresh, so the counts may not always be accurate.
  * Be sure to call `subscribeToFeedRefresh` and `requestFeedRefresh` to receive accurate results.
  */
  getCardsInCategories: function(category, callback) {
    callFunctionWithCallback(AppboyReactBridge.getCardsInCategories, [category], callback);
  },

  /**
   * This method will find all News Feed cards and return them.
   * @param {function(error, result)} callback - A callback that receives the function call result.
   * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once. There is also a slight
   * race condition around calling changeUser, which requests a feed refresh, so the counts may not always be accurate.
   * Be sure to call `subscribeToFeedRefresh` and `requestFeedRefresh` to receive accurate results.
   */
  getAllCards: function(callback) {
    ReactAppboy.getCardsInCategories(ReactAppboy.CardCategory.ALL, callback);
  },

  /**
   * Programmatically log a card as having been seen by a user. Will fail if no card with the supplied ID can be found
   * in local data.
   * @param {string} cardId The ID of the card for which to log an impression
   * @param {function(error, result)} callback A callback that receives the function call result. The result parameter
   * will be the ID of the logged card on success.
   */
  logCardImpression: function(cardId, callback) {
    callFunctionWithCallback(AppboyReactBridge.logCardImpression, [cardId], callback);
  },

  /**
   * Programmatically log a card as having been clicked by a user. Will fail if no card with the supplied ID can be found
   * in local data.
   * @param {string} cardId The ID of the card for which to log a click
   * @param {function(error, result)} callback A callback that receives the function call result. The result parameter
   * will be the ID of the logged card on success.
   */
  logCardClicked: function(cardId, callback) {
      callFunctionWithCallback(AppboyReactBridge.logCardClicked, [cardId], callback);
  },

  // Feedback
  /**
  * Launches the Feedback UI element.  Not currently supported on Android.
  */
  launchFeedback: function() {
    AppboyReactBridge.launchFeedback();
  },

  // Flush Controls
  /**
  * Requests an immediate flush of any data waiting to be sent to Appboy's servers.
  */
  requestImmediateDataFlush: function() {
    AppboyReactBridge.requestImmediateDataFlush();
  },

  // Data Controls
  /**
  * Wipes Data on the Braze SDK. On iOS, the SDK will be disabled for the rest of the app run.
  */
  wipeData: function() {
    AppboyReactBridge.wipeData();
  },

  /**
  * Disables the Braze SDK immediately.
  */
  disableSDK: function() {
    AppboyReactBridge.disableSDK();
  },

  /**
  * Enables the Braze SDK after a previous call to disableSDK().
  * On iOS, the SDK will be enabled only after a subsequent call to startWithApiKey().
  */
  enableSDK: function() {
    AppboyReactBridge.enableSDK();
  },

  /**
  * Call this method once a user grants location permissions on Android
  * to initialize Braze location features. Calling this method is a no-op on
  * iOS.
  */
  requestLocationInitialization: function() {
    AppboyReactBridge.requestLocationInitialization();
  },

  // Enums
  CardCategory: {
    'ADVERTISING': 'advertising',
    'ANNOUNCEMENTS': 'announcements',
    'NEWS': 'news',
    'SOCIAL': 'social',
    'NO_CATEGORY': 'no_category',
    'ALL': 'all'
  },

  NotificationSubscriptionTypes: {
    'OPTED_IN': 'optedin',
    'SUBSCRIBED': 'subscribed',
    'UNSUBSCRIBED': 'unsubscribed'
  },

  Genders: {
    'FEMALE': 'f',
    'MALE': 'm',
    'NOT_APPLICABLE': 'n',
    'OTHER': 'o',
    'PREFER_NOT_TO_SAY': 'p',
    'UNKNOWN': 'u'
  },

  NewsFeedLaunchOptions: {
    'CARD_WIDTH_FOR_IPHONE': 'cardWidthForiPhone',
    'CARD_WIDTH_FOR_IPAD': 'cardWidthForiPad',
    'MINIMUM_CARD_MARGIN_FOR_IPHONE': 'minimumCardMarginForiPhone',
    'MINIMUM_CARD_MARGIN_FOR_IPAD': 'minimumCardMarginForiPad'
  }
};

module.exports = ReactAppboy;
