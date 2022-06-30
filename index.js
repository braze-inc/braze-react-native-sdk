const AppboyReactBridge = require('react-native').NativeModules.AppboyReactBridge;
const Platform = require('react-native').Platform;
const NativeEventEmitter = require('react-native').NativeEventEmitter;
const DeviceEventEmitter = require('react-native').DeviceEventEmitter;

const AppboyEventEmitter = Platform.select({
  ios: new NativeEventEmitter(AppboyReactBridge),
  android: DeviceEventEmitter
});

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

function parseNestedProperties(object) {
  if (object instanceof Array) {
    for (let i = 0; i < object.length; i++) {
      if (object[i] instanceof Date){
        var dateProp = object[i];
        object[i] = {
          type: "UNIX_timestamp",
          value: dateProp.valueOf()
        }
      } else {
        parseNestedProperties(object[i]);
      }
    }
  } else if (object instanceof Object) {
    for (const key of keys(object)) {
      if (object[key] instanceof Date) {
        var dateProp = object[key];
        object[key] = {
          type: "UNIX_timestamp",
          value: dateProp.valueOf()
        }
      } else {
        parseNestedProperties(object[key]);
      }
    }
  }
}

function keys(a) {
  const keys = [];
  for (let k in a) {
    if (a.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  return keys;
}

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
  * Returns a unique device ID for install tracking. This method is equivalent to calling
  * Appboy.getInstallTrackingId() on Android and returns the IDFV on iOS.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  getInstallTrackingId: function(callback) {
    callFunctionWithCallback(AppboyReactBridge.getInstallTrackingId, [], callback);
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
  * @param {string} signature - An optional authentication signature to be used with the SDK Authentication feature.
  */
  changeUser: function(userId, signature) {
    AppboyReactBridge.setSDKFlavor();
    AppboyReactBridge.setMetadata();
    AppboyReactBridge.changeUser(userId, signature != null ? signature : null);
  },

  /**
   * Sets the signature to be used to authenticate the current user. You can also set the signature when calling `changeUser`.
   * This signature will only have an effect if SDK Authentication is enabled.
   *
   * @param signature - The signature to add to network requests to authenticate the current user.
   */
  setSdkAuthenticationSignature: function(signature) {
    AppboyReactBridge.setSdkAuthenticationSignature(signature);
  },

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
  addAlias: function(aliasName, aliasLabel) {
    AppboyReactBridge.setSDKFlavor();
    AppboyReactBridge.setMetadata();
    AppboyReactBridge.addAlias(aliasName, aliasLabel);
  },

  /**
  * This method posts a token to Appboy's servers to associate the token with the current device.
  *
  * No-op on iOS.
  *
  * @param {string} token - The device's push token.
  */
  registerAndroidPushToken: function(token) {
    AppboyReactBridge.registerAndroidPushToken(token);
  },

  /**
  * This method sets the Google Advertising ID and associated ad-tracking enabled field for this device. Note that the
  * SDK does not automatically collect this data.
  *
  * No-op on iOS.
  *
  * @param {string} googleAdvertisingId - The Google Advertising ID
  * @param {boolean} adTrackingEnabled - Whether ad-tracking is enabled for the Google Advertising ID
  */
 setGoogleAdvertisingId: function(googleAdvertisingId, adTrackingEnabled) {
    AppboyReactBridge.setGoogleAdvertisingId(googleAdvertisingId, adTrackingEnabled);
  },

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
  logCustomEvent: function(eventName, eventProperties) {
    AppboyReactBridge.setSDKFlavor();
    AppboyReactBridge.setMetadata();
    parseNestedProperties(eventProperties);
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
  *      Values can be numeric, boolean, Date, or strings 255 characters or shorter.
  */
  logPurchase: function(productId, price, currencyCode, quantity, purchaseProperties) {
    parseNestedProperties(purchaseProperties);
    AppboyReactBridge.logPurchase(productId, price, currencyCode, quantity, purchaseProperties);
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
  * Sets the language for the user.
  * @param {string} language - Should be valid ISO 639-1 language code.
  */
  setLanguage: function(language) {
    AppboyReactBridge.setLanguage(language);
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
  * Sets the date of birth of the user.
  * @param {integer} year
  * @param {integer} month - 1-12
  * @param {integer} day
  */
  setDateOfBirth: function(year, month, day) {
    AppboyReactBridge.setDateOfBirth(year, month, day);
  },

  /**
  * Adds the user to a subscription group.
  * @param {string} groupId - The string UUID corresponding to the subscription group, provided by the Braze dashboard.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
   addToSubscriptionGroup: function(groupId, callback) {
    callFunctionWithCallback(AppboyReactBridge.addToSubscriptionGroup, [groupId], callback);
  },

  /**
  * Removes the user from a subscription group.
  * @param {string} groupId - The string UUID corresponding to the subscription group, provided by the Braze dashboard.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
   removeFromSubscriptionGroup: function(groupId, callback) {
    callFunctionWithCallback(AppboyReactBridge.removeFromSubscriptionGroup, [groupId], callback);
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

  /**
   * Sets user attribution data.
   *
   * @param {string} network - The attribution network
   * @param {string} campaign - The attribution campaign
   * @param {string} adGroup - The attribution adGroup
   * @param {string} creative - The attribution creative
   */
  setAttributionData: function(network, campaign, adGroup, creative) {
    AppboyReactBridge.setAttributionData(network, campaign, adGroup, creative);
  },

  // News Feed
  /**
  * Launches the News Feed UI element.
  */
  launchNewsFeed: function() {
    AppboyReactBridge.launchNewsFeed();
  },

  // Content Cards
  /**
  * Launches the Content Cards UI element.
  */
  launchContentCards: function() {
    AppboyReactBridge.launchContentCards();
  },

  /**
   * Returns a content cards array
   * @returns {Promise<ContentCard[]>}
   */
  getContentCards: function() {
    return AppboyReactBridge.getContentCards();
  },

  /**
   * Manually log a click to Braze for a particular card.
   * The SDK will only log a card click when the card has the url property with a valid value.
   * @param {string} id
   */
  logContentCardClicked: function(id) {
    AppboyReactBridge.logContentCardClicked(id);
  },

  /**
   * Manually log a dismissal to Braze for a particular card.
   * @param {string} id
   */
  logContentCardDismissed: function(id) {
    AppboyReactBridge.logContentCardDismissed(id);
  },

  /**
   * Manually log an impression to Braze for a particular card.
   * @param {string} id
   */
  logContentCardImpression: function(id) {
    AppboyReactBridge.logContentCardImpression(id);
  },

  /**
   * Requests a News Feed refresh.
   */
  requestFeedRefresh: function() {
    AppboyReactBridge.requestFeedRefresh();
  },

  /**
  * Returns the current number of News Feed cards for the given category.
  * @param {CardCategory} category - Card category. Use ReactAppboy.CardCategory.ALL to get the total card count.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once. There is also a slight
  * race condition around calling changeUser, which requests a feed refresh, so the counts may not always be accurate.
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
  */
  getUnreadCardCountForCategories: function(category, callback) {
    callFunctionWithCallback(AppboyReactBridge.getUnreadCardCountForCategories, [category], callback);
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
  * Starts the Braze SDK with an API key
  */
   startWithApiKey: function(apiKey, options) {
    AppboyReactBridge.startWithApiKey(apiKey, options);
  },

  /**
  * Call this method once a user grants location permissions on Android
  * to initialize Braze location features. Calling this method is a no-op on
  * iOS.
  */
  requestLocationInitialization: function() {
    AppboyReactBridge.requestLocationInitialization();
  },

  /**
  * Call this method to request a Braze Geofences update for a manually provided
  * GPS coordinate. Automatic Braze Geofence requests must be disabled to properly
  * use this method. Calling this method is a no-op on iOS.
  * @param {double} latitude - Location latitude.
  * @param {double} longitude - Location longitude.
  */
  requestGeofences: function(latitude, longitude) {
    AppboyReactBridge.requestGeofences(latitude, longitude);
  },

  /**
  * Sets a custom location attribute for the user.
  * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
  * a $, and can only contain alphanumeric characters and punctuation.
  * @param {double} latitude - Location latitude.
  * @param {double} longitude - Location longitude.
  * @param {function(error, result)} callback - A callback that receives the function call result.
  */
  setLocationCustomAttribute: function(key, latitude, longitude, callback) {
    callFunctionWithCallback(AppboyReactBridge.setLocationCustomAttribute, [key, latitude, longitude], callback);
  },

  // Refresh Content Cards
  /**
  * Requests a refresh of the content cards from Appboy's servers.
  */
  requestContentCardsRefresh: function() {
    AppboyReactBridge.requestContentCardsRefresh();
  },

  // Dismiss In App Message
  /**
  * Dismisses the currently displayed in app message.
  */
  hideCurrentInAppMessage: function() {
    AppboyReactBridge.hideCurrentInAppMessage();
  },

  /**
   * Logs a click for the provided in-app message data
   * @param {BrazeInAppMessage} inAppMessage
   */
  logInAppMessageClicked: function(inAppMessage) {
    const inAppMessageString = inAppMessage.toString();
    AppboyReactBridge.logInAppMessageClicked(inAppMessageString);
  },

  /**
   * Logs an impression for the provided in-app message data
   * @param {BrazeInAppMessage} inAppMessage
   */
  logInAppMessageImpression: function(inAppMessage) {
    const inAppMessageString = inAppMessage.toString();
    AppboyReactBridge.logInAppMessageImpression(inAppMessageString);
  },

  /**
   * Logs a button click for the provided in-app message button data
   * @param {BrazeInAppMessage} inAppMessage
   * @param {number} buttonId
   */
  logInAppMessageButtonClicked: function(inAppMessage, buttonId) {
    const inAppMessageString = inAppMessage.toString();
    AppboyReactBridge.logInAppMessageButtonClicked(inAppMessageString, buttonId);
  },

  // Events
  /**
   * Subscribes to the specific SDK event.
   * When you want to stop listening, call `.remove()` on the returned
   * subscription.
   * @param {Events} event
   * @param {function} subscriber
   */
  addListener: function(event, subscriber) {
    return AppboyEventEmitter.addListener(event, subscriber);
  },

  BrazeInAppMessage: class {
    constructor(_data) {
      this.inAppMessageJsonString = _data;
      let inAppMessageJson = JSON.parse(this.inAppMessageJsonString);
      let messageJson = inAppMessageJson["message"];
      if (typeof messageJson === 'string') {
        this.message = messageJson;
      } else {
        this.message = '';
      }
      let headerJson = inAppMessageJson["header"];
      if (typeof headerJson === 'string') {
        this.header = headerJson;
      } else {
        this.header = '';
      }
      let uriJson = inAppMessageJson["uri"];
      if (typeof uriJson === 'string') {
        this.uri = uriJson;
      } else {
        this.uri = '';
      }
      let imageUrlJson = inAppMessageJson["image_url"];
      if (typeof imageUrlJson === 'string') {
        this.imageUrl = imageUrlJson;
      } else {
        this.imageUrl = '';
      }
      let zippedAssetsUrlJson = inAppMessageJson["zipped_assets_url"];
      if (typeof zippedAssetsUrlJson === 'string') {
        this.zippedAssetsUrl = zippedAssetsUrlJson;
      } else {
        this.zippedAssetsUrl = '';
      }
      let useWebViewJson = inAppMessageJson["use_webview"];
      if (typeof useWebViewJson === 'boolean') {
        this.useWebView = useWebViewJson;
      } else {
        this.useWebView = false;
      }
      let durationJson = inAppMessageJson["duration"];
      if (typeof durationJson === 'number') {
        this.duration = durationJson;
      } else {
        this.duration = 5;
      }
      let clickActionJson = inAppMessageJson["click_action"];
      this.clickAction = ReactAppboy.ClickAction['NONE'];
      if (typeof clickActionJson === 'string') {
        Object.values(ReactAppboy.ClickAction).forEach(action => {
          if (action.toLowerCase().endsWith(clickActionJson
            .toLowerCase())) {
            this.clickAction = action;
          }
        });
      }
      let dismissTypeJson = inAppMessageJson["message_close"];
      this.dismissType = ReactAppboy.DismissType['AUTO_DISMISS'];
      if (typeof dismissTypeJson === 'string') {
        Object.values(ReactAppboy.DismissType).forEach(type => {
          if (type.toLowerCase().endsWith(dismissTypeJson
            .toLowerCase())) {
            this.dismissType = type;
          }
        });
      }
      let messageTypeJson = inAppMessageJson["type"];
      this.messageType = ReactAppboy.MessageType['SLIDEUP'];
      if (typeof messageTypeJson === 'string') {
        Object.values(ReactAppboy.MessageType).forEach(type => {
          if (type.toLowerCase().endsWith(messageTypeJson
            .toLowerCase())) {
            this.messageType = type;
          }
        });
      }
      let extrasJson = inAppMessageJson["extras"];
      this.extras = {};
      if (typeof extrasJson === 'object') {
        Object.keys(extrasJson).forEach(key=> {
          if (typeof extrasJson[key] === 'string') {
            this.extras[key] = extrasJson[key];
          }
        });
      }
      this.buttons = [];
      let buttonsJson = inAppMessageJson["btns"];
      if (typeof buttonsJson === 'object' && Array.isArray(buttonsJson)) {
        buttonsJson.forEach(buttonJson => {
          this.buttons.push(new ReactAppboy.BrazeButton(buttonJson));
        });
      }
    }
    toString() {
      return this.inAppMessageJsonString;
    }
  },

  BrazeButton: class {
    constructor(buttonJson) {
      let textJson = buttonJson['text'];
      if (typeof textJson === 'string') {
        this.text = textJson;
      } else {
        this.text = '';
      }
      let uriJson = buttonJson['uri'];
      if (typeof uriJson === 'string') {
        this.uri = uriJson;
      } else {
        this.uri = '';
      }
      let useWebViewJson = buttonJson["use_webview"];
      if (typeof useWebViewJson === 'boolean') {
        this.useWebView = useWebViewJson;
      } else {
        this.useWebView = false;
      }
      let clickActionJson = buttonJson["click_action"];
      this.clickAction = ReactAppboy.ClickAction['NONE'];
      if (typeof clickActionJson === 'string') {
        Object.values(ReactAppboy.ClickAction).forEach(action => {
          if (action.toLowerCase().endsWith(clickActionJson
            .toLowerCase())) {
            this.clickAction = action;
          }
        });
      }
      let idJson = buttonJson["id"];
      if (typeof idJson === 'number') {
        this.id = idJson;
      } else {
        this.id = 0;
      }
    }
    toString() {
      return "BrazeButton text:" + this.text + " uri:" + this.uri + " clickAction:"
          + this.clickAction.toString() + " useWebView:" + this.useWebView.toString();
    }
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

  ContentCardTypes: {
    'CLASSIC': 'Classic',
    'BANNER': 'Banner',
    'CAPTIONED': 'Captioned'
  },

  Events: {
    'CONTENT_CARDS_UPDATED': 'contentCardsUpdated',
    'SDK_AUTHENTICATION_ERROR': 'sdkAuthenticationError'
  },

  ClickAction: {
    'NEWS_FEED': 'news_feed',
    'URI': 'uri',
    'NONE': 'none'
  },

  DismissType: {
    'SWIPE': 'swipe',
    'AUTO_DISMISS': 'auto_dismiss'
  },

  MessageType: {
    'SLIDEUP': 'slideup',
    'MODAL': 'modal',
    'FULL': 'full',
    'HTML_FULL': 'html_full'
  }
};

module.exports = ReactAppboy;
