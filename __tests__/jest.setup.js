jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const TurboModuleRegistry = jest.requireActual(
    'react-native/Libraries/TurboModule/TurboModuleRegistry'
  );

  return {
    ...TurboModuleRegistry,
    // Overrides the `getEnforcing` method in `TurboModuleRegistry`.
    // This allows our unit tests to read the method stub implementations on the interface.
    getEnforcing: function (name) {
      if (name === 'BrazeReactBridge') {
        let NativeBrazeReactModule = jest.requireActual(
          '../src/specs/NativeBrazeReactModule'
        );

        // Mocks the Turbo Module spec with Jest method stubs.
        NativeBrazeReactModule = {
          registerAndroidPushToken: jest.fn(),
          registerPushToken: jest.fn(),
          setFirstName: jest.fn(),
          setLastName: jest.fn(),
          setLanguage: jest.fn(),
          setEmail: jest.fn(),
          setPhoneNumber: jest.fn(),
          changeUser: jest.fn(),
          getUserId: jest.fn(),
          setSdkAuthenticationSignature: jest.fn(),
          addAlias: jest.fn(),
          logCustomEvent: jest.fn(),
          logPurchase: jest.fn(),
          setCountry: jest.fn(),
          setHomeCity: jest.fn(),
          setDateOfBirth: jest.fn(),
          setAttributionData: jest.fn(),
          launchNewsFeed: jest.fn(),
          getNewsFeedCards: jest.fn(),
          logNewsFeedCardClicked: jest.fn(),
          logNewsFeedCardImpression: jest.fn(),
          launchContentCards: jest.fn(),
          getContentCards: jest.fn(),
          getCachedContentCards: jest.fn(),
          logContentCardClicked: jest.fn(),
          logContentCardDismissed: jest.fn(),
          logContentCardImpression: jest.fn(),
          processContentCardClickAction: jest.fn(),
          requestFeedRefresh: jest.fn(),
          getBanner: jest.fn(),
          requestBannersRefresh: jest.fn(),
          requestImmediateDataFlush: jest.fn(),
          enableSDK: jest.fn(),
          disableSDK: jest.fn(),
          wipeData: jest.fn(),
          setDateCustomUserAttribute: jest.fn(),
          setCustomUserAttributeArray: jest.fn(),
          setCustomUserAttributeObject: jest.fn(),
          setCustomUserAttributeObjectArray: jest.fn(),
          setBoolCustomUserAttribute: jest.fn(),
          setStringCustomUserAttribute: jest.fn(),
          setIntCustomUserAttribute: jest.fn(),
          setDoubleCustomUserAttribute: jest.fn(),
          incrementCustomUserAttribute: jest.fn(),
          setGender: jest.fn(),
          addToSubscriptionGroup: jest.fn(),
          removeFromSubscriptionGroup: jest.fn(),
          setPushNotificationSubscriptionType: jest.fn(),
          setEmailNotificationSubscriptionType: jest.fn(),
          addToCustomUserAttributeArray: jest.fn(),
          removeFromCustomUserAttributeArray: jest.fn(),
          unsetCustomUserAttribute: jest.fn(),
          getCardCountForCategories: jest.fn(),
          getUnreadCardCountForCategories: jest.fn(),
          getInitialURL: jest.fn(),
          getInitialPushPayload: jest.fn(),
          getDeviceId: jest.fn(),
          requestLocationInitialization: jest.fn(),
          requestGeofences: jest.fn(),
          setLocationCustomAttribute: jest.fn(),
          requestContentCardsRefresh: jest.fn(),
          subscribeToInAppMessage: jest.fn(),
          hideCurrentInAppMessage: jest.fn(),
          logInAppMessageClicked: jest.fn(),
          logInAppMessageImpression: jest.fn(),
          logInAppMessageButtonClicked: jest.fn(),
          performInAppMessageAction: jest.fn(),
          setLastKnownLocation: jest.fn(),
          requestPushPermission: jest.fn(),
          getFeatureFlag: jest.fn(),
          getAllFeatureFlags: jest.fn(),
          refreshFeatureFlags: jest.fn(),
          logFeatureFlagImpression: jest.fn(),
          getFeatureFlagBooleanProperty: jest.fn(),
          getFeatureFlagNumberProperty: jest.fn(),
          getFeatureFlagStringProperty: jest.fn(),
          getFeatureFlagTimestampProperty: jest.fn(),
          getFeatureFlagJSONProperty: jest.fn(),
          getFeatureFlagImageProperty: jest.fn(),
          setAdTrackingEnabled: jest.fn(),
          setIdentifierForAdvertiser: jest.fn(),
          setIdentifierForVendor: jest.fn(),
          updateTrackingPropertyAllowList: jest.fn()
        };

        return {
          ...NativeBrazeReactModule
        };
      }

      return TurboModuleRegistry.getEnforcing(...arguments);
    }
  };
});