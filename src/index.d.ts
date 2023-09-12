// Definitions by: ahanriat <https://github.com/ahanriat>
// TypeScript Version: 3.0

import { EmitterSubscription } from 'react-native';

/**
 * When launching an iOS application that has previously been force closed, React Native's Linking API doesn't
 * support handling deep links embedded in push notifications. This is due to a race condition on startup between
 * the native call to RCTLinkingManager and React's loading of its JavaScript. This function provides a workaround:
 * If an application is launched from a push notification click, we return any Braze deep links in the push payload.
 * @param {function(string)} callback - A callback that retuns the deep link as a string. If there is no deep link,
 * returns null.
 */
export function getInitialURL(callback: (deepLink: string) => void): void;

/**
 * @deprecated This method is deprecated in favor of `getDeviceId`.
 */
export function getInstallTrackingId(callback: Callback<string>): void;

/**
 * Returns a unique ID stored on the device. 
 * 
 * On Android, a randomly generated, app specific ID that is stored on the device. A new ID will be generated if the user 
 * clears the data for the app or removes/re-installs the app. The ID will persist across Braze.changeUser calls.
 * 
 * On iOS, this ID is generated from the IDFV. This behavior will be updated in the next major version.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function getDeviceId(callback: Callback<string>): void;

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
 * @param {string} signature - An encrypted signature to add to network requests to authenticate the current user. You can update the signature
 *   using the `setSdkAuthenticationSignature` method. This signature will only have an effect if SDK Authentication is enabled.
 */
export function changeUser(userId: string, signature?: string): void;

/**
 * Sets the signature to be used to authenticate the current user. You can also set the signature when calling `changeUser`.
 * This signature will only have an effect if SDK Authentication is enabled.
 *
 * @param signature - The signature to add to network requests to authenticate the current user.
 */
export function setSdkAuthenticationSignature(signature: string): void;

/**
 * An alias serves as an alternative unique user identifier. Use aliases to identify users along different
 *    dimensions than your core user ID:
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
export function addAlias(aliasName: string, aliasLabel: string): void;

/**
 * Sets the first name of the user.
 * @param {string} firstName - Limited to 255 characters in length.
 */
export function setFirstName(firstName: string): void;

/**
 * Sets the last name of the user.
 * @param {string} lastName - Limited to 255 characters in length.
 */
export function setLastName(lastName: string): void;

/**
 * Sets the email address of the user.
 * @param {string} email - Must pass RFC-5322 email address validation.
 */
export function setEmail(email: string): void;

/**
 * Sets the gender of the user.
 * @param {Genders} gender - Limited to m, n, o, p, u or f
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function setGender(
  gender: GenderTypes[keyof GenderTypes],
  callback?: Callback<boolean>
): void;

/**
 * Sets the language for the user.
 * @param {string} language - Should be valid ISO 639-1 language code.
 */
export function setLanguage(language: string): void;

/**
 * Sets the country for the user.
 * @param {string} country - Limited to 255 characters in length.
 */
export function setCountry(country: string): void;

/**
 * Sets the home city for the user.
 * @param {string} homeCity - Limited to 255 characters in length.
 */
export function setHomeCity(homeCity: string): void;

/**
 * Sets the phone number of the user.
 * @param {string} phoneNumber - A phone number is considered valid if it is no more than 255 characters in length and
 *    contains only numbers, whitespace, and the following special characters +.-()
 */
export function setPhoneNumber(phoneNumber: string): void;

/**
 * Sets the date of birth of the user.
 * @param {number} year
 * @param {MonthsAsNumber} month - 1-12
 * @param {number} day
 */
export function setDateOfBirth(
  year: number,
  month: MonthsAsNumber,
  day: number
): void;

/**
 * @deprecated This method is deprecated in favor of `registerPushToken`.
 */
export function registerAndroidPushToken(token: string): void;

/**
 * This method posts a token to Braze's servers to associate the token with the current device.
 * @param {string} token - The device's push token.
 */
export function registerPushToken(token: string): void;

