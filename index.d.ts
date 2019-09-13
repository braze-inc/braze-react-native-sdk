// Definitions by: ahanriat <https://github.com/ahanriat>
// TypeScript Version: 3.0

import { EmitterSubscription } from 'react-native';

/**
 * When launching an iOS application that has previously been force closed, React Native's Linking API doesn't
 * support handling deep links embedded in push notifications. This is due to a race condition on startup between
 * the native call to RCTLinkingManager and React's loading of its JavaScript. This function provides a workaround:
 * If an application is launched from a push notification click, we return any Appboy deep links in the push payload.
 * @param {function(string)} callback - A callback that retuns the deep link as a string. If there is no deep link,
 * returns null.
 */
export function getInitialURL(callback: (deepLink: string) => void): void;

/**
 * Returns a unique device ID for install tracking. This method is equivalent to calling
 * Appboy.getInstallTrackingId() on Android and returns the IDFV on iOS.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function getInstallTrackingId(callback: Callback): void;

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
export function changeUser(userId: string): void;

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
export function addAlias(aliasName: string,
  aliasLabel: string
): void;

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
  callback?: Callback
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
 * Sets the url for the avatar image for the user, which will be displayed on the user profile and throughout
 * the Appboy dashboard.
 * @param {string} avatarImageUrl
 */
export function setAvatarImageUrl(avatarImageUrl: string): void;

/**
 * Sets the date of birth of the user.
 * @param {number} year
 * @param {MonthsAsNumber} month - 1-12
 * @param {number} day
 */
export function setDateOfBirth(year: number, month: MonthsAsNumber, day: number): void;

/**
 * This method posts a token to Appboy's servers to associate the token with the current device.
 *
 * No-op on iOS.
 *
 * @param {string} token - The device's push token.
 */
export function registerAndroidPushToken(token: string): void;

/**
 * Sets whether the user should be sent push campaigns.
 * @param {NotificationSubscriptionType} notificationSubscriptionType - Notification setting (explicitly
 *    opted-in, subscribed, or unsubscribed).
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function setPushNotificationSubscriptionType(
  notificationSubscriptionType: NotificationSubscriptionType[keyof NotificationSubscriptionType],
  callback?: Callback
): void;

/**
 * Sets whether the user should be sent email campaigns.
 * @param {NotificationSubscriptionType} notificationSubscriptionType - Notification setting (explicitly
 *    opted-in, subscribed, or unsubscribed).
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function setEmailNotificationSubscriptionType(
  notificationSubscriptionType: NotificationSubscriptionType[keyof NotificationSubscriptionType],
  callback?: Callback
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
export function logCustomEvent(eventName: string, eventProperties?: object): void;

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
 * @param value - Can be numeric, boolean, a Date object, a string, or an array of strings. Strings are limited to
 *    255 characters in length, cannot begin with a $, and can only contain alphanumeric characters and punctuation.
 *    Passing a null value will remove this custom attribute from the user.
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function setCustomUserAttribute(
  key: string,
  value: any,
  callback?: Callback
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
  callback?: Callback
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
  callback?: Callback
): void;

/**
 * Unsets a custom user attribute.
 * @param {string} key - The identifier of the custom attribute. Limited to 255 characters in length,
 *    cannot begin with a $, and can only contain alphanumeric characters and punctuation.
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function unsetCustomUserAttribute(key: string, callback?: Callback): void;

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
  value: any,
  callback?: Callback
): void;

/**
 * Sets user Twitter data.
 *
 * @param {number} id - The Twitter user Id. May not be null.
 * @param {string} screenName - The user's Twitter handle
 * @param {string} name - The user's name
 * @param {string} description - A description of the user
 * @param {number} followersCount - Number of Twitter users following this user. May not be null.
 * @param {number} friendsCount - Number of Twitter users this user is following. May not be null.
 * @param {number} statusesCount - Number of Tweets by this user. May not be null.
 * @param {string} profileImageUrl - Link to profile image
 */
export function setTwitterData(
  id: number,
  screenName: string,
  name: string,
  description: string,
  followersCount: number,
  friendsCount: number,
  statusesCount: number,
  profileImageUrl: string
): void;

