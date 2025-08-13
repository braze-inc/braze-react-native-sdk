import { ComponentType } from 'react';
import { EmitterSubscription, StyleProp, ViewStyle } from 'react-native';

/**
 * @deprecated This method is deprecated in favor of `getInitialPushPayload`.
 *
 * To get the initial URL, call `getInitialPushPayload` and get the `url` key from the payload object.
 */
export function getInitialURL(callback: (deepLink: string) => void): void;

/**
 * When launching an iOS application that has previously been force closed, React Native's Linking API doesn't
 * support handling push notifications and deep links in the payload. This is due to a race condition on startup between
 * the call to `addListener` and React's loading of its JavaScript. This function provides a workaround:
 * If an application is launched from a push notification click, we return the full push payload.
 * @param {function(PushNotificationEvent | null)} callback - A callback that returns the formatted Braze push notification as a PushNotificationEvent.
 * If there is no push payload, returns null.
 */
export function getInitialPushPayload(callback: (pushPayload: PushNotificationEvent | null) => void): void;

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
 * Returns a unique ID stored for the user.
 * If the user is anonymous, there is no ID stored for the user and this method will return `null`.
 * 
 * @param {function(error, result)} callback - A callback that receives the function call result.
 */
export function getUserId(callback: Callback<string>): void;

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
 * Sets the first name of the user. A null value will unset the first name for this user.
 * @param {string | null} firstName - Limited to 255 characters in length.
 */
export function setFirstName(firstName: string | null): void;

/**
 * Sets the last name of the user. A null value will unset the last name for this user.
 * @param {string | null} lastName - Limited to 255 characters in length.
 */
export function setLastName(lastName: string | null): void;

/**
 * Sets the email address of the user. A null value will unset the email for this user.
 * @param {string | null} email - Must pass RFC-5322 email address validation.
 */
export function setEmail(email: string | null): void;

/**
 * Sets the gender of the user. A null value will unset the gender for this user.
 * @param {Genders | null} gender - Limited to m, n, o, p, u, f, or null.
 * @param {function(error, result)} callback - A callback that receives the export function call result.
 */
export function setGender(
  gender: GenderTypes[keyof GenderTypes] | null,
  callback?: Callback<boolean>
): void;

/**
 * Sets the language for the user. A null value will unset the language for this user.
 * @param {string | null} language - Should be valid ISO 639-1 language code.
 */
export function setLanguage(language: string | null): void;

/**
 * Sets the country for the user. A null value will unset the country for this user.
 * @param {string | null} country - Limited to 255 characters in length.
 */
export function setCountry(country: string | null): void;

/**
 * Sets the home city for the user. A null value will unset the home city for this user.
 * @param {string | null} homeCity - Limited to 255 characters in length.
 */
export function setHomeCity(homeCity: string | null): void;

/**
 * Sets the phone number of the user. A null value will unset the phone number for this user.
 * @param {string | null} phoneNumber - A phone number is considered valid if it is no more than 255 characters in length and
 *    contains only numbers, whitespace, and the following special characters +.-()
 */
export function setPhoneNumber(phoneNumber: string | null): void;

/**
 * Sets the date of birth of the user.
 * 
 * This value will be reported to the Braze platform using the
 * Gregorian calendar, regardless of the user's device settings.
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
 * @deprecated This method is deprecated in favor of `setAdTrackingEnabled`.
 *
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
 * This method informs Braze whether ad-tracking has been enabled for this device. Note that the SDK does not
 * automatically collect this data.
 *
 * @param {string} adTrackingEnabled - Whether ad-tracking is enabled.
 * @param {string} googleAdvertisingId - The Google Advertising ID. (Android only)
 */
export function setAdTrackingEnabled(adTrackingEnabled: boolean, googleAdvertisingId?: string): void;

/**
 * This method passes the Identifier For Advertiser (IDFA) to Braze for iOS. It is a no-op on Android.
 *
 * See Apple's docs on [App Tracking Transparency](https://apple.co/3LM7mm2) for more information.
 *
 * @param {string} identifierForAdvertiser - The IDFA.
 */
export function setIdentifierForAdvertiser(identifierForAdvertiser: string): void;

