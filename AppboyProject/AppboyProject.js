'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableHighlight,
  Linking,
  Alert,
  TextInput,
  Platform
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

import Braze from "react-native-appboy-sdk";

class AppboyProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userIdText : '',
      signatureText: '',
      customEventText : '',
      subscriptionState : 's',
      gender : 'm',
      message: 'Success',
      toastVisible: 0
    };
    this._getInstallTrackingId = this._getInstallTrackingId.bind(this);
    this._updateCardCount = this._updateCardCount.bind(this);
    this._changeUserPress = this._changeUserPress.bind(this);
    this._setSignaturePress = this._setSignaturePress.bind(this);
    this._logCustomEventPress = this._logCustomEventPress.bind(this);
    this._setSubscriptionStatePress = this._setSubscriptionStatePress.bind(this);
    this._logPurchasePress = this._logPurchasePress.bind(this);
    this._setLanguagePress = this._setLanguagePress.bind(this);
    this._logCustomAttributePress = this._logCustomAttributePress.bind(this);
    this._logUserPropertiesPress = this._logUserPropertiesPress.bind(this);
    this._unsetCustomUserAttributePress = this._unsetCustomUserAttributePress.bind(this);
    this._addToCustomAttributeArrayPress = this._addToCustomAttributeArrayPress.bind(this);
    this._removeFromCustomAttributeArrayPress = this._removeFromCustomAttributeArrayPress.bind(this);
    this._incrementCustomAttributePress = this._incrementCustomAttributePress.bind(this);
    this._requestFeedRefresh = this._requestFeedRefresh.bind(this);
    this._requestImmediateDataFlush = this._requestImmediateDataFlush.bind(this);
    this._wipeData = this._wipeData.bind(this);
    this._disableSDK = this._disableSDK.bind(this);
    this._enableSDK = this._enableSDK.bind(this);
    this._requestLocationInitialization = this._requestLocationInitialization.bind(this);
    this._requestGeofences = this._requestGeofences.bind(this);
    this._setLocationCustomAttribute = this._setLocationCustomAttribute.bind(this);
    this._setGenderPress = this._setGenderPress.bind(this);
    this._requestContentCardsRefresh = this._requestContentCardsRefresh.bind(this);
    this._hideCurrentInAppMessage = this._hideCurrentInAppMessage.bind(this);
    this._setAttributionData = this._setAttributionData.bind(this);
    this._getContentCards = this._getContentCards.bind(this);
    this._requestPushPermission = this._requestPushPermission.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount called');

    // Listen to the `url` event to handle incoming deep links
    this._urlListener = Linking.addEventListener('url', this._handleOpenUrl);

    // No `url` event is triggered on application start, so this handles
    // the case where a deep link launches the application
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Linking.getInitialURL is ' + url);
        this._showToast('Linking.getInitialURL is ' + url);
        this._handleOpenUrl({url});
      }
    }).catch(err => console.error('Error getting initial URL', err));

    // Handles deep links when an iOS app is launched from hard close via push click.
    // Note that this isn't handled by Linking.getInitialURL(), as the app is
    // launched not from a deep link, but from clicking on the push notification.
    // For more detail, see `Braze.getInitialURL` in `index.js`.
    Braze.getInitialURL((url) => {
      if (url) {
        console.log('Braze.getInitialURL is ' + url);
        this._showToast('Braze.getInitialURL is ' + url);
        this._handleOpenUrl({url});
      }
    });

    Braze.subscribeToInAppMessage(true, (event) => {
      let inAppMessage = new Braze.BrazeInAppMessage(event.inAppMessage);
      Braze.logInAppMessageClicked(inAppMessage);
      Braze.logInAppMessageImpression(inAppMessage);
      Braze.logInAppMessageButtonClicked(inAppMessage, 0);
      this._showToast('inAppMessage received in the React layer');
      console.log(inAppMessage);
    });

    Braze.addListener(Braze.Events.IN_APP_MESSAGE_RECEIVED, function(event) {
      console.log('In-App Message Received');
    });

    Braze.addListener(Braze.Events.CONTENT_CARDS_UPDATED, function(cards) {
      console.log('Content Cards Updated.');
    });

    Braze.addListener(Braze.Events.SDK_AUTHENTICATION_ERROR, function(data) {
      console.log(`SDK Authentication for ${data.user_id} failed with error code ${data.error_code}.`);
    });

    Braze.addListener(Braze.Events.PUSH_NOTIFICATION_EVENT, function(data) {
      console.log(`Push Notification event of type ${data.push_event_type} seen.
        Title ${data.title}\n and deeplink ${data.deeplink}`);
      console.log(JSON.stringify(data, undefined, 2));
    });
  }

  componentWillUnmount() {
    // Remove `url` event handler
    this._urlListener.remove();
  }

  _handleOpenUrl(event) {
    console.log('handleOpenUrl called on url ' + event.url);
    Alert.alert(
      'Deep Link',
      event.url,
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')}
      ]
    );
  }

  _updateCardCount() {
    Braze.getUnreadCardCountForCategories(Braze.CardCategory.ALL, (err, res) => {
      if (err) {
        console.log('getUnreadCardCountForCategories returned error ' + err);
      } else if (res != null) {
        this.setState({unreadCardCount: res});
      }
    });
    Braze.getCardCountForCategories(Braze.CardCategory.ALL, (err, res) => {
      if (err) {
        console.log('getCardCountForCategories returned error ' + err);
      } else if (res != null) {
        this.setState({cardCount: res});
      }
    });
  }

  render() {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        stickyHeaderIndices={[0]}>
        <View
          style={[styles.toastView, {opacity: this.state.toastVisible}]}>
          <Text
            style={styles.toastText}>
            {this.state.message}
          </Text>
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            onChangeText={(userIdText) => this.setState({userIdText})}
            value={this.state.userIdText}
            />
          <TouchableHighlight
            onPress={this._changeUserPress}>
            <Text>Set User ID</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            onChangeText={(signatureText) => this.setState({signatureText})}
            value={this.state.signatureText}
            />
          <TouchableHighlight
            onPress={this._setSignaturePress}>
            <Text>Set Signature</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            onChangeText={(customEventText) => this.setState({customEventText})}/>
          <TouchableHighlight
            onPress={this._logCustomEventPress}>
            <Text>Log Custom Event</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            onChangeText={(languageText) => this.setState({languageText})}/>
          <TouchableHighlight
            onPress={this._setLanguagePress}>
            <Text>Set Language</Text>
          </TouchableHighlight>
        </View>
        <TouchableHighlight
          onPress={this._logPurchasePress}>
          <Text>Log Purchase</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._logCustomAttributePress}>
          <Text>Set Custom User Attributes</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._logUserPropertiesPress}>
          <Text>Set User Properties</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._hideCurrentInAppMessage}>
          <Text>Dismiss In App Message</Text>
        </TouchableHighlight>
        <View style={styles.row}>
          <Picker
            style={styles.picker}
            itemStyle={{fontSize: 16}}
            selectedValue={this.state.subscriptionState}
            onValueChange={(value) => this.setState({subscriptionState: value})}>
            <Picker.Item label='Subscribed' value='s' />
            <Picker.Item label='Unsubscribed' value='u' />
            <Picker.Item label='Opted-in' value='o' />
          </Picker>
          <TouchableHighlight
            onPress={this._setSubscriptionStatePress}>
            <Text>Set Subscription State</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.row}>
          <Picker
            style={styles.picker}
            itemStyle={{fontSize: 16}}
            selectedValue={this.state.gender}
            onValueChange={(value) => this.setState({gender: value})}>
            <Picker.Item label='Female' value='f' />
            <Picker.Item label='Male' value='m' />
            <Picker.Item label='Not Applicable' value='n' />
            <Picker.Item label='Other' value='o' />
            <Picker.Item label='Prefer Not to Say' value='p' />
            <Picker.Item label='Unknown' value='u' />
          </Picker>
          <TouchableHighlight
            onPress={this._setGenderPress}>
            <Text>Set Gender</Text>
          </TouchableHighlight>
        </View>
        <TouchableHighlight
          onPress={this._unsetCustomUserAttributePress}>
          <Text>Unset Custom User Attributes</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._addToCustomAttributeArrayPress}>
          <Text>Add to Custom Attribute Array</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._removeFromCustomAttributeArrayPress}>
          <Text>Remove From Custom Attribute Array</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._incrementCustomAttributePress}>
          <Text>Increment Custom Attribute Array</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._launchNewsFeedPress}>
          <Text>Launch News Feed</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._updateCardCount}>
          <Text>Unread Cards (Click to Refresh): {this.state.unreadCardCount} / {this.state.cardCount}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._requestFeedRefresh}>
          <Text>Request Feed Refresh</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._launchContentCardsPress}>
          <Text>Launch Content Cards</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._requestContentCardsRefresh}>
          <Text>Request Content Cards Refresh</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._requestImmediateDataFlush}>
          <Text>Request Immediate Data Flush</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._wipeData}>
          <Text>Wipe Data</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._disableSDK}>
          <Text>Disable SDK</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._enableSDK}>
          <Text>Enable SDK</Text>
        </TouchableHighlight>
        { Platform.OS === 'android' ?
        <TouchableHighlight
          onPress={this._requestLocationInitialization}>
          <Text>Request Location Initialization</Text>
        </TouchableHighlight>
        : false }
        <TouchableHighlight
          onPress={this._requestGeofences}>
          <Text>Request Geofences</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._setLocationCustomAttribute}>
          <Text>Set Custom Location Attribute</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._setAttributionData}>
          <Text>Set Attribution Data</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._getInstallTrackingId}>
          <Text>Get Install Tracking ID</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._getContentCards}>
          <Text>Request Cached Content Cards</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._requestPushPermission}>
          <Text>Request Push Permission</Text>
        </TouchableHighlight>
        </ScrollView>
    );
  }
  _showToast(message) {
    this.setState({ message: message });
    this.setState({toastVisible: 1}, this._hideToast);
  }
  _hideToast() {
    setTimeout(() => {
      this.setState({ message: 'Success' });
      this.setState({toastVisible: 0});
    }, 1000)
  }
  _changeUserPress(event) {
    Braze.changeUser(this.state.userIdText);
    this._showToast('User changed to: ' + this.state.userIdText);
  }
  _setSignaturePress(event) {
    Braze.setSdkAuthenticationSignature(this.state.signatureText);
    this._showToast('Signature set to: ' + this.state.signatureText);
  }
  _logCustomEventPress(event) {
    var testDate = new Date();
    Braze.logCustomEvent(this.state.customEventText, {'stringKey': 'stringValue', 'intKey': 42, 'floatKey': 1.23, 'boolKey': true, 'dateKey': testDate});
    Braze.logCustomEvent(this.state.customEventText + 'NoProps');
    Braze.logCustomEvent(this.state.customEventText, {'arrayKey': ['arrayVal1', 'arrayVal2', testDate, [testDate, 'nestedArrayval'], {'dictInArrayKey': testDate}], 'dictKey': {'dictKey1': 'dictVal1', 'dictKey2': testDate, 'dictKey3': {'nestedDictKey1': testDate}, 'dictKey4': ['nestedArrayVal1', 'nestedArrayVal2']}});
    this._showToast('Event logged: ' + this.state.customEventText);
  }
  _setLanguagePress(event) {
    Braze.setLanguage(this.state.languageText);
    this._showToast('Language changed to: ' + this.state.languageText);
  }
  _setSubscriptionStatePress(event) {
    console.log('Received request to change subscription state for email and push to ' + this.state.subscriptionState);
    if (this.state.subscriptionState == 'o') {
      Braze.setEmailNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.OPTED_IN);
      Braze.setPushNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.OPTED_IN);
      this._showToast('User opted in to Email & Push');
    } else if (this.state.subscriptionState == 'u') {
      Braze.setEmailNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.UNSUBSCRIBED);
      Braze.setPushNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.UNSUBSCRIBED);
      this._showToast('User unsubscribed from Email & Push');
    } else if (this.state.subscriptionState == 's') {
      Braze.setEmailNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.SUBSCRIBED);
      Braze.setPushNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.SUBSCRIBED);
      this._showToast('User subscribed to Email & Push');
    }
  }
  _setGenderPress(event) {
    console.log('Received request to change gender to ' + this.state.gender);
    if (this.state.gender == 'f') {
      Braze.setGender(Braze.Genders.FEMALE)
      this._showToast('User gender set to "female"');
    } else if (this.state.gender == 'm') {
      Braze.setGender(Braze.Genders.MALE)
      this._showToast('User gender set to "male"');
    }  else if (this.state.gender == 'n') {
      Braze.setGender(Braze.Genders.NOT_APPLICABLE)
      this._showToast('User gender set to "not applicable"');
    } else if (this.state.gender == 'o') {
      Braze.setGender(Braze.Genders.OTHER)
      this._showToast('User gender set to "other"');
    } else if (this.state.gender == 'p') {
      Braze.setGender(Braze.Genders.PREFER_NOT_TO_SAY)
      this._showToast('User gender set to "prefer not to say"');
    } else if (this.state.gender == 'u') {
      Braze.setGender(Braze.Genders.UNKNOWN)
      this._showToast('User gender set to "unknown"');
    }
  }
  _logPurchasePress(event) {
    var testDate = new Date();
    Braze.logPurchase('reactProductIdentifier', '1.2', 'USD', 2, {'stringKey': 'stringValue', 'intKey': 42, 'floatKey': 1.23, 'boolKey': true, 'dateKey': testDate, 'dictKey':{'dictKey1': 'dictVal1'}});
    Braze.logPurchase('reactProductIdentifier' + 'NoProps', '1.2', 'USD', 2);
    this._showToast('Purchase logged');
  }
  _logCustomAttributePress(event) {
    Braze.setCustomUserAttribute('sk', 'sv');
    Braze.setCustomUserAttribute('doubleattr', 4.5);
    Braze.setCustomUserAttribute('intattr', 88);
    Braze.setCustomUserAttribute('booleanattr', true);
    Braze.setCustomUserAttribute('dateattr', new Date());
    Braze.setCustomUserAttribute('arrayattr', ['a', 'b']);
    this._showToast('Custom attributes set');
  }
  _logUserPropertiesPress(event) {
    Braze.setFirstName('Brian');
    Braze.setLastName('Wheeler');
    Braze.setEmail('brian+react@appboy.com');
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
    Braze.setEmailNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.UNSUBSCRIBED);
    Braze.setPushNotificationSubscriptionType(Braze.NotificationSubscriptionTypes.SUBSCRIBED);
    Braze.addAlias('arrayattr', 'alias-label-1');
    this._showToast('User properties set');
  }
  _launchNewsFeedPress(event) {
    Braze.launchNewsFeed();
  }
  _launchContentCardsPress(event) {
    Braze.launchContentCards();
  }
  _unsetCustomUserAttributePress(event) {
    Braze.unsetCustomUserAttribute('sk');
    this._showToast('Custom attribute unset');
  }
  _addToCustomAttributeArrayPress(event) {
    Braze.addToCustomUserAttributeArray('myArray', 'arrayValue1');
    Braze.addToCustomUserAttributeArray('myArray', 'arrayValue2');
    this._showToast('Added to custom attribute array');
  }
  _removeFromCustomAttributeArrayPress(event) {
    Braze.removeFromCustomUserAttributeArray('myArray', 'arrayValue1');
    this._showToast('Removed from custom attribute array');
  }
  _incrementCustomAttributePress(event) {
    Braze.incrementCustomUserAttribute('intattr', 5);
    this._showToast('Attribute incremented');
  }

  _requestFeedRefresh(event) {
    Braze.requestFeedRefresh();
    this._showToast('Feed refreshed');
  }

  _requestImmediateDataFlush(event) {
    Braze.requestImmediateDataFlush();
    this._showToast('Data flushed');
  }

  _wipeData(event) {
    Alert.alert(
      'Wipe Data',
      'Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK', onPress: () => {
            Braze.wipeData();
            this._showToast('Data wiped');
          }
        }
      ]
    );
  }

  _disableSDK(event) {
    Alert.alert(
      'Disable SDK',
      'Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK', onPress: () => {
            Braze.disableSDK();
            this._showToast('SDK disabled');
          }
        }
      ]
    );
  }

  _enableSDK(event) {
    Braze.enableSDK();
    this._showToast('SDK enabled');
  }

  // Note that this should normally be called only once
  // location permissions are granted by end user
  _requestLocationInitialization(event) {
    Braze.requestLocationInitialization();
    this._showToast('Init Requested');
  }

  // Note that this should normally be called only once per session
  // Demo location is Baltimore
  _requestGeofences(event) {
    Braze.requestGeofences(39.29, -76.61);
    this._showToast('Geofences Requested');
  }

  _setLocationCustomAttribute(event) {
    Braze.setLocationCustomAttribute("work", 40.7128, 74.0060);
    this._showToast('Location Set');
  }

  _requestContentCardsRefresh(event) {
    Braze.requestContentCardsRefresh();
    this._showToast('Content Cards Refreshed');
  }

  _hideCurrentInAppMessage(event) {
    Braze.hideCurrentInAppMessage();
    this._showToast('Message dismissed');
  }

  _setAttributionData(event) {
    var network = "fakeblock";
    var campaign = "everyone";
    var adGroup = "adgroup1";
    var creative = "bigBanner";
    Braze.setAttributionData(network, campaign, adGroup, creative);
    this._showToast('Attribution Data Set');
  }

  _getInstallTrackingId(event) {
    Braze.getInstallTrackingId((err, res) => {
      if (err) {
        console.log('Error is ' + err);
      } else {
        this._showToast('Install tracking ID: ' + res);
      }
    });
  }

  _getContentCards(event) {
    Braze.getContentCards().then(function(result) {
      if (result === undefined || result.length == 0) {
        console.log('No cached Content Cards Found.');
      } else {
        console.log(result.length + ' cached Content Cards Found.');
        for (var i = 0; i < result.length; i++) {
          var cardId = result[i].id;
          console.log('Got content card: ' + JSON.stringify(result[i]));
          Braze.logContentCardClicked(cardId);
          Braze.logContentCardImpression(cardId);
          // Braze.logContentCardDismissed(cardId);
        }
      }
    }).catch(function () {
      console.log("Content Cards Promise Rejected");
    });
  }

  _requestPushPermission(event) {
    const options = {
      "alert": true,
      "badge": true,
      "sound": true,
      "provisional": false
    };

    Braze.requestPushPermission(options);
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingTop: 100,
    paddingBottom: 100
  },
  textInput: {
    height: 40,
    width: 150,
    borderColor: 'gray',
    borderWidth: .5,
    paddingLeft: 5,
    marginLeft: 5,
    fontSize: 14
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  picker: {
    width: 200
  },
  toastView: {
    display: "flex",
    height: 80,
    backgroundColor: "green",
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    alignItems: "center",
    flexDirection: 'row'
  },
  toastText: {
    marginLeft: 10,
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold'
  }
});

export default AppboyProject;