/**
 * This method sets the Google Advertising ID and associated ad-tracking enabled field for this device. Note that the
 * SDK does not automatically collect this data.
 *
 * No-op on iOS.
 *
 * @param {string} googleAdvertisingId - The Google Advertising ID
 * @param {boolean} adTrackingEnabled - Whether ad-tracking is enabled for the Google Advertising ID
 */
export function setGoogleAdvertisingId(
  googleAdvertisingId: string,
  adTrackingEnabled: boolean
): void;

/**
 * Adds the user to a subscription group.
 * @param {string} groupId - The string UUID corresponding to the subscription group, provided by the Braze dashboard.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function addToSubscriptionGroup(
  groupId: string,
  callback?: Callback<boolean>
): void;

/**
 * Removes the user from a subscription group.
 * @param {string} groupId - The string UUID corresponding to the subscription group, provided by the Braze dashboard.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function removeFromSubscriptionGroup(
  groupId: string,
  callback?: Callback<boolean>
): void;

/**
 * Sets whether the user should be sent push campaigns.
 * @param {NotificationSubscriptionType} notificationSubscriptionType - Notification setting (explicitly
 *    opted-in, subscribed, or unsubscribed).
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function setPushNotificationSubscriptionType(
  notificationSubscriptionType: NotificationSubscriptionType[keyof NotificationSubscriptionType],
  callback?: Callback<boolean>
): void;

/**
 * Sets whether the user should be sent email campaigns.
 * @param {NotificationSubscriptionType} notificationSubscriptionType - Notification setting (explicitly
 *    opted-in, subscribed, or unsubscribed).
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function setEmailNotificationSubscriptionType(
  notificationSubscriptionType: NotificationSubscriptionType[keyof NotificationSubscriptionType],
  callback?: Callback<boolean>
): void;

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
export function logCustomEvent(
  eventName: string,
  eventProperties?: object
): void;

/**
 * Reports that the current user made an in-app purchase. Useful for tracking and segmenting users.
 * @param {string} productId - A string identifier for the product purchased, e.g. an SKU. Value is limited to
 *      255 characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
 * @param {string} price - The price paid. Base units depend on the currency. As an example, USD should be
 *      reported as Dollars.Cents, whereas JPY should be reported as a whole number of Yen. All provided
 *      values will be rounded to two digits with toFixed(2)
 * @param {BrazeCurrencyCode} currencyCode - Currencies should be represented as an ISO 4217 currency code.
 * @param {number} quantity - The quantity of items purchased expressed as a whole number. Must be at least 1
 *      and at most 100.
 * @param {object} purchaseProperties - Hash of properties for this purchase. Keys are limited to 255
 *      characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
 *      Values can be numeric, boolean, or strings 255 characters or shorter.
 */
export function logPurchase(
  productId: string,
  price: string,
  currencyCode: string,
  quantity: number,
  purchaseProperties?: object
): void;