/**
 * This method passes the Identifier For Vendor (IDFV) to Braze for iOS. It is a no-op on Android.
 *
 * @param {string} identifierForVendor - The IDFV.
 */
export function setIdentifierForVendor(identifierForVendor: string): void;

/**
 * Updates the list of data types you wish to declare or remove as tracked user data.
 *
 * For more details, refer to Braze's [Privacy Manifest documentation](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/privacy_manifest/).
 *
 * No-op on Android.
 *
 * @param {TrackingPropertyAllowList} allowList - The list of tracking properties to update.
 */
export function updateTrackingPropertyAllowList(allowList: TrackingPropertyAllowList): void;

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

/**
 * [Braze News Feed](https://www.braze.com/docs/user_guide/engagement_tools/news_feed)
 */
export interface NewsFeedCardBase {
  /** The card identifier. */
  id: string;

  /** The card creation timestamp. */
  created: number;

  /** The card last update timestamp. */
  updated: number;

  /** The card viewed state. */
  viewed: boolean;

  /** The card image URL. */
  url?: string;

  /** The card extras dictionary (default: `[:]`) */
  extras: { [key: string]: string };
}

/**
 * The Banner News Feed Card, extending NewsFeedCardBase.
 */
export interface BannerNewsFeedCard extends NewsFeedCardBase {
  /** The News Feed Card type. */
  type: 'Banner';

  /** The card image URL. */
  image: string;

  /** The card image aspect ratio */
  imageAspectRatio: number;
}

/**
 * The Captioned News Feed Card, extending NewsFeedCardBase.
 */
export interface CaptionedNewsFeedCard extends NewsFeedCardBase {
  /** The News Feed Card type. */
  type: 'Captioned';

  /** The card image URL. */
  image: string;

  /** The card title. */
  title: string;

  /** The card description. */
  cardDescription: string;

  /** (Optional) The card domain. */
  domain?: string;
}

/**
 * The Text Announcement News Feed Card, extending NewsFeedCardBase.
 */
export interface TextAnnouncementNewsFeedCard extends NewsFeedCardBase {
  /** The News Feed Card type. */
  type: 'TextAnnouncement';

  /** The card title. */
  title: string;

  /** The card description. */
  cardDescription: string;

  /** (Optional) The card domain. */
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

/**
 * [Braze Content Cards](https://www.braze.com/docs/developer_guide/platform_integration_guides/react_native/content_cards/)
 */
export interface ContentCardBase {
  /** The card's ID. */
  id: string;

  /** The UNIX timestamp of the card's creation time from Braze dashboard. */
  created: number;

  /** The UNIX timestamp of the card's expiration time. When the value is less than 0, it means the card never expires. */
  expiresAt: number;

  /** Indicates whether the card has been read or is unread by the user. Note: This does not log analytics. */
  viewed: boolean;

  /** 
   * Indicates whether the card has been clicked by the user. 
   * Note: Clicks are stored on disk, so subsequent instances of this card will retain its clicked state upon recreation.
   */
  clicked: boolean;

  /** Indicates whether the card is pinned. */
  pinned: boolean;

  /** Indicates whether the card has been dismissed. Marking a card as dismissed that has already been dismissed will be a no-op. */
  dismissed: boolean;

  /** Indicates whether the card is dismissible by the user. */
  dismissible: boolean;

  /** (Optional) The url string associated with the card click action. */
  url?: string;

  /**
   * Indicates whether URLs for this card should be opened in Braze's WebView or not.
   * When false, the URL will be opened by the OS and web URLs will be opened in an external web browser app.
   */
  openURLInWebView: boolean;

  /** Indicates whether this card is a control card. Control cards should not be displayed to the user. */
  isControl: boolean;

  /** A map of key-value pair extras for this card. */
  extras: { [key: string]: string };
}

/**
 * The Classic Content Card, extending ContentCardBase.
 */
export interface ClassicContentCard extends ContentCardBase {
  /** The Content Card type. */
  type: 'Classic';

  /** (Optional) The URL of the card's image. */
  image?: string;

  /** The title text for the card. */
  title: string;

  /** The description text for the card. */
  cardDescription: string;
  
