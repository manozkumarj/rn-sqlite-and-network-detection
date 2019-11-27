import React, { Component } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import Constants from "expo-constants";
import { SQLite } from "expo-sqlite";
import axios from "axios";

const db = SQLite.openDatabase("db.db");

export default class Items extends Component {
  state = {
    items: null,
    loading: false,
    serverIp: "http://192.168.1.100:8080"
  };

  componentDidMount() {
    // this.update();
    this.getItems();
  }

  getItems() {
    axios
      .get(this.state.serverIp + "/getItems")
      .then(response => {
        console.log("Fetching done");
        const items = response["data"];
        console.log(items);
        this.setState({ loading: false, items });
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  componentWillMount = () => {
    this.getItems();
  };

  render() {
    const { items } = this.state;
    const heading = "Todo";

    if (items === null || items.length === 0) {
      return null;
    }

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>{heading}</Text>
        {items.map(({ id, done, value }) => (
          <TouchableOpacity
            key={id}
            style={{
              backgroundColor: done ? "#1c9963" : "#fff",
              borderColor: "#000",
              borderWidth: 1,
              padding: 8
            }}
          >
            <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
  flexRow: {
    flexDirection: "row"
  },
  input: {
    borderColor: "#4630eb",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8
  }
});