/**
 * Sets a custom user attribute. This can be any key/value pair and is used to collect extra information about the
 *    user.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
 *    a $, and can only contain alphanumeric characters and punctuation.
 * @param value - Can be numeric, boolean, a Date object, a string, an array of strings, an object, or an array of objects.
 *    Strings are limited to 255 characters in length, cannot begin with a $, and can only contain alphanumeric
 *    characters and punctuation.
 *    Passing a null value will remove this custom attribute from the user.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function setCustomUserAttribute(
  key: string,
  value: number | boolean | string | string[] | Date | null | object | object[],
  callback?: Callback<boolean>
): void;

/**
 * Sets a custom user attribute. This can be any key/value pair and is used to collect extra information about the
 *    user.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
 *    a $, and can only contain alphanumeric characters and punctuation.
 * @param value - Can be numeric, boolean, a Date object, a string, an array of strings, an object, or an array of objects.
 *    Strings are limited to 255 characters in length, cannot begin with a $, and can only contain alphanumeric
 *    characters and punctuation.
 *    Passing a null value will remove this custom attribute from the user.
 * @param merge - If the value is object, this boolean indicates if the value should be merged into the existing key.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function setCustomUserAttribute(
  key: string,
  value: number | boolean | string | string[] | Date | null | object | object[],
  merge: boolean,
  callback?: Callback<boolean>
): void;

/**
 * Adds a string to a custom atttribute string array, or creates that array if one doesn't exist.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin
 *    with a $, and can only contain alphanumeric characters and punctuation.
 * @param {string} value - The string to be added to the array. Strings are limited to 255 characters in length,
 *    cannot begin with a $, and can only contain alphanumeric characters and punctuation.
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function addToCustomUserAttributeArray(
  key: string,
  value: string,
  callback?: Callback<boolean>
): void;

/**
 * Removes a string from a custom attribute string array.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin
 *    with a $, and can only contain alphanumeric characters and punctuation.
 * @param {string} value - The string to be added to the array. Strings are limited to 255 characters in length,
 *    cannot begin with a $, and can only contain alphanumeric characters and punctuation.
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function removeFromCustomUserAttributeArray(
  key: string,
  value: string,
  callback?: Callback<boolean>
): void;

/**
 * Unsets a custom user attribute.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length,
 *    cannot begin with a $, and can only contain alphanumeric characters and punctuation.
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function unsetCustomUserAttribute(
  key: string,
  callback?: Callback<boolean>
): void;

/**
 * Increment/decrement the value of a custom attribute. Only numeric custom attributes can be incremented. Attempts to
 *    increment a custom attribute that is not numeric be ignored. If you increment a custom attribute that has not
 *    previously been set, a custom attribute will be created and assigned the value of incrementValue. To decrement
 *    the value of a custom attribute, use a negative incrementValue.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin
 *    with a $, and can only contain alphanumeric characters and punctuation.
 * @param {number} value - May be negative to decrement.
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function incrementCustomUserAttribute(
  key: string,
  value: number,
  callback?: Callback<boolean>
): void;

/**
 * Sets user attribution data.
 *
 * @param {string} network - The attribution network
 * @param {string} campaign - The attribution campaign
 * @param {string} adGroup - The attribution adGroup
 * @param {string} creative - The attribution creative
 */
export function setAttributionData(
  network: string,
  campaign: string,
  adGroup: string,
  creative: string
): void;

/**
 * Launches the News Feed UI element.
 */
export function launchNewsFeed(): void;

export interface NewsFeedCardBase {
  id: string;
  created: number;
  updated: number;
  viewed: boolean;
  url?: string;
  extras: { [key: string]: string };
}

export interface BannerNewsFeedCard extends NewsFeedCardBase {
  type: 'Banner';
  image: string;
  imageAspectRatio: number;
}

export interface CaptionedNewsFeedCard extends NewsFeedCardBase {
  type: 'Captioned';
  image: string;
  title: string;
  cardDescription: string;
  domain?: string;
}

export interface TextAnnouncementNewsFeedCard extends NewsFeedCardBase {
  type: 'TextAnnouncement';
  title: string;
  cardDescription: string;
  domain?: string;
}

export type NewsFeedCard =
  | BannerNewsFeedCard
  | CaptionedNewsFeedCard
  | TextAnnouncementNewsFeedCard;

/**
 * Manually log a click to Braze for a particular news feed card.
 * The SDK will only log a card click when the card has the url property with a valid value.
 * @param {string} id
 */
export function logNewsFeedCardClicked(id: string): void;

/**
 * Manually log an impression to Braze for a particular news feed card.
 * @param {string} id
 */
export function logNewsFeedCardImpression(id: string): void;

/**
 * Returns an array of news feed cards.
 * @returns {Promise<NewsFeedCard[]>}
 */
export function getNewsFeedCards(): Promise<NewsFeedCard[]>;

// Content Cards
export interface ContentCardBase {
  id: string;
  created: number;
  expiresAt: number;
  viewed: boolean;
  clicked: boolean;
  pinned: boolean;
  dismissed: boolean;
  dismissible: boolean;
  url?: string;
  openURLInWebView: boolean;
  isControl: boolean;
  extras: { [key: string]: string };
}

export interface ClassicContentCard extends ContentCardBase {
  type: 'Classic';
  image?: string;
  title: string;
  cardDescription: string;
  domain?: string;
}

export interface BannerContentCard extends ContentCardBase {
  type: 'Banner';
  image: string;
  imageAspectRatio: number;
}

export interface CaptionedContentCard extends ContentCardBase {
  type: 'Captioned';
  image: string;
  imageAspectRatio: number;
  title: string;
  cardDescription: string;
  domain?: string;
}

