'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Linking,
  Alert,
  TextInput
} from 'react-native';

const ReactAppboy = require('react-native-appboy-sdk');

class HelloReact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userIdText : 'helloReact',
      customEventText : 'leveled_up'
    };
    this._changeUserPress = this._changeUserPress.bind(this);
    this._logCustomEventPress = this._logCustomEventPress.bind(this);
  }

  render() {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  _changeUserPress(event) {
    ReactAppboy.changeUser(this.state.userIdText);
  }

  _logCustomEventPress(event) {
    ReactAppboy.logCustomEvent(this.state.customEventText, {'p1': 'p2'});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
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
  }
});

export default HelloReact;