  /**
   * (Optional) The link text for the property URL, e.g., "blog.appboy.com". It can be displayed on the card's
   * UI to indicate the action/direction of clicking on the card.
   */
  domain?: string;
}

/**
 * The Image Only Content Card, extending ContentCardBase.
 */
export interface ImageOnlyContentCard extends ContentCardBase {
  /** The Content Card type. */
  type: 'ImageOnly';

  /** The URL of the card's image. */
  image: string;

  /**
   * The aspect ratio of the card's image. It is meant to serve as a hint before image loading completes. 
   * Note that the property may not be supplied in certain circumstances.
   */
  imageAspectRatio: number;
}

/**
 * The Captioned Content Card, extending ContentCardBase.
 */
export interface CaptionedContentCard extends ContentCardBase {
  /** The Content Card type. */
  type: 'Captioned';

  /** The URL of the card's image. */
  image: string;

  /** 
   * The aspect ratio of the card's image. It is meant to serve as a hint before image loading completes.
   * Note that the property may not be supplied in certain circumstances.
   */
  imageAspectRatio: number;

  /** The title text for the card. */
  title: string;

  /** The description text for the card. */
  cardDescription: string;

  /**
   * (Optional) The link text for the property URL, e.g., "blog.appboy.com". It can be displayed on the card's
   * UI to indicate the action/direction of clicking on the card.
   */
  domain?: string;
}

export type ContentCard =
  | ClassicContentCard
  | ImageOnlyContentCard
  | CaptionedContentCard;

/**
 * Launches the Content Cards UI element.
 *
 * @param {boolean | undefined} dismissAutomaticallyOnCardClick
 *  When enabled, the feed UI will automatically dismiss on scheme-based deep link clicks.
 *  This setting is a no-op on Android, which already removes the Content Cards feed when opening a deep link.
 */
export function launchContentCards(dismissAutomaticallyOnCardClick?: boolean): void;

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
 * Perform the action of a particular card.
 * @param {string} id
 */
export function processContentCardClickAction(id: string): void;

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

// Banners

/**
 * Braze Banners
 */
export interface Banner {
  /** The campaign and message variation IDs. */
  trackingId: string;

  /** The placement ID this banner is matched to. */
  placementId: string;

  /** Whether the banner is from a test send. */
  isTestSend: boolean;

  /** Whether the banner is a control banner. */
  isControl: boolean;

  /** The HTML to display for the banner. */
  html: string;

  /** A Unix timestamp of the expiration date and time. A value of -1 means the banner never expires. */
  expiresAt: number;
}

/**
 * Gets a banner with the provided placement ID if available in cache, otherwise returns null.
 *
 * @param placementId - The placement ID of the requested banner.
 *
 * @returns {Promise<Banner | null>}
 */
export function getBanner(placementId: string): Promise<Banner | null>;

/**
 * Requests a refresh of the banners associated with the provided placement IDs.
 *
 * If the banners are unsuccessfully refreshed, a failure will be logged on iOS only.
 *
 * @param placementIds -  The list of placement IDs requested.
 */
export function requestBannersRefresh(placementIds: string[]): void;

/**
 * The configuration properties associated with the Banner view.
 */
export interface BrazeBannerViewProps {
  /** The placement ID for this Banner view. */
  placementID: string;