export type ContentCard =
  | ClassicContentCard
  | BannerContentCard
  | CaptionedContentCard;

/**
 * Launches the Content Cards UI element.
 */
export function launchContentCards(): void;

/**
 * Requests a refresh of the content cards from Braze's servers.
 */
export function requestContentCardsRefresh(): void;

/**
 * Manually log a click to Braze for a particular card.
 * The SDK will only log a card click when the card has the url property with a valid value.
 * @param {string} id
 */
export function logContentCardClicked(id: string): void;

/**
 * Manually log a dismissal to Braze for a particular card.
 * @param {string} id
 */
export function logContentCardDismissed(id: string): void;

/**
 * Manually log an impression to Braze for a particular card.
 * @param {string} id
 */
export function logContentCardImpression(id: string): void;

/**
 * Performs a refresh and then returns a content cards array.
 * @returns {Promise<ContentCard[]>}
 */
export function getContentCards(): Promise<ContentCard[]>;

/**
 * Returns the most recent Content Cards array from the cache.
 * @returns {Promise<ContentCard[]>}
 */
export function getCachedContentCards(): Promise<ContentCard[]>;

/**
 * @deprecated This method is a no-op on iOS.
 */
export function getCardCountForCategories(
  category: BrazeCardCategory[keyof BrazeCardCategory],
  callback: Callback<number>
): void;

/**
 * @deprecated This method is a no-op on iOS.
 */
export function getUnreadCardCountForCategories(
  category: BrazeCardCategory[keyof BrazeCardCategory],
  callback: Callback<number>
): void;

/**
 * Requests a News Feed refresh.
 */
export function requestFeedRefresh(): void;

/**
 * Requests an immediate flush of any data waiting to be sent to Braze's servers.
 */
export function requestImmediateDataFlush(): void;

/**
 * Wipes Data on the Braze SDK. On iOS, the SDK will be disabled for the rest of the app run.
 */
export function wipeData(): void;

/**
 * Disables the Braze SDK immediately.
 */
export function disableSDK(): void;

/**
 * Enables the Braze SDK after a previous call to disableSDK().
 * On iOS, the SDK will be enabled only after a subsequent call to startWithApiKey().
 */
export function enableSDK(): void;

/**
 * Call this method once a user grants location permissions on Android
 * to initialize Braze location features. Calling this method is a no-op on
 * iOS.
 */
export function requestLocationInitialization(): void;

/**
 * Call this method to request a Braze Geofences update for a manually provided
 * GPS coordinate. Automatic Braze Geofence requests must be disabled to properly
 * use this method. Calling this method is a no-op on iOS.
 * @param {double} latitude - Location latitude.
 * @param {double} longitude - Location longitude.
 */
export function requestGeofences(latitude: number, longitude: number): void;

/**
 * Sets a custom location attribute for the user.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length, cannot begin with
 * a $, and can only contain alphanumeric characters and punctuation.
 * @param {number} latitude - Location latitude.
 * @param {number} longitude - Location longitude.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function setLocationCustomAttribute(
  key: string,
  latitude: number,
  longitude: number,
  callback?: Callback<undefined>
): void;

/**
 * Sets the last known location for the user. For Android, latitude and longitude are required, with altitude and horizontal accuracy being optional parameters, and vertical accuracy being a no-op.
 * For iOS, latitude, longitude, and horizontal accuracy are required, with altitude and vertical accuracy being optional parameters.
 * Calling this method with invalid parameters for a specific platform is a no-op. Latitude, longitude, and horizontal accuracy are the minimum required parameters to work for all platforms.
 * @param {number} latitude - Location latitude. Required.
 * @param {number} longitude - Location longitude. Required.
 * @param {number} altitude - Location altitude. May be null for both platforms.
 * @param {number} horizontalAccuracy - Location horizontal accuracy. Equivalent to accuracy for Android. May be null for Android only; required for iOS.
 * @param {number} verticalAccuracy - Location vertical accuracy. May be null for iOS. No-op for Android.
 */
 export function setLastKnownLocation(
  latitude: number,
  longitude: number,
  altitude?: number | null,
  horizontalAccuracy?: number | null,
  verticalAccuracy?: number | null
): void;

