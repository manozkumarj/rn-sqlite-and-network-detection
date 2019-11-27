import React, { Component } from "react";
import { Text, View } from "react-native";

export default class Untracked extends Component {
  render() {
    return (
      <View>
        <Text> {this.props.data} </Text>
      </View>
    );
  }
}
