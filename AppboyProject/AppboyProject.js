'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Linking,
  Alert
} from 'react-native';

const ReactAppboy = require('react-native-appboy-sdk');

class AppboyProject extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._updateCardCount = this._updateCardCount.bind(this);
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
      <View style={styles.container}>
        <TouchableHighlight
          onPress={this._changeUserPress}>
          <Text>Change User</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._logCustomEventPress}>
          <Text>Log Custom Event</Text>
        </TouchableHighlight>
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
        <TouchableHighlight
          onPress={this._launchNewsFeedPress}>
          <Text>Launch News Feed</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._launchFeedbackPress}>
          <Text>Launch Feedback</Text>
        </TouchableHighlight>
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
        <TouchableHighlight onPress={this._updateCardCount}>
          <Text>Unread Cards (Click to Refresh): {this.state.unreadCardCount} / {this.state.cardCount}</Text>
        </TouchableHighlight>
      </View>
    );
  }
  _changeUserPress(event) {
    ReactAppboy.changeUser('theAppboyTestUser');
  }
  _logCustomEventPress(event) {
    ReactAppboy.logCustomEvent('reactCustomEvent', {'p1': 'p2'});
  }
  _logPurchasePress(event) {
    ReactAppboy.logPurchase('reactProductIdentifier', '1.2', 'USD', 2, {'pp1': 'pp2'});
  }
  _submitFeedbackPress(event) {
    ReactAppboy.submitFeedback('test@test.com', 'great app asdf', true);
  }
  _logCustomAttributePress(event) {
    ReactAppboy.setCustomUserAttribute('sk', 'sv');
    ReactAppboy.setCustomUserAttribute('doubleattr', 4.5);
    ReactAppboy.setCustomUserAttribute('intattr', 88);
    ReactAppboy.setCustomUserAttribute('booleanattr', true);
    ReactAppboy.setCustomUserAttribute('dateattr', new Date());
    ReactAppboy.setCustomUserAttribute('arrayattr', ['a', 'b']);
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
    ReactAppboy.setAvatarImageUrl('https://raw.githubusercontent.com/Appboy/appboy-android-sdk/master/Appboy_Logo_400x100.png');
    ReactAppboy.setEmailNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.UNSUBSCRIBED);
    ReactAppboy.setPushNotificationSubscriptionType(ReactAppboy.NotificationSubscriptionTypes.SUBSCRIBED);
  }
  _launchNewsFeedPress(event) {
    ReactAppboy.launchNewsFeed();
  }
  _launchFeedbackPress(event) {
    ReactAppboy.launchFeedback();
  }
  _unsetCustomUserAttributePress(event) {
    ReactAppboy.unsetCustomUserAttribute('sk');
  }
  _addToCustomAttributeArrayPress(event) {
    ReactAppboy.addToCustomUserAttributeArray('myArray', 'arrayValue1');
    ReactAppboy.addToCustomUserAttributeArray('myArray', 'arrayValue2');
  }
  _removeFromCustomAttributeArrayPress(event) {
    ReactAppboy.removeFromCustomUserAttributeArray('myArray', 'arrayValue1');
  }
  _incrementCustomAttributePress(event) {
    ReactAppboy.incrementCustomUserAttribute('intattr', 5);
  }
  _setTwitterData(event) {
    ReactAppboy.setTwitterData(6253282, 'billmag', 'Bill', 'Adventurer', 700, 200, 1000,
        'https://si0.twimg.com/profile_images/2685532587/fa47382ad67a0135acc62d4c6b49dbdc_bigger.jpeg');
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
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
});

export default AppboyProject;