/**
 * Call this method to have the SDK publish an "inAppMessageReceived" event containing the in-app message data to the
 * Javascript layer. You can listen to this event with `Braze.addListener()`.
 *
 * @param {boolean} useBrazeUI - Whether to use the default Braze UI for in-app messages.
 * @param {function} callback - The method to call when an in-app message is received.
 *
 * @returns subscription - If a callback is passed to the function, returns the subscription. When you want to stop
 * listening, call `.remove()` on the returned subscription. Returns undefined if no callback is provided.
 */
export function subscribeToInAppMessage(
  useBrazeUI: boolean,
  callback?: (event: {inAppMessage: BrazeInAppMessage}) => void
): EmitterSubscription | undefined;

/**
 * Dismisses the currently displayed in app message.
 */
export function hideCurrentInAppMessage(): void;

/**
 * Logs a click for the provided in-app message data
 * @param {BrazeInAppMessage} inAppMessage
 */
export function logInAppMessageClicked(inAppMessage: BrazeInAppMessage): void;

/**
 * Logs an impression for the provided in-app message data
 * @param {BrazeInAppMessage} inAppMessage
 */
export function logInAppMessageImpression(
  inAppMessage: BrazeInAppMessage
): void;

/**
 * Logs a button click for the provided in-app message button data
 * @param {BrazeInAppMessage} inAppMessage
 * @param {number} buttonId
 */
export function logInAppMessageButtonClicked(
  inAppMessage: BrazeInAppMessage,
  buttonId: number
): void;

type PermissionOptions = 'alert' | 'badge' | 'sound' | 'provisional';
/**
 * Requests a push permission prompt. On Android 12 and below, this is a no-op.
 *
 * @param permissionOptions - iOS permission options that determine the authorized features of local and remote notifications. If not provided,
 *   all permission options except provisional are set to true.
 */
export function requestPushPermission(
  permissionOptions?: Record<PermissionOptions, boolean>
): void;

/**
 * Notifies the bridge of a listener being added.
 * @param {Events} event
 */
export function addListener(
  event: string
): void;

export interface FeatureFlagStringProperty {
  type: "string";
  value: string;
}

export interface FeatureFlagNumberProperty {
  type: "number";
  value: number;
}

export interface FeatureFlagBooleanProperty {
  type: "boolean";
  value: boolean;
}

export class FeatureFlag {
  /** Indicates whether or not this feature flag is enabled. */
  enabled: boolean;

  /** Properties of this feature flag, listed as key-value pairs. */
  properties: Partial<Record<string, FeatureFlagStringProperty | FeatureFlagNumberProperty | FeatureFlagBooleanProperty>>;

  /** The ID for this feature flag. */
  id: string;
}

/**
 * Returns all available feature flags
 * @returns {Promise<FeatureFlag[]>}
 */
export function getAllFeatureFlags(): Promise<FeatureFlag[]>;

/**
 * Get a feature flag by its ID
 * @returns {Promise<FeatureFlag>}
 */
export function getFeatureFlag(id: string): Promise<FeatureFlag>;

/**
 * Get value of a feature flag property of type boolean.
 * 
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type boolean.
 *    If the key is not found or if there is a type mismatch, this method will return a null.
 */
export function getFeatureFlagBooleanProperty(id: string, key: string): Promise<boolean | null>;

/**
 * Get value of a feature flag property of type string.
 *
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type string.
 *    If the key is not found or if there is a type mismatch, this method will return a null.
 */
export function getFeatureFlagStringProperty(id: string, key: string): Promise<string | null>;

/**
 * Get value of a feature flag property of type number.
 *
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type number.
 *    If the key is not found or if there is a type mismatch, this method will return a null.
 */
export function getFeatureFlagNumberProperty(id: string, key: string): Promise<number | null>;

/**
 * Requests a refresh of Feature Flags from the Braze server.
 */
export function refreshFeatureFlags(): void;

/**
 * Logs an impression for the Feature Flag with the provided ID.
 * 
 * @param id - The ID of the feature flag.
 */
export function logFeatureFlagImpression(id: string): void;

