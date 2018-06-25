'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableHighlight,
  Picker,
  Linking,
  Alert,
  TextInput,
  Platform
} from 'react-native';

const ReactAppboy = require('react-native-appboy-sdk');

class AppboyProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userIdText : 'theAppboyTestUser',
      customEventText : '',
      subscriptionState : 's',
      gender : 'm',
      message: 'Success',
      toastVisible: 0
    };
    this._updateCardCount = this._updateCardCount.bind(this);
    this._changeUserPress = this._changeUserPress.bind(this);
    this._logCustomEventPress = this._logCustomEventPress.bind(this);
    this._setSubscriptionStatePress = this._setSubscriptionStatePress.bind(this);
    this._logPurchasePress = this._logPurchasePress.bind(this);
    this._submitFeedbackPress = this._submitFeedbackPress.bind(this);
    this._logCustomAttributePress = this._logCustomAttributePress.bind(this);
    this._logUserPropertiesPress = this._logUserPropertiesPress.bind(this);
    this._unsetCustomUserAttributePress = this._unsetCustomUserAttributePress.bind(this);
    this._addToCustomAttributeArrayPress = this._addToCustomAttributeArrayPress.bind(this);
    this._removeFromCustomAttributeArrayPress = this._removeFromCustomAttributeArrayPress.bind(this);
    this._incrementCustomAttributePress = this._incrementCustomAttributePress.bind(this);
    this._setTwitterData = this._setTwitterData.bind(this);
    this._setFacebookData = this._setFacebookData.bind(this);
    this._requestFeedRefresh = this._requestFeedRefresh.bind(this);
    this._requestImmediateDataFlush = this._requestImmediateDataFlush.bind(this);
    this._wipeData = this._wipeData.bind(this);
    this._disableSDK = this._disableSDK.bind(this);
    this._enableSDK = this._enableSDK.bind(this);
    this._setGenderPress = this._setGenderPress.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount called');

    // Listen to the `url` event to handle incoming deep links
    Linking.addEventListener('url', this._handleOpenUrl);

    // No `url` event is triggered on application start, so this handles
    // the case where a deep link launches the application
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Linking.getInitialURL is ' + url);
        this._handleOpenUrl({url});
      }
    }).catch(err => console.error('Error getting initial URL', err));

    // Handles deep links when an iOS app is launched from hard close via push click.
    // Note that this isn't handled by Linking.getInitialURL(), as the app is
    // launched not from a deep link, but from clicking on the push notification.
    // For more detail, see `ReactAppboy.getInitialURL` in `index.js`.
    var that = this;
    ReactAppboy.getInitialURL(function(url) {
      if (url) {
        console.log('ReactAppboy.getInitialURL is ' + url);
        that._handleOpenUrl({url});
      }
    });
  }

  componentWillUnmount() {
    // Remove `url` event handler
    Linking.removeEventListener('url', this._handleOpenUrl);
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
    ReactAppboy.getUnreadCardCountForCategories(ReactAppboy.CardCategory.ALL, (err, res) => {
      if (err) {
        console.log('getUnreadCardCountForCategories returned error ' + err);
      } else if (res != null) {
        this.setState({unreadCardCount: res});
      }
    });
    ReactAppboy.getCardCountForCategories(ReactAppboy.CardCategory.ALL, (err, res) => {
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
            onChangeText={(customEventText) => this.setState({customEventText})}/>
          <TouchableHighlight
            onPress={this._logCustomEventPress}>
            <Text>Log Custom Event</Text>
          </TouchableHighlight>
        </View>
        <TouchableHighlight
          onPress={this._logPurchasePress}>
          <Text>Log Purchase</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._submitFeedbackPress}>
          <Text>Submit Feedback</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._logCustomAttributePress}>
          <Text>Set Custom User Attributes</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._logUserPropertiesPress}>
          <Text>Set User Properties</Text>
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
        { Platform.OS === 'ios' ?
        <TouchableHighlight
          onPress={this._launchFeedbackPress}>
          <Text>Launch Feedback</Text>
        </TouchableHighlight>
        : false }
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
          onPress={this._setTwitterData}>
          <Text>Set Twitter Data</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._setFacebookData}>
          <Text>Set Facebook Data</Text>
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
    ReactAppboy.changeUser(this.state.userIdText);
    this._showToast('User changed to: ' + this.state.userIdText);
  }
  _logCustomEventPress(event) {
    ReactAppboy.logCustomEvent(this.state.customEventText, {'p1': 'p2'});
    this._showToast('Event logged: ' + this.state.customEventText);
  }
  _setSubscriptionStatePress(event) {
    console.log('Received request to change subscription state for email and push to ' + this.state.subscriptionState);
    if (this.state.subscriptionState == 'o') {
      ReactAppboy.setEmailNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.OPTED_IN);
      ReactAppboy.setPushNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.OPTED_IN);
      this._showToast('User opted in to Email & Push');
    } else if (this.state.subscriptionState == 'u') {
      ReactAppboy.setEmailNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.UNSUBSCRIBED);
      ReactAppboy.setPushNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.UNSUBSCRIBED);
      this._showToast('User unsubscribed from Email & Push');
    } else if (this.state.subscriptionState == 's') {
      ReactAppboy.setEmailNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.SUBSCRIBED);
      ReactAppboy.setPushNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.SUBSCRIBED);
      this._showToast('User subscribed to Email & Push');
    }
  }
  _setGenderPress(event) {
    console.log('Received request to change gender to ' + this.state.gender);
    if (this.state.gender == 'f') {
      ReactAppboy.setGender(ReactAppboy.Genders.FEMALE)
      this._showToast('User gender set to "female"');
    } else if (this.state.gender == 'm') {
      ReactAppboy.setGender(ReactAppboy.Genders.MALE)
      this._showToast('User gender set to "male"');
    }  else if (this.state.gender == 'n') {
      ReactAppboy.setGender(ReactAppboy.Genders.NOT_APPLICABLE)
      this._showToast('User gender set to "not applicable"');
    } else if (this.state.gender == 'o') {
      ReactAppboy.setGender(ReactAppboy.Genders.OTHER)
      this._showToast('User gender set to "other"');
    } else if (this.state.gender == 'p') {
      ReactAppboy.setGender(ReactAppboy.Genders.PREFER_NOT_TO_SAY)
      this._showToast('User gender set to "prefer not to say"');
    } else if (this.state.gender == 'u') {
      ReactAppboy.setGender(ReactAppboy.Genders.UNKNOWN)
      this._showToast('User gender set to "unknown"');
    }
  }
  _logPurchasePress(event) {
    ReactAppboy.logPurchase('reactProductIdentifier', '1.2', 'USD', 2, {'pp1': 'pp2'});
    this._showToast('Purchase logged');
  }
  _submitFeedbackPress(event) {
    ReactAppboy.submitFeedback('test@test.com', 'great app asdf', true);
    this._showToast('Feedback submitted');
  }
  _logCustomAttributePress(event) {
    ReactAppboy.setCustomUserAttribute('sk', 'sv');
    ReactAppboy.setCustomUserAttribute('doubleattr', 4.5);
    ReactAppboy.setCustomUserAttribute('intattr', 88);
    ReactAppboy.setCustomUserAttribute('booleanattr', true);
    ReactAppboy.setCustomUserAttribute('dateattr', new Date());
    ReactAppboy.setCustomUserAttribute('arrayattr', ['a', 'b']);
    this._showToast('Custom attributes set');
  }
  _logUserPropertiesPress(event) {
    ReactAppboy.setFirstName('Brian');
    ReactAppboy.setLastName('Wheeler');
    ReactAppboy.setEmail('brian+react@appboy.com');
    ReactAppboy.setDateOfBirth(1987, 9, 21);
    ReactAppboy.setCountry('USA');
    ReactAppboy.setHomeCity('New York');
    ReactAppboy.setGender(ReactAppboy.Genders.MALE, (err, res) => {
      if (err) {
        console.log('Example callback error is ' + err);
      } else {
        console.log('Example callback result is ' + res);
      }
    });
    ReactAppboy.setPhoneNumber('9085555555');
    ReactAppboy.setAvatarImageUrl('https://raw.githubusercontent.com/Appboy/appboy-react-sdk/master/braze-logo.png');
    ReactAppboy.setEmailNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.UNSUBSCRIBED);
    ReactAppboy.setPushNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.SUBSCRIBED);
    this._showToast('User properties set');
  }
  _launchNewsFeedPress(event) {
    ReactAppboy.launchNewsFeed();
  }
  _launchFeedbackPress(event) {
    ReactAppboy.launchFeedback();
  }
  _unsetCustomUserAttributePress(event) {
    ReactAppboy.unsetCustomUserAttribute('sk');
    this._showToast('Custom attribute unset');
  }
  _addToCustomAttributeArrayPress(event) {
    ReactAppboy.addToCustomUserAttributeArray('myArray', 'arrayValue1');
    ReactAppboy.addToCustomUserAttributeArray('myArray', 'arrayValue2');
    this._showToast('Added to custom attribute array');
  }
  _removeFromCustomAttributeArrayPress(event) {
    ReactAppboy.removeFromCustomUserAttributeArray('myArray', 'arrayValue1');
    this._showToast('Removed from custom attribute array');
  }
  _incrementCustomAttributePress(event) {
    ReactAppboy.incrementCustomUserAttribute('intattr', 5);
    this._showToast('Attribute incremented');
  }
  _setTwitterData(event) {
    ReactAppboy.setTwitterData(6253282, 'billmag', 'Bill', 'Adventurer', 700, 200, 1000,
        'https://si0.twimg.com/profile_images/2685532587/fa47382ad67a0135acc62d4c6b49dbdc_bigger.jpeg');
    this._showToast('Twitter data set');
  }
  _setFacebookData(event) {
    var profile = {
      id: '708379',
      first_name: 'Bill',
      last_name: 'Mag',
      location: {
        name: 'new york'
      },
      age_range: {
        min: 21, max: 31
      },
      email: 'bill@m.ag',
      bio: 'adventurer',
      gender: 'male',
      birthday: '01/01/2016'
    };
    // May also be a list of strings, e.g. below:
    // var likes = ["Messiaen", "Durufle", "Buxtehude"];
    var likes = [
      {
        'name': 'Hot Rabbit',
        'id': '199600656843963',
        'created_time': '2016-09-25T17:05:01+0000'
      },
      {
        'name': 'This Bridge Called Our Health',
        'id': '543928779075283',
        'created_time': '2016-09-24T20:43:01+0000'
      }
    ];
    ReactAppboy.setFacebookData(profile, 500, likes);
    this._showToast('Facebook data set');
  }

  _requestFeedRefresh(event) {
    ReactAppboy.requestFeedRefresh();
    this._showToast('Feed refreshed');
  }

  _requestImmediateDataFlush(event) {
    ReactAppboy.requestImmediateDataFlush();
    this._showToast('Data flushed');
  }

  _wipeData(event) {
    ReactAppboy.wipeData();
    this._showToast('Data wiped');
  }

  _disableSDK(event) {
    ReactAppboy.disableSDK();
    this._showToast('SDK disabled');
  }

  _enableSDK(event) {
    ReactAppboy.enableSDK();
    this._showToast('SDK enabled');
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
