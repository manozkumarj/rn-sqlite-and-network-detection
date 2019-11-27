import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  NetInfo
} from "react-native";
import Constants from "expo-constants";
import { SQLite } from "expo-sqlite";
import axios from "axios";

const db = SQLite.openDatabase("db.db");

export default class Items extends Component {
  state = {
    items: null,
    connection_Status: "",
    loading: false
  };

  componentDidMount() {
    this.update();
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this._handleConnectivityChange
    );

    NetInfo.isConnected.fetch().done(isConnected => {
      if (isConnected == true) {
        this.setState({ connection_Status: "Online" });
      } else {
        this.setState({ connection_Status: "Offline" });
      }
    });
  }

  getItems() {
    axios
      .get("http://192.168.43.22:8080/getItems")
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

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this._handleConnectivityChange
    );
  }

  _handleConnectivityChange = isConnected => {
    if (isConnected == true) {
      this.setState({ connection_Status: "Online" });
    } else {
      this.setState({ connection_Status: "Offline" });
    }

    this.getItems();
  };

  render() {
    const { done: doneHeading } = this.props;
    const { items } = this.state;
    const heading = doneHeading ? "Completed" : "Todo";

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
        <Text style={{ fontSize: 20, textAlign: "center", marginBottom: 20 }}>
          You are {this.state.connection_Status}
        </Text>
      </View>
    );
  }

  update() {
    db.transaction(tx => {
      tx.executeSql(
        `select * from items where done = ?;`,
        [this.props.done ? 1 : 0],
        (_, { rows: { _array } }) => this.setState({ items: _array })
      );
    });
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