export class BrazeInAppMessage {
  constructor(_data: string);
  inAppMessageJsonString: string;
  message: string;
  header: string;
  uri: string;
  imageUrl: string;
  zippedAssetsUrl: string;
  useWebView: boolean;
  duration: number;
  clickAction: BrazeClickAction[keyof BrazeClickAction];
  dismissType: BrazeDismissType[keyof BrazeDismissType];
  messageType: BrazeMessageType[keyof BrazeMessageType];
  extras: { [key: string]: string };
  buttons: [BrazeButton];
  toString(): string;
}

export class BrazeButton {
  constructor(_data: string);
  text: string;
  uri: string;
  useWebView: boolean;
  clickAction: BrazeClickAction[keyof BrazeClickAction];
  id: number;
  toString(): string;
}

type MonthsAsNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface BrazeClickAction {
  NEWS_FEED: 'news_feed';
  URI: 'uri';
  NONE: 'none';
}
export const ClickAction: BrazeClickAction;

interface BrazeDismissType {
  SWIPE: 'swipe';
  AUTO_DISMISS: 'auto_dismiss';
}
export const DismissType: BrazeDismissType;

interface BrazeMessageType {
  SLIDEUP: 'slideup';
  MODAL: 'modal';
  FULL: 'full';
  HTML_FULL: 'html_full';
}
export const MessageType: BrazeMessageType;

interface BrazeCardCategory {
  ADVERTISING: 'advertising';
  ANNOUNCEMENTS: 'announcements';
  NEWS: 'news';
  SOCIAL: 'social';
  NO_CATEGORY: 'no_category';
  ALL: 'all';
}
export const CardCategory: BrazeCardCategory;

interface GenderTypes {
  MALE: 'm';
  FEMALE: 'f';
  NOT_APPLICABLE: 'n';
  OTHER: 'o';
  PREFER_NOT_TO_SAY: 'p';
  UNKNOWN: 'u';
}
export const Genders: GenderTypes;

interface NotificationSubscriptionType {
  OPTED_IN: 'optedin';
  SUBSCRIBED: 'subscribed';
  UNSUBSCRIBED: 'unsubscribed';
}
export const NotificationSubscriptionTypes: NotificationSubscriptionType;

export interface SDKAuthenticationErrorType {
  error_code: string;
  user_id: string;
  original_signature: string;
  reason: string;
}

export interface PushNotificationEvent {
  push_event_type: string;
  title: string;
  deeplink: string;
  content_text: string;
  summary_text: string;
  image_url: string;
  raw_android_push_data: string;
  kvp_data: { [key: string]: any };
}

export interface ContentCardsUpdatedEvent {
  cards: ContentCard[];
}

interface BrazeEvent {
  /** Callback passes an object with the `cards` as of the latest refresh. */
  CONTENT_CARDS_UPDATED: 'contentCardsUpdated';
  /** Callback passes an object containing "error_code", "user_id", "original_signature", and "reason". */
  SDK_AUTHENTICATION_ERROR: 'sdkAuthenticationError';
  /** Callback passes the BrazeInAppMessage object. */
  IN_APP_MESSAGE_RECEIVED: 'inAppMessageReceived';
  /** Callback that triggers when Feature Flags have received an update in the latest refresh. */
  FEATURE_FLAGS_UPDATED: 'featureFlagsUpdated';
  /** Only supported on Android. */
  PUSH_NOTIFICATION_EVENT: 'pushNotificationEvent';
}
export const Events: BrazeEvent;

/** Callback passes an object with the `cards` as of the latest refresh. */
export function addListener(event: "contentCardsUpdated", callback: (update: ContentCardsUpdatedEvent) => void): EmitterSubscription;
/** Callback passes an object containing "error_code", "user_id", "original_signature", and "reason". */
export function addListener(event: "sdkAuthenticationError", callback: (sdkAuthenticationError: SDKAuthenticationErrorType) => void): EmitterSubscription;
/** Callback passes the BrazeInAppMessage object. */
export function addListener(event: "inAppMessageReceived", callback: (inAppMessage: BrazeInAppMessage) => void): EmitterSubscription;
/** Callback passes the Feature Flags array. */
export function addListener(event: "featureFlagsUpdated", callback: (flags: FeatureFlag[]) => void): EmitterSubscription;
/** Only supported on Android. */
export function addListener(event: "pushNotificationEvent", callback: (notification: PushNotificationEvent) => void): EmitterSubscription;

