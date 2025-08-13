import React, { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableHighlight,
  Linking,
  Alert,
  TextInput,
  Platform,
  Settings,
} from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
import Braze from '@braze/react-native-sdk';

// Change to `true` to automatically log clicks, button clicks,
// and impressions for in-app messages and content cards.
const automaticallyInteract = false;

// User Defaults keys
const iOSPushAutoEnabledKey = 'iOSPushAutoEnabled';

const Space = () => {
  return <View style={styles.spacing} />;
};

export const BrazeProject = (): ReactElement => {
  const [userIdText, setUserIdText] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [customEventText, setCustomEventText] = useState('');
  const [languageText, setLanguageText] = useState('');
  const [subscriptionState, setSubscriptionState] = useState<string>('s');
  const [gender, setGender] = useState<string>('m');
  const [message, setMessage] = useState('Success');
  const [toastVisible, setToastVisible] = useState(false);
  const [, setFeatureFlags] = useState<Braze.FeatureFlag[]>([]);
  const [featureFlagId, setFeatureFlagId] = useState('');
  const [featureFlagPropertyType, setFeatureFlagPropertyType] =
    useState<string>('bool');
  const [featureFlagPropertyKey, setFeatureFlagPropertyKey] = useState('');

  // A comma-separated string of banner placement IDs.
  const [requestedBannerPlacements, setRequestedBannerPlacements] = useState('placement_1, placement_2');

  const [bannerPlacementId, setBannerPlacementId] = useState('');
  const [bannerHeight, setBannerHeight] = useState(0);
  const [displayedPlacement, setDisplayedPlacement] = useState('sdk-test-2');
  const [displayedPlacementPlaceholder, setDisplayedPlacementPlaceholder] = useState('');
  const [pushToken, setPushToken] = useState('');

  // If key is persisted, use the value. If no key is present, default to true.
  const [iOSPushAutoEnabled, setiOSPushAutoEnabled] = useState<boolean>(() => {
    if (Platform.OS === 'ios') {
      const value = Settings.get(iOSPushAutoEnabledKey);
      return value != null ? Boolean(value) : true;
    } else {
      return false;
    }
  });

  const subscriptionStateButtons = useMemo(
    () => [
      {
        id: 'o',
        label: 'Opted In',
        value: 'o',
      },
      {
        id: 'u',
        label: 'Unsubscribed',
        value: 'u',
      },
      {
        id: 's',
        label: 'Subscribed',
        value: 's',
      },
    ],
    [],
  );

  const genderButtons = useMemo(
    () => [
      {
        id: 'f',
        label: 'Female',
        value: 'f',
      },
      {
        id: 'm',
        label: 'Male',
        value: 'm',
      },
      {
        id: 'o',
        label: 'Other',
        value: 'o',
      },
      {
        id: 'p',
        label: 'Prefer Not to Say',
        value: 'p',
      },
      {
        id: 'n',
        label: 'Not Applicable',
        value: 'n',
      },
      {
        id: 'u',
        label: 'Unknown',
        value: 'u',
      },
      {
        id: 'null',
        label: 'Unset from Profile',
        value: 'null',
      },
    ],
    [],
  );

  const featureFlagPropertyButtons = useMemo(
    () => [
      {
        id: 'bool',
        label: 'Boolean',
        value: 'bool',
      },
      {
        id: 'num',
        label: 'Number',
        value: 'num',
      },
      {
        id: 'string',
        label: 'String',
        value: 'string',
      },
      {
        id: 'timestamp',
        label: 'Timestamp',
        value: 'timestamp',
      },
      {
        id: 'json',
        label: 'JSON Object',
        value: 'json',
      },
      {
        id: 'image',
        label: 'Image',
        value: 'image',
      },
    ],
    [],
  );

  const handleOpenUrl = (event: { url: string }) => {
    console.log('handleOpenUrl called on url ' + event.url);
    Alert.alert('Deep Link', event.url, [
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);
  };

  const handlePushPayload = (pushPayload: Braze.PushNotificationEvent) => {
    if (pushPayload) {
      console.log(
        `Received push notification payload:
          - type: ${pushPayload.payload_type}
          - title: ${pushPayload.title}
          - is_silent: ${pushPayload.is_silent}
          - url: ${pushPayload.url}`,
      );
      console.log(JSON.stringify(pushPayload, undefined, 2));
    }
  };

  const showToast = (msg: string, duration: number = 2000) => {
    setMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setMessage('Success');
    }, duration);
  };

  useEffect(() => {
    // On launch, pre-populate the text field with the current user ID, if available.
    Braze.getUserId((_err, userId) => {
      if (userId) {
        setUserIdText(userId);
      }
    });

    // Listen to the `url` event to handle incoming deep links
    const listener = Linking.addEventListener('url', handleOpenUrl);

    // No `url` event is triggered on application start, so this handles
    // the case where a deep link launches the application
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          console.log('Linking.getInitialURL is ' + url);
          showToast('Linking.getInitialURL is ' + url);
          handleOpenUrl({ url });
        }
      })
      .catch(err => console.error('Error getting initial URL', err));

    // Handles push notification payloads and deep links when an iOS app is launched from terminated state via push click.
    // For more detail, see `Braze.getInitialPushPayload`.
    Braze.getInitialPushPayload(pushPayload => {
      if (pushPayload) {
        handlePushPayload(pushPayload);

        // If the push payload contains a URL, handle it
        let initialURL = pushPayload.url;
        if (initialURL) {
          showToast('Initial URL is: ' + initialURL);
          handleOpenUrl({ url: initialURL });
        }
      }
    });

    Braze.subscribeToInAppMessage(true, event => {
      if (automaticallyInteract) {
        console.log(
          'Automatically logging IAM click, button click `0`, and impression.',
        );
        Braze.logInAppMessageClicked(event.inAppMessage);
        Braze.logInAppMessageImpression(event.inAppMessage);
        Braze.logInAppMessageButtonClicked(event.inAppMessage, 0);
      }
      showToast('inAppMessage received in the React layer');
      console.log(event.inAppMessage);
    });

    const inAppMessageSubscription = Braze.addListener(
      Braze.Events.IN_APP_MESSAGE_RECEIVED,
      inAppMessage => {
        console.log('In-App Message Received: ', inAppMessage);
      },
    );

    const contentCardsSubscription = Braze.addListener(
      Braze.Events.CONTENT_CARDS_UPDATED,
      data => {
        const cards = data.cards;
        console.log(
          `Received ${cards.length} Content Cards with IDs:`,
          cards.map(card => card.id),
        );
      },
    );

    const bannerCardsSubscription = Braze.addListener(
      Braze.Events.BANNER_CARDS_UPDATED,
      data => {
        const banners = data.banners;
        console.log(
          `Received ${banners.length} Banner Cards with placement IDs:`,
          banners.map(banner => banner.placementId),
        );
      },
    );
    // Perform an immediate refresh for default placements on app launch.
    Braze.requestBannersRefresh(['placement_1', 'placement_2', 'sdk-test-2']);

    const featureFlagsSubscription = Braze.addListener(
      Braze.Events.FEATURE_FLAGS_UPDATED,
      flags => {
        console.log(
          `Received ${flags.length} Feature Flags with IDs`,
          flags.map(flag => flag.id),
        );
        setFeatureFlags(flags);
      },
    );

    const sdkAuthErrorSubscription = Braze.addListener(
      Braze.Events.SDK_AUTHENTICATION_ERROR,
      data => {
        console.log(
          `SDK Authentication for ${data.user_id} failed with error code ${data.error_code}.`,
        );
      },
    );

    const pushEventSubscription = Braze.addListener(
      Braze.Events.PUSH_NOTIFICATION_EVENT,
      data => handlePushPayload(data),
    );

    return () => {
      listener.remove();
      inAppMessageSubscription.remove();
      contentCardsSubscription.remove();
      bannerCardsSubscription.remove();
      featureFlagsSubscription.remove();
      sdkAuthErrorSubscription.remove();
      pushEventSubscription.remove();
    };
  }, []);

  const changeUserPress = () => {
    Braze.changeUser(userIdText);
    showToast(`User changed to: ${userIdText}`);
  };

  const getUserIdPress = () => {
    Braze.getUserId((err, res) => {
      if (err) {
        console.log(`Error getting user ID: ${err}`);
      } else {
        showToast(`User ID: ${res}`);
        console.log(`User ID: ${res}`);
      }
    });
  };

  const setSignaturePress = () => {
    Braze.setSdkAuthenticationSignature(signatureText);
    showToast(`Signature set to: ${signatureText}`);
  };

  const logCustomEventPress = () => {
    const testDate = new Date();
    Braze.logCustomEvent(`${customEventText}NoProps`);
    Braze.logCustomEvent(customEventText, {
      arrayKey: [
        'arrayVal1',
        'arrayVal2',
        testDate,
        [testDate, 'nestedArrayval'],
        { dictInArrayKey: testDate },
        { type: 5 },
        { type: null },
      ],
      dictKey: {
        dictKey1: 'dictVal1',
        dictKey2: testDate,
        dictKey3: { nestedDictKey1: testDate },
        dictKey4: ['nestedArrayVal1', 'nestedArrayVal2'],
        dictKey5: { type: false },
        type: testDate,
      },
    });
    showToast(`Event logged: ${customEventText}`);
  };

  const setLanguagePress = () => {
    Braze.setLanguage(languageText);
    showToast(`Language changed to: ${languageText}`);
  };

  const setSubscriptionStatePress = () => {
    console.log(
      `Received request to change subscription state for email and push to ${subscriptionState}`,
    );
    switch (subscriptionState) {
      case 'o':
        Braze.setEmailNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.OPTED_IN,
        );
        Braze.setPushNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.OPTED_IN,
        );
        showToast('User opted in to Email & Push');
        break;
      case 'u':
        Braze.setEmailNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.UNSUBSCRIBED,
        );
        Braze.setPushNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.UNSUBSCRIBED,
        );
        showToast('User unsubscribed from Email & Push');
        break;
      case 's':
        Braze.setEmailNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.SUBSCRIBED,
        );
        Braze.setPushNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.SUBSCRIBED,
        );
        showToast('User subscribed to Email & Push');
        break;
    }
  };

  const setGenderPress = () => {
    console.log(`Received request to change gender to ${gender}`);
    switch (gender) {
      case 'f':
        Braze.setGender(Braze.Genders.FEMALE);
        showToast('User gender set to "female"');
        break;
      case 'm':
        Braze.setGender(Braze.Genders.MALE);
        showToast('User gender set to "male"');
        break;
      case 'n':
        Braze.setGender(Braze.Genders.NOT_APPLICABLE);
        showToast('User gender set to "not applicable"');
        break;
      case 'o':
        Braze.setGender(Braze.Genders.OTHER);
        showToast('User gender set to "other"');
        break;
      case 'p':
        Braze.setGender(Braze.Genders.PREFER_NOT_TO_SAY);
        showToast('User gender set to "prefer not to say"');
        break;
      case 'u':
        Braze.setGender(Braze.Genders.UNKNOWN);
        showToast('User gender set to "unknown"');
        break;
      case 'null':
        Braze.setGender(null);
        showToast('User gender set to null and will be removed from the profile.');
        break;
    }
  };

  const logPurchasePress = () => {
    const testDate = new Date();
    Braze.logPurchase('reactProductIdentifier', '1.2', 'USD', 2, {
      stringKey: 'stringValue',
      intKey: 42,
      floatKey: 1.23,
      boolKey: true,
      dateKey: testDate,
      dictKey: { dictKey1: 'dictVal1' },
    });
    Braze.logPurchase('reactProductIdentifier' + 'NoProps', '1.2', 'USD', 2);
    showToast('Purchase logged');
  };

  const logCustomAttributePress = () => {
    Braze.setCustomUserAttribute('sk', 'sv');
    Braze.setCustomUserAttribute('doubleattr', 4.5);
    Braze.setCustomUserAttribute('intattr', 88);
    Braze.setCustomUserAttribute('booleanattr', true);
    Braze.setCustomUserAttribute('dateattr', new Date());
    Braze.setCustomUserAttribute('stringArrayAttr', ['a', 'b']);
    Braze.setCustomUserAttribute('arrayOfObjectsAttr', [
      { one: 1, two: 'too' },
      { three: 3, four: 'fore' },
    ]);
    Braze.setCustomUserAttribute('objectAttr', { one: 1, two: 'too' }, false);
    Braze.setCustomUserAttribute('badArray', ['123', { one: 1, two: 2 }]);
    Braze.setCustomUserAttribute('badArray2', [true, 1, 'string', { one: 1 }]);
    Braze.setCustomUserAttribute('nullValueAttr', null);
    showToast('Custom attributes set');
  };

  const logCustomAttributeWithMergePress = () => {
    Braze.setCustomUserAttribute(
      'objectAttr',
      { three: 3, four: 'fore' },
      true,
    );
    Braze.setCustomUserAttribute('objectAttr', { two: 'updated_too' }, true);
    showToast('NCA with merge called');
  };

  const logUserAttributesPress = () => {
    Braze.setFirstName('Brian');
    Braze.setLastName('Wheeler');
    Braze.setEmail('brian+react@braze.com');
    Braze.setDateOfBirth(1987, 9, 21);
    Braze.setCountry('USA');
    Braze.setHomeCity('New York');
    Braze.setGender(Braze.Genders.MALE, (err, res) => {
      if (err) {
        console.log('Example callback error is ' + err);
      } else {
        console.log('Example callback result is ' + res);
      }
    });
    Braze.setPhoneNumber('9085555555');
    Braze.setLanguage('cs');
    Braze.setEmailNotificationSubscriptionType(
      Braze.NotificationSubscriptionTypes.UNSUBSCRIBED,
    );
    Braze.setPushNotificationSubscriptionType(
      Braze.NotificationSubscriptionTypes.SUBSCRIBED,
    );
    Braze.addAlias('arrayattr', 'alias-label-1');
    showToast('User attributes set.');
  };

  const unsetUserAttributesPress = () => {
    Braze.setFirstName(null);
    Braze.setLastName(null);
    Braze.setEmail(null);
    Braze.setCountry(null);
    Braze.setHomeCity(null);
    Braze.setGender(null, (err, res) => {
      if (err) {
        console.log('Example callback error is ' + err);
      } else {
        console.log('Example callback result is ' + res);
      }
    });
    Braze.setPhoneNumber(null);
    Braze.setLanguage(null);
    showToast('User attributes unset.');
  };

  const launchContentCardsPress = () => {
    Braze.launchContentCards(true);
  };

  const refreshFeatureFlagsPress = () => {
    Braze.refreshFeatureFlags();
    showToast('Feature Flags refresh requested');
  };

  const logFeatureFlagImpressionPress = () => {
    if (!featureFlagId) {
      console.log(
        'No Feature Flag ID entered. Not logging Feature Flag Impression.',
      );
      return;
    }
    Braze.logFeatureFlagImpression(featureFlagId);
    showToast(`Feature Flag Impression logged for ID: ${featureFlagId}`);
  };

  const unsetCustomUserAttributePress = () => {
    Braze.unsetCustomUserAttribute('sk');
    showToast('Custom attribute unset');
  };

  const addToCustomAttributeArrayPress = () => {
    Braze.addToCustomUserAttributeArray('myArray', 'arrayValue1');
    Braze.addToCustomUserAttributeArray('myArray', 'arrayValue2');
    showToast('Added to custom attribute array');
  };

  const removeFromCustomAttributeArrayPress = () => {
    Braze.removeFromCustomUserAttributeArray('myArray', 'arrayValue1');
    showToast('Removed from custom attribute array');
  };

  const incrementCustomAttributePress = () => {
    Braze.incrementCustomUserAttribute('intattr', 5);
    showToast('Attribute incremented');
  };

  const requestNewsFeedRefresh = () => {
    Braze.requestFeedRefresh();
    showToast('News Feed refreshed');
  };

  const logNewsFeedInteractions = async () => {
    let cards;
    try {
      cards = await Braze.getNewsFeedCards();
    } catch {
      console.log('News Feed Cards Promise Rejected');
      return;
    }

    if (cards == null || cards.length === 0) {
      console.log('No cached News Feed cards Found.');
      return;
    }

    console.log(`${cards.length} cached News Feed cards found.`);
    for (const card of cards) {
      const cardId = card.id;
      console.log(
        `Logging click and impression for News Feed card: ${JSON.stringify(
          card,
        )}`,
      );
      Braze.logNewsFeedCardClicked(cardId);
      Braze.logNewsFeedCardImpression(cardId);
    }
  };

  const enableAdTracking = () => {
    const testAdvertisingID = 'some_idfa_123';
    Braze.setAdTrackingEnabled(true, testAdvertisingID);
    Braze.setIdentifierForAdvertiser(testAdvertisingID);

    // Testing for backwards compatibility.
    Braze.setGoogleAdvertisingId(testAdvertisingID, true);

    showToast(`Ad tracking enabled with ID: ${testAdvertisingID}`);
  };

  const setIDFV = () => {
    const testIDFV = 'some_idfv';
    Braze.setIdentifierForVendor(testIDFV);

    if (Platform.OS === 'ios') {
      showToast(`iOS IDFV set to: ${testIDFV}`);
    } else if (Platform.OS === 'android') {
      showToast('IDFV is not supported on Android');
    }
  }

  const requestImmediateDataFlush = () => {
    Braze.requestImmediateDataFlush();
    showToast('Data flushed');
  };

  const wipeData = () => {
    Alert.alert('Wipe Data', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => {
          Braze.wipeData();
          showToast('Data wiped');
        },
      },
    ]);
  };

  const disableSDK = () => {
    Alert.alert('Disable SDK', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => {
          Braze.disableSDK();
          showToast('SDK disabled');
        },
      },
    ]);
  };

  const enableSDK = () => {
    Braze.enableSDK();
    showToast('SDK enabled');
  };

  // Note that this should normally be called only once
  // location permissions are granted by end user
  const requestLocationInitialization = () => {
    Braze.requestLocationInitialization();
    showToast('Init Requested');
  };

  // Note that this should normally be called only once per session
  // Demo location is Baltimore
  const requestGeofences = () => {
    Braze.requestGeofences(39.29, -76.61);
    showToast('Geofences Requested');
  };

  const setLastKnownLocation = () => {
    Braze.setLastKnownLocation(40.7128, 74.006, 23.0, 25.0, 19.0);
    Braze.setLastKnownLocation(40.7128, 74.006, null, null, null);
    Braze.setLastKnownLocation(40.7128, 74.006, null, 25.0, null);
    Braze.setLastKnownLocation(40.7128, 74.006, 23.0, 25.0, null);
    showToast('Last known location set');
  };

  const setLocationCustomAttribute = () => {
    Braze.setLocationCustomAttribute('work', 40.7128, 74.006);
    showToast('Location Set');
  };

  const requestContentCardsRefresh = () => {
    Braze.requestContentCardsRefresh();
    showToast('Content Cards Refreshed');
  };

  const hideCurrentInAppMessage = () => {
    Braze.hideCurrentInAppMessage();
    showToast('Message dismissed');
  };

  const setAttributionData = () => {
    const network = 'fakeblock';
    const campaign = 'everyone';
    const adGroup = 'adgroup1';
    const creative = 'bigImage';
    Braze.setAttributionData(network, campaign, adGroup, creative);
    showToast('Attribution Data Set');
  };

  const getDeviceId = () => {
    Braze.getDeviceId((err, res) => {
      if (err) {
        console.log(`Error getting device ID: ${err}`);
      } else {
        showToast(`Device ID: ${res}`);
      }
    });
  };

  const getContentCards = async () => {
    const cards = await Braze.getContentCards();
    if (cards.length === 0) {
      console.log('No Content Cards Found.');
      return;
    }

    console.log(`${cards.length} Content Cards found.`);
    for (const card of cards) {
      const cardId = card.id;
      console.log(`Got content card: ${JSON.stringify(card)}`);

      // Programmatically log impression, card click, and dismissal
      if (automaticallyInteract) {
        console.log('Automatically logging CC click and impression.');
        Braze.logContentCardClicked(cardId);
        Braze.logContentCardImpression(cardId);
        // To automate card dismissal, uncomment out the code below
        // Braze.logContentCardDismissed(cardId);
      }
    }
  };

  const getCachedContentCards = async () => {
    const cards = await Braze.getCachedContentCards();
    console.log(`${cards.length} cached Content Cards found.`);
    if (cards.length === 0) {
      return;
    }

    for (const card of cards) {
      const cardId = card.id;
      console.log(`Got content card from cache: ${JSON.stringify(card)}`);

      // Programmatically log impression, card click, and dismissal
      if (automaticallyInteract) {
        console.log(
          `Automatically logging CC click and impression for card ID: ${cardId}.`,
        );
        Braze.logContentCardClicked(cardId);
        Braze.logContentCardImpression(cardId);
        // To automate card dismissal, uncomment out the code below
        // Braze.logContentCardDismissed(cardId);
      }
    }
  };

  const getBannerByIdPress = async () => {
    if (!bannerPlacementId) {
      showToast('No Banner placement ID entered');
      return;
    }

    const banner = await Braze.getBanner(bannerPlacementId);
    if (!banner) {
      showToast(`No Banner Card with placement ID: ${bannerPlacementId}`);
      return;
    }
    showToast(`Found Banner Card. Check the console logs for details.`);
    console.log(`Got Banner Card: ${JSON.stringify(banner, null, '\t')}`);
  };

  const requestBannersRefreshPress = () => {
    if (!requestedBannerPlacements) {
      console.log('No placement IDs entered for Banners refresh');
      return;
    }
    // Split and trim the comma-separated string of placement IDs.
    const bannerPlacements = requestedBannerPlacements.split(',').map(idString=>idString.trim());
    Braze.requestBannersRefresh(bannerPlacements);
    showToast('Banner Cards Refreshed');
  };

  const changeDisplayedBannerPress = async () => {
    setDisplayedPlacement(displayedPlacementPlaceholder);
    const banner = await Braze.getBanner(displayedPlacementPlaceholder);
    if (!banner) {
      showToast(`No banner found for placement: ${displayedPlacementPlaceholder}`);
    }
  };

  // Update value, then store in NSUserDefaults to fetch in iOS layer
  const toggleiOSPushAutoEnabled = () => {
    if (Platform.OS === 'ios') {
      const updatedValue = !iOSPushAutoEnabled;
      setiOSPushAutoEnabled(updatedValue);
      Settings.set({ iOSPushAutoEnabledKey: updatedValue });

      console.log(`iOS Push Auto enabled: ${updatedValue}`);
      showToast(
        `iOS Push Automation: ${updatedValue}.\n Restart your app to take effect.`,
        4000,
      );
    }
  };

  const requestPushPermission = () => {
    const options = {
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    };

    Braze.requestPushPermission(options);
  };

  const getFeatureFlagsPress = async () => {
    const featureFlags = await Braze.getAllFeatureFlags();
    if (featureFlags.length === 0) {
      console.log('No Feature Flags Found.');
      return;
    }

    console.log(JSON.stringify(featureFlags));
    console.log(
      `${featureFlags.length} Feature Flags found.`,
      featureFlags.map(flag => flag.id),
    );
  };

  const getFeatureFlagByIdPress = async () => {
    if (!featureFlagId) {
      console.log('No Feature Flag ID entered');
      return;
    }

    const featureFlag = await Braze.getFeatureFlag(featureFlagId);
    if (!featureFlag) {
      console.log(`No Feature Flag Found with ID: ${featureFlagId}.`);
      return;
    }
    console.log(`Got Feature Flag: ${JSON.stringify(featureFlag)}`);
  };

  const updateTrackingListPress = async () => {
    const allowList = {
      adding: [
        Braze.TrackingProperty.FIRST_NAME,
        Braze.TrackingProperty.LAST_NAME,
      ],
      removing: [Braze.TrackingProperty.DEVICE_DATA],
      addingCustomEvents: ['custom-event1', 'custom-event2'],
      removingCustomAttributes: ['attr-1'],
    };
    Braze.updateTrackingPropertyAllowList(allowList);

    console.log(
      `Update tracking allow list with: ${JSON.stringify(allowList)}`,
    );
  };

  const getFeatureFlagPropertyPress = async () => {
    if (!featureFlagId) {
      console.log('No Feature Flag ID entered');
      return;
    }

    if (!featureFlagPropertyKey) {
      console.log('No Feature Flag property key entered');
      return;
    }

    let property;
    switch (featureFlagPropertyType) {
      case 'bool':
        property = await Braze.getFeatureFlagBooleanProperty(
          featureFlagId,
          featureFlagPropertyKey,
        );
        break;
      case 'num':
        property = await Braze.getFeatureFlagNumberProperty(
          featureFlagId,
          featureFlagPropertyKey,
        );
        break;
      case 'string':
        property = await Braze.getFeatureFlagStringProperty(
          featureFlagId,
          featureFlagPropertyKey,
        );
        break;
      case 'timestamp':
        property = await Braze.getFeatureFlagTimestampProperty(
          featureFlagId,
          featureFlagPropertyKey,
        );
        break;
      case 'json':
        property = await Braze.getFeatureFlagJSONProperty(
          featureFlagId,
          featureFlagPropertyKey,
        );
        property = JSON.stringify(property);
        break;
      case 'image':
        property = await Braze.getFeatureFlagImageProperty(
          featureFlagId,
          featureFlagPropertyKey,
        );
        break;
    }
    console.log(
      `Got Feature Flag ${featureFlagPropertyType} Property:${property}`,
    );
  };

  const setPushTokenPress = async () => {
    Braze.registerPushToken(pushToken);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      stickyHeaderIndices={[0]}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={[styles.toastView, { opacity: toastVisible ? 1 : 0 }]}>
        <Text style={styles.toastText}>{message}</Text>
      </View>

      {/* Events */}

      <View style={[styles.row, { marginTop: styles.toastView.height }]}></View>
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setUserIdText}
          value={userIdText}
        />
        <TouchableHighlight onPress={changeUserPress}>
          <Text>Set User ID</Text>
        </TouchableHighlight>
      </View>
      <TouchableHighlight onPress={getUserIdPress}>
        <Text>Get User ID</Text>
      </TouchableHighlight>
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setSignatureText}
          value={signatureText}
        />
        <TouchableHighlight onPress={setSignaturePress}>
          <Text>Set Signature</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setCustomEventText}
        />
        <TouchableHighlight onPress={logCustomEventPress}>
          <Text>Log Custom Event</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setLanguageText}
        />
        <TouchableHighlight onPress={setLanguagePress}>
          <Text>Set Language</Text>
        </TouchableHighlight>
      </View>
      <TouchableHighlight onPress={logPurchasePress}>
        <Text>Log Purchase</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={hideCurrentInAppMessage}>
        <Text>Dismiss In App Message</Text>
      </TouchableHighlight>

      {/* User Attributes */}

      <View style={styles.row}>
        <RadioGroup
          containerStyle={styles.radioGroup}
          radioButtons={subscriptionStateButtons}
          selectedId={subscriptionState}
          onPress={setSubscriptionState}
        />
        <TouchableHighlight onPress={setSubscriptionStatePress}>
          <Text>Set Subscription State</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.row}>
        <RadioGroup
          containerStyle={styles.radioGroup}
          radioButtons={genderButtons}
          selectedId={gender}
          onPress={setGender}
        />
        <TouchableHighlight onPress={setGenderPress}>
          <Text>Set Gender</Text>
        </TouchableHighlight>
      </View>
      <TouchableHighlight onPress={logUserAttributesPress}>
        <Text>Set User Attributes</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={unsetUserAttributesPress}>
        <Text>Unset User Attributes</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={logCustomAttributePress}>
        <Text>Set Custom User Attributes</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={logCustomAttributeWithMergePress}>
        <Text>Set Custom User Attributes with NCA Merge</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={unsetCustomUserAttributePress}>
        <Text>Unset Custom User Attributes</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={addToCustomAttributeArrayPress}>
        <Text>Add to Custom Attribute Array</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={removeFromCustomAttributeArrayPress}>
        <Text>Remove From Custom Attribute Array</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={incrementCustomAttributePress}>
        <Text>Increment Custom Attribute Array</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={updateTrackingListPress}>
        <Text>Update Tracking Properties (iOS)</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={enableAdTracking}>
        <Text>Enable Ad Tracking</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={setIDFV}>
        <Text>Set iOS IDFV</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={requestImmediateDataFlush}>
        <Text style={styles.warningText}>Flush Data ⚡️</Text>
      </TouchableHighlight>

      {/* Content Cards */}

      <Space />
      <TouchableHighlight onPress={launchContentCardsPress}>
        <Text>Launch Content Cards</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={requestContentCardsRefresh}>
        <Text>Request Content Cards Refresh</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={getContentCards}>
        <Text>Get Content Cards {'&'} Log interactions</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={getCachedContentCards}>
        <Text>Get Cached Content Cards {'&'} Log interactions</Text>
      </TouchableHighlight>

      {/* Banner Cards */}
      <Space />
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          placeholder='Placement IDs (comma-separated)'
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setRequestedBannerPlacements}
          value={requestedBannerPlacements}
        />
        <TouchableHighlight onPress={requestBannersRefreshPress}>
          <Text>Request Banners Refresh</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          placeholder='Placement ID'
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setBannerPlacementId}
          value={bannerPlacementId}
        />
        <TouchableHighlight onPress={getBannerByIdPress}>
          <Text>Get Banner Card by Placement ID</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          placeholder='Placement ID'
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={(text) => setDisplayedPlacementPlaceholder(text)}
          value={displayedPlacementPlaceholder}
        />
        <TouchableHighlight onPress={changeDisplayedBannerPress}>
          <Text>Change Displayed Banner</Text>
        </TouchableHighlight>
      </View>
      <Braze.BrazeBannerView
        placementID={displayedPlacement}

        // Uncomment the properties below for optional style overrides.
        //
        // In the simplest integration, only `placementID` is required.
        // Dynamic height sizing is handled implicitly by the component without needing `onHeightChanged`.

        // style={[styles.banner, { height: bannerHeight }]}
        // onHeightChanged={height => {
        //   console.log(`Banner height changed to: ${height}`);
        //   setBannerHeight(height);
        // }}
      />

      {/* News Feed */}

      <Space />
      <TouchableHighlight onPress={requestNewsFeedRefresh}>
        <Text>Request News Feed Refresh</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={logNewsFeedInteractions}>
        <Text>Log interactions on News Feed cards</Text>
      </TouchableHighlight>

      {/* Feature Flags */}

      <Space />
      <TouchableHighlight onPress={refreshFeatureFlagsPress}>
        <Text>Refresh Feature Flags</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={logFeatureFlagImpressionPress}>
        <Text>Log Feature Flag Impression</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={getFeatureFlagsPress}>
        <Text>Get All Feature Flags</Text>
      </TouchableHighlight>
      <View style={styles.row}>
        <TextInput
          style={styles.textInput}
          placeholder='Flag ID'
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setFeatureFlagId}
          value={featureFlagId}
        />
        <TouchableHighlight onPress={getFeatureFlagByIdPress}>
          <Text>Get Feature Flag by ID</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.container}>
        <RadioGroup
          containerStyle={styles.radioGroup}
          radioButtons={featureFlagPropertyButtons}
          selectedId={featureFlagPropertyType}
          onPress={setFeatureFlagPropertyType}
        />
        <TextInput
          style={styles.textInput}
          placeholder='Property Key'
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={setFeatureFlagPropertyKey}
          value={featureFlagPropertyKey}
        />
        <TouchableHighlight onPress={getFeatureFlagPropertyPress}>
          <Text>Get Feature Flag Property</Text>
        </TouchableHighlight>
      </View>

      {/* Location */}

      <Space />
      {Platform.OS === 'android' ? (
        <TouchableHighlight onPress={requestLocationInitialization}>
          <Text>Request Location Initialization</Text>
        </TouchableHighlight>
      ) : (
        false
      )}
      <TouchableHighlight onPress={requestGeofences}>
        <Text>Request Geofences</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={setLastKnownLocation}>
        <Text>Set Last Known Location</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={setLocationCustomAttribute}>
        <Text>Set Custom Location Attribute</Text>
      </TouchableHighlight>

      {/* Other */}

      <Space />
      <TouchableHighlight onPress={toggleiOSPushAutoEnabled}>
        <Text>Toggle iOS Push Automation enabled</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={requestPushPermission}>
        <Text>Request Push Permission</Text>
      </TouchableHighlight>
      <TextInput
        style={styles.textInput}
        placeholder='Push Token'
        autoCorrect={false}
        autoCapitalize="none"
        onChangeText={setPushToken}
        value={pushToken}
      />
      <TouchableHighlight onPress={setPushTokenPress}>
        <Text>Set Push Token</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={setAttributionData}>
        <Text>Set Attribution Data</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={getDeviceId}>
        <Text>Get Device ID</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={wipeData}>
        <Text>Wipe Data</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={disableSDK}>
        <Text>Disable SDK</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={enableSDK}>
        <Text>Enable SDK</Text>
      </TouchableHighlight>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  spacing: {
    flexDirection: 'row',
    height: 16,
    alignSelf: 'stretch',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingBottom: 100,
  },
  banner: {
    width: '100%',
  },
  textInput: {
    height: 40,
    width: 150,
    borderColor: 'gray',
    borderWidth: 0.5,
    paddingLeft: 5,
    marginLeft: 5,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioGroup: {
    width: 200,
    alignItems: 'flex-start',
  },
  toastView: {
    display: 'flex',
    height: 80,
    backgroundColor: 'green',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  toastText: {
    marginLeft: 10,
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  warningText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
