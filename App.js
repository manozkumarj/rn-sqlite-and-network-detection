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
import { SQLite } from "expo-sqlite";

const db = SQLite.openDatabase("db.db");

class Items extends React.Component {
  state = {
    items: null,
    connection_Status : "",
    loading: false
  };

  componentDidMount() {
    // this.update();
    NetInfo.isConnected.addEventListener(
        'connectionChange',
        this._handleConnectivityChange

    );
   
    NetInfo.isConnected.fetch().done((isConnected) => {

      if(isConnected == true)
      {
        this.setState({connection_Status : "Online"})
      }
      else
      {
        this.setState({connection_Status : "Offline"})
      }

    });
  }



  componentWillMount = async () => {
    try {
      const response = await fetch('http://192.168.43.22:8080/getItems')
      const items = await response.json()
      console.log(items);

      this.setState({loading: false, items})
    } catch (e) {
      this.setState({loading: false, error: true})
    }
  }


  componentWillUnmount() {

    NetInfo.isConnected.removeEventListener(
        'connectionChange',
        this._handleConnectivityChange
    );
  }

  _handleConnectivityChange = async (isConnected) => {

    if(isConnected == true)
      {
        this.setState({connection_Status : "Online"})
      }
      else
      {
        this.setState({connection_Status : "Offline"})
      }

      try {
      const response = await fetch('http://192.168.43.22:8080/getItems')
      const items = await response.json()
      console.log(items);

      this.setState({loading: false, items})
    } catch (e) {
      this.setState({loading: false, error: true})
    }
  };



  render() {
    const { done: doneHeading } = this.props;
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
            onPress={() => this.props.onPressItem && this.props.onPressItem(id)}
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
        <Text style={{fontSize: 20, textAlign: 'center', marginBottom: 20}}> You are { this.state.connection_Status } </Text>
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

export default class App extends React.Component {
  state = {
    text: null
  };

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
          <Items
            done={false}
            ref={todo => (this.todo = todo)}
            onPressItem={id =>
              db.transaction(
                tx => {
                  tx.executeSql(`update items set done = 1 where id = ?;`, [
                    id
                  ]);
                },
                null,
                this.update
              )
            }
          />
          <Items
            done={true}
            ref={done => (this.done = done)}
            onPressItem={id =>
              db.transaction(
                tx => {
                  tx.executeSql(`delete from items where id = ?;`, [id]);
                },
                null,
                this.update
              )
            }
          />
        </ScrollView>
      </View>
    );
  }

  add(text) {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }

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
    this.done && this.done.update();
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
