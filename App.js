import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  NetInfo
} from "react-native";
import Constants from "expo-constants";
import Items from "./Items";
import { SQLite } from "expo-sqlite";
import axios from "axios";
import Untracked from "./Untracked";

const db = SQLite.openDatabase("db.db");

export default class App extends React.Component {
  state = {
    items: null,
    text: null,
    connection_Status: "",
    localData: [],
    serverIp: "http://192.168.1.100:8080",
    unTracked: [1, 2, 3]
  };

  componentDidMount() {
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

    let getLocalItems = this.state.localData;
    if (getLocalItems && getLocalItems.length > 0) {
      this.insertion(getLocalItems);
    }

    this.getItems();
  };

  getItems = () => {
    axios
      .get(this.state.serverIp + "/getItems")
      .then(response => {
        console.log("Fetching done");
        const items = response["data"];
        this.todo = items;
        console.log(items);
        this.setState({ loading: false, items });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this._handleConnectivityChange
    );
  }

  insertion = data => {
    axios
      .post(this.state.serverIp + "/insertItem", {
        value: data
      })
      .then(response => {
        console.log("Insertion done");
        const items = response["data"];
        console.log(items);
        let setEmpty = [];
        this.setState({ localData: setEmpty });
        console.log(this.state.localData.length);
        this.getItems();
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  renderTodos = () => {
    const heading = "Todo";

    if (this.state.items.length === 0) {
      return;
    }

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>{heading}</Text>
        {this.state.items.map(({ id, done, value }) => (
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
  };

  renderUntracked = () => {
    if (this.state.localData.length === 0) {
      return;
    }

    return (
      <ScrollView style={styles.listArea}>
        <Text style={styles.sectionHeading}>Untracked Todos</Text>
        {this.state.localData.map(value => (
          <Untracked key={value} data={value} />
        ))}
      </ScrollView>
    );
  };

  render() {
    const { items } = this.state;

    if (items === null || items.length === 0) {
      return null;
    }

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
        <ScrollView style={styles.listArea}>{this.renderTodos()}</ScrollView>

        {this.renderUntracked()}

        <Text style={{ fontSize: 20, textAlign: "center", marginBottom: 20 }}>
          You are {this.state.connection_Status} - {this.state.localData.length}
        </Text>
      </View>
    );
  }

  add = text => {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }

    let networkStatus = this.state.connection_Status;

    let getLocalItems = this.state.localData;
    getLocalItems.push(text);
    this.setState({ localData: getLocalItems });

    if (networkStatus.toLocaleLowerCase() === "online") {
      this.insertion(text);
    }

    db.transaction(
      tx => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null
      // this.update
    );
  };

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
