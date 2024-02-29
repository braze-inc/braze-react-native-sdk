import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';
import type { FeatureFlag, NewsFeedCard, ContentCard } from './index';

export interface Spec extends TurboModule {
  getInitialURL(callback: (deepLink: string) => void): void;
  getDeviceId(callback: (error?: Object, result?: string) => void): void;
  changeUser(userId: string, signature?: string | null): void;
  getUserId(callback: (error?: Object, result?: string) => void): void;
  setSdkAuthenticationSignature(signature: string): void;
  addAlias(aliasName: string, aliasLabel: string): void;
  setFirstName(firstName: string): void;
  setLastName(lastName: string): void;
  setEmail(email: string): void;
  setGender(
    gender: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setLanguage(language: string): void;
  setCountry(country: string): void;
  setHomeCity(homeCity: string): void;
  setPhoneNumber(phoneNumber: string): void;
  setDateOfBirth(
    year: number,
    month: number,
    day: number
  ): void;
  registerPushToken(token: string): void;
  addToSubscriptionGroup(
    groupId: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  removeFromSubscriptionGroup(
    groupId: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setPushNotificationSubscriptionType(
    notificationSubscriptionType: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setEmailNotificationSubscriptionType(
    notificationSubscriptionType: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  logCustomEvent(
    eventName: string,
    eventProperties?: Object | null
  ): void;
  logPurchase(
    productId: string,
    price: string,
    currencyCode: string,
    quantity: number,
    purchaseProperties?: Object | null
  ): void;
  setIntCustomUserAttribute(
    key: string,
    value: number,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setDoubleCustomUserAttribute(
    key: string,
    value: number,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setBoolCustomUserAttribute(
    key: string,
    value: boolean,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setStringCustomUserAttribute(
    key: string,
    value: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;

  // Sets a dictionary object as a custom user attribute.
  // `merge` indicates whether to override the existing value (false) or combine its fields (true).
  setCustomUserAttributeObject(
    key: string,
    value: Object,
    merge: boolean,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;

  // Sets an array of strings as a custom user attribute.
  setCustomUserAttributeArray(
    key: string,
    value: string[],
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;

  // Sets an array of objects as a custom user attribute.
  setCustomUserAttributeObjectArray(
    key: string,
    value: object[],
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setDateCustomUserAttribute(
    key: string,
    value: number,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  addToCustomUserAttributeArray(
    key: string,
    value: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  removeFromCustomUserAttributeArray(
    key: string,
    value: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  unsetCustomUserAttribute(
    key: string,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  incrementCustomUserAttribute(
    key: string,
    value: number,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  setAttributionData(
    network: string,
    campaign: string,
    adGroup: string,
    creative: string
  ): void;
  launchNewsFeed(): void;
  logNewsFeedCardClicked(cardId: string): void;
  logNewsFeedCardImpression(cardId: string): void;
  getNewsFeedCards(): Promise<NewsFeedCard[]>;
  launchContentCards(): void;
  requestContentCardsRefresh(): void;
  logContentCardClicked(cardId: string): void;
  logContentCardDismissed(cardId: string): void;
  logContentCardImpression(cardId: string): void;
  processContentCardClickAction(cardId: string): void;
  getContentCards(): Promise<ContentCard[]>;
  getCachedContentCards(): Promise<ContentCard[]>;
  getCardCountForCategories(
    category: string,
    callback: ((error?: Object, result?: number) => void) | null
  ): void;
  getUnreadCardCountForCategories(
    category: string,
    callback: ((error?: Object, result?: number) => void) | null
  ): void;
  requestFeedRefresh(): void;
  requestImmediateDataFlush(): void;
  wipeData(): void;
  disableSDK(): void;
  enableSDK(): void;
  requestLocationInitialization(): void;
  requestGeofences(latitude: number, longitude: number): void;
  setLastKnownLocation(
    latitude: number,
    longitude: number,
    altitude: number,
    horizontalAccuracy: number,
    verticalAccuracy: number
  ): void;
  setLocationCustomAttribute(
    key: string,
    latitude: number,
    longitude: number,
    callback?: ((error?: Object, result?: boolean) => void) | null
  ): void;
  subscribeToInAppMessage(
    useBrazeUI: boolean,
    callback?: (() => void) | null
  ): void;
  hideCurrentInAppMessage(): void;
  logInAppMessageClicked(inAppMessageString: string): void;
  logInAppMessageImpression(
    inAppMessageString: string
  ): void;
  logInAppMessageButtonClicked(
    inAppMessageString: string,
    buttonId: number
  ): void;
  performInAppMessageAction(
    inAppMessage: string,
    buttonId: number 
  ): void;
  requestPushPermission(
    permissionOptions?: Object | null,
  ): void;
  getAllFeatureFlags(): Promise<FeatureFlag[]>;
  getFeatureFlag(flagId: string): Promise<FeatureFlag | null>;
  getFeatureFlagBooleanProperty(flagId: string, key: string): Promise<boolean | null>;
  getFeatureFlagStringProperty(flagId: string, key: string): Promise<string | null>;
  getFeatureFlagNumberProperty(flagId: string, key: string): Promise<number | null>;
  refreshFeatureFlags(): void;
  logFeatureFlagImpression(flagId: string): void;
  setAdTrackingEnabled(adTrackingEnabled: boolean, googleAdvertisingId: string): void;
  updateTrackingPropertyAllowList(allowList: Object): void;

  // NativeEventEmitter methods for the New Architecture.
  // The implementations are handled implicitly by React Native.
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BrazeReactBridge');