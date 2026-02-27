import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Settings } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
import Braze from '@braze/react-native-sdk';
import { Button, Input, Card, ScreenLayout, useToast } from '../components';
import { Colors } from '../constants/colors';

const iOSPushAutoEnabledKey = 'iOSPushAutoEnabled';

export const UserManagementScreen: React.FC = () => {
  const { toastVisible, message, showToast } = useToast();
  const [userIdText, setUserIdText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [signatureText, setSignatureText] = useState('');
  const [customEventText, setCustomEventText] = useState('');
  const [languageText, setLanguageText] = useState('');
  const [subscriptionState, setSubscriptionState] = useState<string>('s');
  const [gender, setGender] = useState<string>('m');
  const [pushToken, setPushToken] = useState('');

  const [iOSPushAutoEnabled, setiOSPushAutoEnabled] = useState<boolean>(() => {
    if (Platform.OS === 'ios') {
      const value = Settings.get(iOSPushAutoEnabledKey);
      return value != null ? Boolean(value) : true;
    } else {
      return false;
    }
  });

  useEffect(() => {
    Braze.getUserId((err, res) => {
      if (!err && res) {
        setCurrentUserId(res);
      }
    });
  }, []);

  const subscriptionStateButtons = useMemo(
    () => [
      { id: 'o', label: 'Opted In', value: 'o' },
      { id: 'u', label: 'Unsubscribed', value: 'u' },
      { id: 's', label: 'Subscribed', value: 's' },
    ],
    [],
  );

  const genderButtons = useMemo(
    () => [
      { id: 'f', label: 'Female', value: 'f' },
      { id: 'm', label: 'Male', value: 'm' },
      { id: 'o', label: 'Other', value: 'o' },
      { id: 'p', label: 'Prefer Not to Say', value: 'p' },
      { id: 'n', label: 'Not Applicable', value: 'n' },
      { id: 'u', label: 'Unknown', value: 'u' },
      { id: 'null', label: 'Unset from Profile', value: 'null' },
    ],
    [],
  );

  // User Management
  const changeUserPress = () => {
    Braze.changeUser(userIdText);
    setCurrentUserId(userIdText);
    showToast(`User changed to: ${userIdText}`);
  };

  const getUserIdPress = () => {
    Braze.getUserId((err, res) => {
      if (err) {
        Alert.alert('Error', String(err));
      } else {
        Alert.alert('User ID', res || 'No user ID set');
      }
    });
  };

  const setSignaturePress = () => {
    Braze.setSdkAuthenticationSignature(signatureText);
    showToast(`Signature set to: ${signatureText}`);
  };

  // Events
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

  // User Attributes
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
        break;
      case 'u':
        Braze.setEmailNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.UNSUBSCRIBED,
        );
        Braze.setPushNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.UNSUBSCRIBED,
        );
        break;
      case 's':
        Braze.setEmailNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.SUBSCRIBED,
        );
        Braze.setPushNotificationSubscriptionType(
          Braze.NotificationSubscriptionTypes.SUBSCRIBED,
        );
        break;
      default:
        break;
    }
    showToast('Subscription state updated');
  };

  const setGenderPress = () => {
    console.log(`Received request to change gender to ${gender}`);
    switch (gender) {
      case 'f':
        Braze.setGender(Braze.Genders.FEMALE);
        break;
      case 'm':
        Braze.setGender(Braze.Genders.MALE);
        break;
      case 'o':
        Braze.setGender(Braze.Genders.OTHER);
        break;
      case 'p':
        Braze.setGender(Braze.Genders.PREFER_NOT_TO_SAY);
        break;
      case 'n':
        Braze.setGender(Braze.Genders.NOT_APPLICABLE);
        break;
      case 'u':
        Braze.setGender(Braze.Genders.UNKNOWN);
        break;
      case 'null':
        Braze.setGender(null);
        break;
      default:
        break;
    }
    showToast('Gender updated');
  };

  const logUserAttributesPress = () => {
    Braze.setFirstName('Brian');
    Braze.setLastName('Wheeler');
    Braze.setEmail('brian+react@braze.com');
    Braze.setDateOfBirth(1987, 9, 21);
    Braze.setCountry('USA');
    Braze.setHomeCity('New York');
    Braze.setGender(Braze.Genders.MALE);
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
    Braze.setGender(null);
    Braze.setPhoneNumber(null);
    Braze.setLanguage(null);
    showToast('User attributes unset.');
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

  const updateTrackingListPress = () => {
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
    showToast('Tracking properties updated (iOS)');
  };

  // SDK Controls
  const enableAdTracking = () => {
    const testAdvertisingID = 'some_idfa_123';
    Braze.setAdTrackingEnabled(true, testAdvertisingID);
    Braze.setIdentifierForAdvertiser(testAdvertisingID);
    showToast(`Ad tracking enabled with ID: ${testAdvertisingID}`);
  };

  const setIDFV = () => {
    const testIDFV = 'some_idfv';
    Braze.setIdentifierForVendor(testIDFV);

    if (Platform.OS === 'ios') {
      showToast(`iOS IDFV set to: ${testIDFV}`);
    } else if (Platform.OS === 'android') {
      showToast(`Android IDFV set to: ${testIDFV}`);
    }
  };

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

  const getDeviceId = () => {
    Braze.getDeviceId((err, res) => {
      if (err) {
        Alert.alert('Error', String(err));
      } else {
        Alert.alert('Device ID', res || 'No device ID');
      }
    });
  };

  // Location
  const requestLocationInitialization = () => {
    Braze.requestLocationInitialization();
    showToast('Init Requested');
  };

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

  const setAttributionData = () => {
    const network = 'fakeblock';
    const campaign = 'everyone';
    const adGroup = 'adgroup1';
    const creative = 'bigImage';
    Braze.setAttributionData(network, campaign, adGroup, creative);
    showToast('Attribution Data Set');
  };

  const hideCurrentInAppMessage = () => {
    Braze.hideCurrentInAppMessage();
    showToast('Message dismissed');
  };

  // Push
  const toggleiOSPushAutoEnabled = () => {
    if (Platform.OS === 'ios') {
      const newValue = !iOSPushAutoEnabled;
      setiOSPushAutoEnabled(newValue);
      Settings.set({ [iOSPushAutoEnabledKey]: newValue });
      showToast(
        `iOS Push Auto Enabled: ${newValue ? 'Enabled' : 'Disabled'}`,
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

  const setPushTokenPress = () => {
    Braze.registerPushToken(pushToken);
    showToast('Push token registered');
  };

  return (
    <ScreenLayout
      title="Other Features"
      subtitle="Events, user attributes, SDK controls, and more"
      toastVisible={toastVisible}
      toastMessage={message}>
      <Card title="User Management">
        <Button title="Get Device ID" onPress={getDeviceId} />
        <Input
          label="User ID"
          placeholder={currentUserId || "Enter user ID"}
          onChangeText={setUserIdText}
          value={userIdText}
          autoCapitalize="none"
        />
        <Button title="Set User ID" onPress={changeUserPress} />
        <Button
          title="Get User ID"
          onPress={getUserIdPress}
          variant="secondary"
        />
        <Input
          label="SDK Authentication Signature"
          placeholder="Enter signature"
          onChangeText={setSignatureText}
          value={signatureText}
          autoCapitalize="none"
        />
        <Button
          title="Set Signature"
          onPress={setSignaturePress}
        />
      </Card>

      <Card title="Events">
        <Input
          label="Custom Event Name"
          placeholder="Enter event name"
          onChangeText={setCustomEventText}
          value={customEventText}
          autoCapitalize="none"
        />
        <Button title="Log Custom Event" onPress={logCustomEventPress} />
        <Button
          title="Log Purchase (with fixed values)"
          onPress={logPurchasePress}
        />
        <Button
          title="Dismiss In App Message"
          onPress={hideCurrentInAppMessage}
          variant="secondary"
        />
      </Card>

        <Card title="Language & Subscription">
          <Input
            label="Language"
            placeholder="Enter language code"
            onChangeText={setLanguageText}
            value={languageText}
            autoCapitalize="none"
          />
          <Button title="Set Language" onPress={setLanguagePress} />

          <Text style={styles.sectionLabel}>Subscription State</Text>
          <RadioGroup
            containerStyle={styles.radioGroup}
            radioButtons={subscriptionStateButtons}
            selectedId={subscriptionState}
            onPress={setSubscriptionState}
          />
          <Button
            title="Set Subscription State"
            onPress={setSubscriptionStatePress}
          />
        </Card>

        <Card title="User Attributes">
          <Button
            title="Set User Attributes"
            onPress={logUserAttributesPress}
          />
          <Button
            title="Unset User Attributes"
            onPress={unsetUserAttributesPress}
            variant="secondary"
          />

          <Text style={styles.sectionLabel}>Gender</Text>
          <RadioGroup
            containerStyle={styles.radioGroup}
            radioButtons={genderButtons}
            selectedId={gender}
            onPress={setGender}
          />
          <Button title="Set Gender" onPress={setGenderPress} />
        </Card>

        <Card title="Custom Attributes">
          <Button
            title="Set Custom User Attributes"
            onPress={logCustomAttributePress}
          />
          <Button
            title="Set Custom Attributes with NCA Merge"
            onPress={logCustomAttributeWithMergePress}
          />
          <Button
            title="Unset Custom User Attributes"
            onPress={unsetCustomUserAttributePress}
            variant="secondary"
          />
          <Button
            title="Add to Custom Attribute Array"
            onPress={addToCustomAttributeArrayPress}
          />
          <Button
            title="Remove From Custom Attribute Array"
            onPress={removeFromCustomAttributeArrayPress}
            variant="secondary"
          />
          <Button
            title="Increment Custom Attribute"
            onPress={incrementCustomAttributePress}
          />
        </Card>

        <Card title="Tracking & Attribution">
          <Button
            title="Update Tracking Properties (iOS)"
            onPress={updateTrackingListPress}
          />
          <Button
            title="Enable Ad Tracking"
            onPress={enableAdTracking}
          />
          <Button
            title="Set iOS IDFV"
            onPress={setIDFV}
          />
          <Button
            title="Set Attribution Data"
            onPress={setAttributionData}
          />
        </Card>

        <Card title="Location">
          {Platform.OS === 'android' && (
            <Button
              title="Request Location Initialization"
              onPress={requestLocationInitialization}
            />
          )}
          <Button title="Request Geofences" onPress={requestGeofences} />
          <Button
            title="Set Last Known Location"
            onPress={setLastKnownLocation}
          />
          <Button
            title="Set Custom Location Attribute"
            onPress={setLocationCustomAttribute}
          />
        </Card>

        <Card title="Push Notifications">
          <Button
            title="Toggle iOS Push Automation enabled"
            onPress={toggleiOSPushAutoEnabled}
          />
          <Button
            title="Request Push Permission"
            onPress={requestPushPermission}
          />
          <Input
            label="Push Token"
            placeholder="Enter push token"
            onChangeText={setPushToken}
            value={pushToken}
            autoCapitalize="none"
          />
          <Button
            title="Set Push Token"
            onPress={setPushTokenPress}
          />
        </Card>

        <Card title="SDK Controls">
          <Button
            title="Request Immediate Data Flush"
            onPress={requestImmediateDataFlush}
          />
          <Button title="Wipe Data" onPress={wipeData} variant="danger" />
          <Button title="Disable SDK" onPress={disableSDK} variant="danger" />
          <Button
            title="Enable SDK"
            onPress={enableSDK}
          />
        </Card>
      </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMedium,
    marginTop: 16,
    marginBottom: 8,
  },
  radioGroup: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
});
