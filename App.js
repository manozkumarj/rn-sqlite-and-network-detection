import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  NetInfo
} from "react-native";
import Constants from "expo-constants";
import Items from "./Items";
import { SQLite } from "expo-sqlite";
import axios from "axios";

const db = SQLite.openDatabase("db.db");

export default class App extends React.Component {
  state = {
    text: null
  };

  componentDidMount() {
    // this.update();
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

  _handleConnectivityChange = isConnected => {
    if (isConnected == true) {
      this.setState({ connection_Status: "Online" });
    } else {
      this.setState({ connection_Status: "Offline" });
    }

    this.getItems();
  };

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

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this._handleConnectivityChange
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>SQLite Example</Text>
        <View style={styles.flexRow}>
          <TextInput
            onChangeText={text => this.setState({ text })}
            onSubmitEditing={() => {
              this.add(this.state.text);
              this.setState({ text: null });
            }}
            placeholder="what do you need to do?"
            style={styles.input}
            value={this.state.text}
          />
        </View>
        <ScrollView style={styles.listArea}>
          <Items done={false} ref={todo => (this.todo = todo)} />
        </ScrollView>
        <Text style={{ fontSize: 20, textAlign: "center", marginBottom: 20 }}>
          You are {this.state.connection_Status}
        </Text>
      </View>
    );
  }

  add(text) {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }

    axios
      .post("http://192.168.43.22:8080/insertItem", {
        value: text,
        done: 0
      })
      .then(function(response) {
        console.log("Insertion done");
        const items = response["data"];
        console.log(items);
      })
      .catch(function(error) {
        console.log(error);
      });

    db.transaction(
      tx => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      this.update
    );
  }

  update = () => {
    this.todo && this.todo.update();
  };
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