type Callback<T> = (error?: object, result?: T) => void;

type BrazeCurrencyCode =
  | 'AED'
  | 'AFN'
  | 'ALL'
  | 'AMD'
  | 'ANG'
  | 'AOA'
  | 'ARS'
  | 'AUD'
  | 'AWG'
  | 'AZN'
  | 'BAM'
  | 'BBD'
  | 'BDT'
  | 'BGN'
  | 'BHD'
  | 'BIF'
  | 'BMD'
  | 'BND'
  | 'BOB'
  | 'BRL'
  | 'BSD'
  | 'BTC'
  | 'BTN'
  | 'BWP'
  | 'BYR'
  | 'BZD'
  | 'CAD'
  | 'CDF'
  | 'CHF'
  | 'CLF'
  | 'CLP'
  | 'CNY'
  | 'COP'
  | 'CRC'
  | 'CUC'
  | 'CUP'
  | 'CVE'
  | 'CZK'
  | 'DJF'
  | 'DKK'
  | 'DOP'
  | 'DZD'
  | 'EEK'
  | 'EGP'
  | 'ERN'
  | 'ETB'
  | 'EUR'
  | 'FJD'
  | 'FKP'
  | 'GBP'
  | 'GEL'
  | 'GGP'
  | 'GHS'
  | 'GIP'
  | 'GMD'
  | 'GNF'
  | 'GTQ'
  | 'GYD'
  | 'HKD'
  | 'HNL'
  | 'HRK'
  | 'HTG'
  | 'HUF'
  | 'IDR'
  | 'ILS'
  | 'IMP'
  | 'INR'
  | 'IQD'
  | 'IRR'
  | 'ISK'
  | 'JEP'
  | 'JMD'
  | 'JOD'
  | 'JPY'
  | 'KES'
  | 'KGS'
  | 'KHR'
  | 'KMF'
  | 'KPW'
  | 'KRW'
  | 'KWD'
  | 'KYD'
  | 'KZT'
  | 'LAK'
  | 'LBP'
  | 'LKR'
  | 'LRD'
  | 'LSL'
  | 'LTL'
  | 'LVL'
  | 'LYD'
  | 'MAD'
  | 'MDL'
  | 'MGA'
  | 'MKD'
  | 'MMK'
  | 'MNT'
  | 'MOP'
  | 'MRO'
  | 'MTL'
  | 'MUR'
  | 'MVR'
  | 'MWK'
  | 'MXN'
  | 'MYR'
  | 'MZN'
  | 'NAD'
  | 'NGN'
  | 'NIO'
  | 'NOK'
  | 'NPR'
  | 'NZD'
  | 'OMR'
  | 'PAB'
  | 'PEN'
  | 'PGK'
  | 'PHP'
  | 'PKR'
  | 'PLN'
  | 'PYG'
  | 'QAR'
  | 'RON'
  | 'RSD'
  | 'RUB'
  | 'RWF'
  | 'SAR'
  | 'SBD'
  | 'SCR'
  | 'SDG'
  | 'SEK'
  | 'SGD'
  | 'SHP'
  | 'SLL'
  | 'SOS'
  | 'SRD'
  | 'STD'
  | 'SVC'
  | 'SYP'
  | 'SZL'
  | 'THB'
  | 'TJS'
  | 'TMT'
  | 'TND'
  | 'TOP'
  | 'TRY'
  | 'TTD'
  | 'TWD'
  | 'TZS'
  | 'UAH'
  | 'UGX'
  | 'USD'
  | 'UYU'
  | 'UZS'
  | 'VEF'
  | 'VND'
  | 'VUV'
  | 'WST'
  | 'XAF'
  | 'XAG'
  | 'XAU'
  | 'XCD'
  | 'XDR'
  | 'XOF'
  | 'XPD'
  | 'XPF'
  | 'XPT'
  | 'YER'
  | 'ZAR'
  | 'ZMK'
  | 'ZMW'
  | 'ZWL';