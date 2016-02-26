'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

var Button = require('react-native-button');

const ReactAppboy = require('react-native-appboy-sdk');

class AppboyProject extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={this._changeUserPress}>
          Change User
        </Button>
        <Button
          onPress={this._logCustomEventPress}>
          Log Custom Event
        </Button>
        <Button
          onPress={this._logPurchasePress}>
          Log Purchase
        </Button>
        <Button
          onPress={this._submitFeedbackPress}>
          Submit Feedback
        </Button>
        <Button
          onPress={this._logCustomAttributePress}>
          Set Custom User Attributes
        </Button>
        <Button
          onPress={this._logUserPropertiesPress}>
          Set User Properties
        </Button>
        <Button
          onPress={this._launchNewsFeedPress}>
          Launch News Feed
        </Button>
        <Button
          onPress={this._launchFeedbackPress}>
          Launch Feedback
        </Button>
        <Button
          onPress={this._unsetCustomUserAttributePress}>
          Unset Custom User Attributes
        </Button>
        <Button
          onPress={this._addToCustomAttributeArrayPress}>
          Add to custom attribute array
        </Button>
        <Button
          onPress={this._removeFromCustomAttributeArrayPress}>
          Remove From Custom Attribute Array
        </Button>
      </View>
    );
  }
  _changeUserPress(event) {
    ReactAppboy.changeUser("theAppboyTestUser");
  }
  _logCustomEventPress(event) {
    ReactAppboy.logCustomEvent("reactCustomEvent", {"p1" : "p2"});
  }
  _logPurchasePress(event) {
    ReactAppboy.logPurchase("reactProductIdentifier", "1.2", "USD",  2, {"pp1" : "pp2"});
  }
  _submitFeedbackPress(event) {
    ReactAppboy.submitFeedback("test@test.com", "great app asdf", true);
  }
  _logCustomAttributePress(event) {
    ReactAppboy.setCustomUserAttribute("sk", "sv");
    ReactAppboy.setCustomUserAttribute("doubleattr", 4.5);
    ReactAppboy.setCustomUserAttribute("intattr", 88);
    ReactAppboy.setCustomUserAttribute("booleanattr", true);
    ReactAppboy.setCustomUserAttribute("dateattr", new Date());
    ReactAppboy.setCustomUserAttribute("arrayattr", ["a", "b"]);
  }
  _logUserPropertiesPress(event) {
    ReactAppboy.setFirstName("Brian");
    ReactAppboy.setLastName("Wheeler");
    ReactAppboy.setEmail("brian+react@appboy.com");
    ReactAppboy.setDateOfBirth(1987, 9, 21);
    ReactAppboy.setCountry("USA");
    ReactAppboy.setHomeCity("New York");
    ReactAppboy.setGender(ReactAppboy.Genders.MALE);
    ReactAppboy.setPhoneNumber("9085555555");
    ReactAppboy.setAvatarImageUrl("https://raw.githubusercontent.com/Appboy/appboy-android-sdk/master/Appboy_Logo_400x100.png");
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
    ReactAppboy.unsetCustomUserAttribute("sk");
  }
  _addToCustomAttributeArrayPress(event) {
    ReactAppboy.addToCustomUserAttributeArray("myArray", "arrayValue1");
    ReactAppboy.addToCustomUserAttributeArray("myArray", "arrayValue2");
  }
  _removeFromCustomAttributeArrayPress(event) {
    ReactAppboy.removeFromCustomUserAttributeArray("myArray", "arrayValue1");
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default AppboyProject;