  /**
   * Optional custom styles to be applied to the Banner view.
   *
   * If you override the `height` style property, you will need to implement the {@link onHeightChanged}
   * callback to handle dynamic size changes.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * An optional callback function that is invoked whenever the height of the Banner changes.
   *
   * @param height - The new height of the Banner in pixels.
   */
  onHeightChanged?: (height: number) => void;
}

/**
 * The default Braze Banner view component.
 */
export const BrazeBannerView: ComponentType<BrazeBannerViewProps>;

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
 * Sets the last known location for the user.
 * For Android, latitude and longitude are required, with altitude, horizontal accuracy, and vertical accuracy being optional parameters.
 * For iOS, latitude, longitude, and horizontal accuracy are required, with altitude and vertical accuracy being optional parameters.
 * Calling this method with invalid parameters for a specific platform is a no-op. Latitude, longitude, and horizontal accuracy are the minimum required parameters to work for all platforms.
 * @param {number} latitude - Location latitude. Required.
 * @param {number} longitude - Location longitude. Required.
 * @param {number | null} altitude - Location altitude. May be null for both platforms.
 * @param {number | null} horizontalAccuracy - Location horizontal accuracy. Equivalent to accuracy for Android. May be null for Android only; required for iOS.
 * @param {number | null} verticalAccuracy - Location vertical accuracy. May be null for both platforms unless `altitude` is supplied.
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

/**
 * Performs the action for an in-app message button
 * @param {BrazeInAppMessage} inAppMessage
 * @param {number} buttonId
 */
export function performInAppMessageButtonAction(
  inAppMessage: BrazeInAppMessage,
  buttonId: number
): void;

/**
 * Performs the action for an in-app message
 * @param {BrazeInAppMessage} inAppMessage
 */
export function performInAppMessageAction(
  inAppMessage: BrazeInAppMessage
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
 * @param {Events} event - Describes the event being added.
 */
export function addListener(
  event: string
): void;

/** 
 * A Feature Flag property of type String. 
 */
export interface FeatureFlagStringProperty {
  /** The type of Feature Flag property. */
  type: "string";

  /** The value of the property. */
  value: string;
}

/** 
 * A Feature Flag property of type Number. 
 */
export interface FeatureFlagNumberProperty {
  /** The type of Feature Flag property. */
  type: "number";

  /** The value of the property. */
  value: number;
}

/** 
 * A Feature Flag property of type Boolean. 
 */
export interface FeatureFlagBooleanProperty {
  /** The type of Feature Flag property. */
  type: "boolean";

  /** The value of the property. */
  value: boolean;
}

/**
 * A Feature Flag timestamp property of type Number.
 */
export interface FeatureFlagTimestampProperty {
  /** The type of Feature Flag property. */
  type: "timestamp";

  /** The value of the property. */
  value: number;
}

/**
 * A Feature Flag JSON property of type Object.
 */
export interface FeatureFlagJSONProperty {
  /** The type of Feature Flag property. */
  type: "jsonobject";

  /** The value of the property. */
  value: object;
}

/**
 * A Feature Flag image property of type String.
 */
export interface FeatureFlagImageProperty {
  /** The type of Feature Flag property. */
  type: "image";

  /** The value of the property. */
  value: string;
}

/**
 * [Braze Feature Flags](https://www.braze.com/docs/developer_guide/platform_wide/feature_flags)
 */
export class FeatureFlag {
  /** Indicates whether or not this feature flag is enabled. */
  enabled: boolean;

  /** Properties of this feature flag, listed as key-value pairs. */
  properties: Partial<Record<string, FeatureFlagStringProperty | FeatureFlagNumberProperty | FeatureFlagBooleanProperty | FeatureFlagTimestampProperty | FeatureFlagJSONProperty | FeatureFlagImageProperty>>;

  /** The ID for this feature flag. */
  id: string;
}

/**
 * Returns all available feature flags
 * @returns {Promise<FeatureFlag[]>}
 */
export function getAllFeatureFlags(): Promise<FeatureFlag[]>;

/**
 * Get a feature flag by its ID.
 * 
 * @param id - The ID of the feature flag.
 * @returns A promise containing the feature flag.
 *    If there is no feature flag with that ID, this method will return a null.
 */
export function getFeatureFlag(id: string): Promise<FeatureFlag | null>;

/**
 * Get value of a feature flag property of type boolean.
 * 
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type boolean.
 *    If the key is not found, if there is a type mismatch, or if there is no feature flag for that ID,
 *    this method will return a null.
 */
export function getFeatureFlagBooleanProperty(id: string, key: string): Promise<boolean | null>;

/**
 * Get value of a feature flag property of type string.
 *
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type string.
 *    If the key is not found, if there is a type mismatch, or if there is no feature flag for that ID,
 *    this method will return a null.
 */
export function getFeatureFlagStringProperty(id: string, key: string): Promise<string | null>;

/**
 * Get value of a feature flag property of type number.
 *
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type number.
 *    If the key is not found, if there is a type mismatch, or if there is no feature flag for that ID,
 *    this method will return a null.
 */
export function getFeatureFlagNumberProperty(id: string, key: string): Promise<number | null>;

/**
 * Get value of a feature flag timestamp property of type number.
 *
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type number.
 *    If the key is not found, if there is a type mismatch, or if there is no feature flag for that ID,
 *    this method will return a null.
 */
export function getFeatureFlagTimestampProperty(id: string, key: string): Promise<number | null>;

/**
 * Get value of a feature flag JSON object property of type string.
 *
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type number.
 *    If the key is not found, if there is a type mismatch, or if there is no feature flag for that ID,
 *    this method will return a null.
 */
export function getFeatureFlagJSONProperty(id: string, key: string): Promise<string | null>;

/**
 * Get value of a feature flag image property of type string.
 *
 * @param id - The ID of the feature flag.
 * @param key - The key of the property.
 *
 * @returns A promise containing the value of the property if the key is found and is of type number.
 *    If the key is not found, if there is a type mismatch, or if there is no feature flag for that ID,
 *    this method will return a null.
 */
export function getFeatureFlagImageProperty(id: string, key: string): Promise<string | null>;

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

/**
 * [Braze In-App Message](https://www.braze.com/docs/developer_guide/platform_integration_guides/react_native/inapp_messages/)
 */
export class BrazeInAppMessage {
  constructor(_data: string);
  /** The message JSON representation. */
  inAppMessageJsonString: string;

  /** The message text. */
  message: string;

  /** The message header. */
  header: string;

  /** The URI associated with the button click action. */
  uri: string;

  /** The message image URL. */
  imageUrl: string;

  /** The zipped assets prepared to display HTML content. */
  zippedAssetsUrl: string;

  /** Indicates whether the button click action should redirect using a web view. */
  useWebView: boolean;

  /** The message display duration. */
  duration: number;

  /** The button click action. */
  clickAction: BrazeClickAction[keyof BrazeClickAction];

  /** The message close type. */
  dismissType: BrazeDismissType[keyof BrazeDismissType];

  /** The in-app message type supported by the SDK. */
  messageType: BrazeMessageType[keyof BrazeMessageType];

  /** The message extras dictionary (default: `[:]`) */
  extras: { [key: string]: string };

  /** The list of buttons on the in-app message. */
  buttons: [BrazeButton];

  /** Specifies whether the message was delivered as a test send (default: `false`). */
  isTestSend: boolean;

  /** The message as a String representation. */
  toString(): string;
}

/**
 * A button on an In-App Message.
 */
export class BrazeButton {
  constructor(_data: string);
  /** The text on the button. */
  text: string;

  /** The URI associated with the button click action. */
  uri: string;

  /** Indicates whether the button click action should redirect using a web view. */
  useWebView: boolean;

  /** The type of click action processed when the user clicks on the button. */
  clickAction: BrazeClickAction[keyof BrazeClickAction];

  /** The button ID on the message. */
  id: number;

  /** The button as a String representation. */
  toString(): string;
}

type MonthsAsNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * The click action type of the In-App Message.
 */
interface BrazeClickAction {
  /** Opens the NewsFeed on click. */
  NEWS_FEED: 'news_feed';

  /** Opens the URI on click, optionally using a web view. */
  URI: 'uri';

  /** No action on click. */
  NONE: 'none';
}
export const ClickAction: BrazeClickAction;

/**
 * The message close type of the In-App Message.
 */
interface BrazeDismissType {
  /** Dismisses the message on user swipe. */
  SWIPE: 'swipe';

  /** Dismisses the message automatically */
  AUTO_DISMISS: 'auto_dismiss';
}
export const DismissType: BrazeDismissType;

/**
 * The In-App Message types supported by the SDK.
 */
interface BrazeMessageType {
  /** The Slideup message type. */
  SLIDEUP: 'slideup';

  /** The Modal message type. */
  MODAL: 'modal';

  /** The Full message type. */
  FULL: 'full';

  /** The HtmlFull message type. */
  HTML_FULL: 'html_full';
}
export const MessageType: BrazeMessageType;

/**
 * The Content Card types supported by the Braze SDK.
 */
interface BrazeContentCardType {
  /** The Classic Content Card type. */
  CLASSIC: 'Classic';

  /** The Image Only Content Card type. */
  IMAGE_ONLY: 'ImageOnly';

  /** The Captioned Image Content Card type. */
  CAPTIONED: 'Captioned';
}
export const ContentCardTypes: BrazeContentCardType;

/**
 * The NewsFeed Card categories supported by the SDK.
 */
interface BrazeCardCategory {
  /** The advertising category. */
  ADVERTISING: 'advertising';

  /** The announcements category. */
  ANNOUNCEMENTS: 'announcements';

  /** The news category. */
  NEWS: 'news';

  /** The social category. */
  SOCIAL: 'social';

  /** No specific category. */
  NO_CATEGORY: 'no_category';

  /** All categories. */
  ALL: 'all';
}
export const CardCategory: BrazeCardCategory;

/**
 * The gender values supported by the Braze SDK.
 */
interface GenderTypes {
  /** Male */
  MALE: 'm';

  /** Female */
  FEMALE: 'f';

  /** Not Applicable */
  NOT_APPLICABLE: 'n';

  /** Other */
  OTHER: 'o';

  /** Prefer Not To Say */
  PREFER_NOT_TO_SAY: 'p';

  /** Unknown */
  UNKNOWN: 'u';
}
export const Genders: GenderTypes;

/**
 * The category of Braze SDK properties to be marked for user tracking.
 */
interface BrazeTrackingProperty {
  /** Mark all custom attributes for tracking. */
  ALL_CUSTOM_ATTRIBUTES: 'all_custom_attributes';

  /** Mark all custom events for tracking. */
  ALL_CUSTOM_EVENTS: 'all_custom_events';

  /** Braze events for analytics. */
  ANALYTICS_EVENTS: 'analytics_events';

  /** The user's attribution data. */
  ATTRIBUTION_DATA: 'attribution_data';

  /** The user's country. */
  COUNTRY: 'country';

  /** The user's date of birth. */
  DATE_OF_BIRTH: 'dob';

  /** The user's device data. */
  DEVICE_DATA: 'device_data';

  /** The user's email address. */
  EMAIL: 'email';

  /** The user's email subscription state. */
  EMAIL_SUBSCRIPTION_STATE: 'email_subscription_state';

  /**
   * Mark every user data for tracking.
   * 
   * Adding this property will cause other cases to be a no-op as everything will be routed to the tracking domain.
   */
  EVERYTHING: 'everything';

  /** The user's first name. */
  FIRST_NAME: 'first_name';

  /** The user's gender. */
  GENDER: 'gender';

  /** The user's home city. */
  HOME_CITY: 'home_city';

  /** The user's language. */
  LANGUAGE: 'language';

  /** The user's last name. */
  LAST_NAME: 'last_name';

  /** The user's notification subscription state. */
  NOTIFICATION_SUBSCRIPTION_STATE: 'notification_subscription_state';

  /** The user's phone number. */
  PHONE_NUMBER: 'phone_number';

  /** The user's push token. */
  PUSH_TOKEN: 'push_token';
}
export const TrackingProperty: BrazeTrackingProperty;

/**
 * The list of properties to be collected for tracking users (default: an empty list).
 * 
 * The SDK will route collection of any of these data into a separate tracking endpoint, which must be declared in the privacy manifest.
 */
export interface TrackingPropertyAllowList {
  /** Tracking properties you wish to add to your allowlist */
  adding?: BrazeTrackingProperty[keyof BrazeTrackingProperty][],

  /** Tracking properties you wish to remove from your allowlist */
  removing?: BrazeTrackingProperty[keyof BrazeTrackingProperty][],

  /** Custom event strings you wish to add to your current allowlist. */
  addingCustomEvents?: string[],

  /** Custom event strings you wish to remove from your current allowlist. */
  removingCustomEvents?: string[],

  /** Custom attribute strings you wish to add to your current allowlist. */
  addingCustomAttributes?: string[],

  /** Custom attribute strings you wish to remove from your current allowlist. */
  removingCustomAttributes?: string[],
}

/**
 * The possible notification subscription states supported by the Braze SDK.
 */
interface NotificationSubscriptionType {
  /** Subscribed, and explicitly opted in. */
  OPTED_IN: 'optedin';

  /** Subscribed, but not explicitly opted in. */
  SUBSCRIBED: 'subscribed';

  /** Unsubscribed and/or explicitly opted out. */
  UNSUBSCRIBED: 'unsubscribed';
}
export const NotificationSubscriptionTypes: NotificationSubscriptionType;

/**
 * An SDK authentication error event.
 */
export interface SDKAuthenticationErrorType {
  /** Error code describing the cause of the signature authentication failure. */
  error_code: string;

  /** The External User ID on the failed request. */
  user_id: string;

  /** The original SDK authentication signature. */
  original_signature: string;

  /** Human-readable cause of the signature authentication failure. */
  reason: string;
}

export interface PushNotificationEvent {
  /** Notification payload type. */
  payload_type: string;

  /** URL opened by the notification. */
  url: string;

  /** Specifies whether the URL should be opened in a modal webview. */
  use_webview: boolean;

  /** Notification title. */
  title: string;

  /** Notification body, or content text. */
  body: string;

  /**
   * Notification summary text
   *
   * Mapped from `subtitle` on iOS.
   */
  summary_text: string;

  /** Notification badge count. */
  badge_count: number;

  /** Time at which the payload was received by the application. */
  timestamp: number;

  /**
   * Specifies whether the payload was received silently.
   *
   * For details on sending Android silent push notifications, refer to [Silent push notifications](https://www.braze.com/docs/developer_guide/platform_integration_guides/android/push_notifications/android/silent_push_notifications).
   *
   * For details on sending iOS silent push notifications, refer to [Silent push notifications](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/push_notifications/silent_push_notifications/).
   */
  is_silent: boolean;

  /** Specifies whether the payload is used by Braze for an internal SDK feature. */
  is_braze_internal: boolean;

  /** URL associated with the notification image. */
  image_url: string;

  /** Braze properties associated with the campaign (key-value pairs). */
  braze_properties: { [key: string]: any };

  /** iOS-specific fields. */
  ios: { [key: string]: any };

  /** Android-specific fields. */
  android: { [key: string]: any };

  /**
   * @deprecated This field is deprecated and will be removed in future versions. Use `payload_type` instead.
   */
  push_event_type: string;

  /**
   * @deprecated This field is deprecated and will be removed in future versions. Use `url` instead.
   */
  deeplink: string;

  /**
   * @deprecated This field is deprecated and will be removed in future versions. Use `body` instead.
   */
  content_text: string;

  /**
   * @deprecated This field is deprecated and will be removed in future versions. Use `android` instead.
   */
  raw_android_push_data: string;

  /**
   * @deprecated This field is deprecated and will be removed in future versions. Use `braze_properties` instead.
   */
  kvp_data: { [key: string]: any };
}

/**
 * Received an updated list of Content Cards from the Braze SDK.
 */
export interface ContentCardsUpdatedEvent {
  /** A list of Content Cards in this update. */
  cards: ContentCard[];
}
/**
 * Received an updated list of Banners from the Braze SDK.
 */
export interface BannerCardsUpdatedEvent {
  /** A list of Banners in this update. */
  banners: Banner[];
}

/**
 * An event received from the Braze SDK.
 */
interface BrazeEvent {
  /** Callback passes an object with the `cards` as of the latest refresh. */
  CONTENT_CARDS_UPDATED: 'contentCardsUpdated';
  /** Callback passes an object with the `banners` as of the latest refresh. */
  BANNER_CARDS_UPDATED: 'bannerCardsUpdated';
  /** Callback passes an object containing "error_code", "user_id", "original_signature", and "reason". */
  SDK_AUTHENTICATION_ERROR: 'sdkAuthenticationError';
  /** Callback passes the BrazeInAppMessage object. */
  IN_APP_MESSAGE_RECEIVED: 'inAppMessageReceived';
  /** Callback that triggers when Feature Flags have received an update in the latest refresh. */
  FEATURE_FLAGS_UPDATED: 'featureFlagsUpdated';
  /** Callback passes a `PushNotificationEvent` object whenever a push event has been detected. */
  PUSH_NOTIFICATION_EVENT: 'pushNotificationEvent';
}
export const Events: BrazeEvent;

/** Callback passes an object with the `cards` as of the latest refresh. */
export function addListener(event: "contentCardsUpdated", callback: (update: ContentCardsUpdatedEvent) => void): EmitterSubscription;
/** Callback passes an object with the `banners` as of the latest refresh. */
export function addListener(event: "bannerCardsUpdated", callback: (update: BannerCardsUpdatedEvent) => void): EmitterSubscription;
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