/**
 * Sets user Facebook data.
 *
 * @param {object} facebookUserDictionary - The dictionary returned from facebook with facebook graph
 * api endpoint "/me". Please refer to https://developers.facebook.com/docs/graph-api/reference/v2.7/user
 * for more information.
 * Note: Android only supports the firstName, lastName, email, bio, cityName, gender, and birthday fields.
 * All other user fields will be dropped.
 * @param {number} numberOfFriends - The length of the friends array from facebook.
 * You can get the array from the dictionary returned from facebook with facebook graph api endpoint "/me/friends",
 * under the key "data". Please refer to
 * https://developers.facebook.com/docs/graph-api/reference/v2.7/user/friends for more information. May not be null.
 * @param {Array} likes - The array of user's facebook likes from facebook.
 * You can get the array from the dictionary returned from facebook with facebook graph api endpoint "/me/likes",
 * under the key "data"; Please refer to
 * https://developers.facebook.com/docs/graph-api/reference/v2.7/user/likes for more information.
 */
export function setFacebookData(
  facebookUserDictionary: object,
  numberOfFriends: number,
  likes: Array<any>
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

// Content Cards
interface ContentCardType {
  CLASSIC: 'Classic',
  BANNER: 'Banner',
  CAPTIONED: 'Captioned',
}
export const ContentCardTypes: ContentCardType;

export interface ContentCard {
  id: string;
  created: number;
  expiresAt: number;
  type: ContentCardType;
  viewed: boolean;
  clicked: boolean;
  pinned: boolean;
  dismissed: boolean;
  dismissible: boolean;
  url?: string;
  openURLInWebView: boolean;
  extras: { [key: string]: string };
}

export interface ClassicContentCard extends ContentCard {
  image?: string;
  title: string;
  cardDescription: string;
  domain?: string;
}

export interface BannerContentCard extends ContentCard {
  image: string;
  imageAspectRatio: number;
}

export interface CaptionedContentCard extends ContentCard {
  image: string;
  imageAspectRatio: number;
  title: string;
  cardDescription: string;
  domain?: string;
}

/**
 * Launches the Content Cards UI element.
 */
export function launchContentCards(): void;

/**
 * Requests a refresh of the content cards from Appboy's servers.
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
 * When displaying the Content Cards in your own user interface,
 * you can manually record Content Cards impressions via the method logContentCardsDisplayed;
 */
export function logContentCardsDisplayed(): void;

/**
 * Returns a content cards array
 * @returns {Promise<ContentCard[]>}
 */
export function getContentCards(): Promise<ContentCard[]>;

/**
 * Returns the current number of News Feed cards for the given category.
 * @param {BrazeCardCategory} category - Card category. Use ReactAppboy.CardCategory.ALL to get the total card count.
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once.
 * There is also a slight race condition around calling changeUser,
 * which requests a feed refresh, so the counts may not always be accurate.
 */
export function getCardCountForCategories(
  category: BrazeCardCategory[keyof BrazeCardCategory],
  callback: Callback
): void;

/**
 * Returns the number of unread News Feed cards for the given category.
 * @param {BrazeCardCategory} category - Card category. Use ReactAppboy.CardCategory.ALL to get the total unread card count
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 * Note that for Android, a successful result relies on a FeedUpdatedEvent being posted at least once.
 * There is also a slight race condition around calling changeUser,
 * which requests a feed refresh, so the counts may not always be accurate.
 */
export function getUnreadCardCountForCategories(
  category: BrazeCardCategory[keyof BrazeCardCategory],
  callback: Callback
): void;

/**
 * Requests a News Feed refresh.
 */
export function requestFeedRefresh(): void;

/**
 * Requests an immediate flush of any data waiting to be sent to Appboy's servers.
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
  callback?: Callback
): void;

/**
 * Dismisses the currently displayed in app message.
 */
export function hideCurrentInAppMessage(): void;

type MonthsAsNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

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
export const NotificationSubscriptionTypes : NotificationSubscriptionType;

interface AppboyEvent {
  CONTENT_CARDS_UPDATED: 'contentCardsUpdated',
}
export const Events : AppboyEvent;

/**
 * Subscribes to the specific SDK event
 * @param {AppboyEvent} event
 * @param {function} subscriber
 */
export function addListener(event: AppboyEvent[keyof AppboyEvent], subscriber: Function): EmitterSubscription;

type Callback = (error: object, result: object) => void;

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
