import React, {Component} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View, RefreshControl, StyleSheet} from 'react-native';
import {Button, withTheme, Card} from 'react-native-paper';

import ListPost from './components/ListPost';
//import UserController from '../controllers/UserController';

class HomeScreen extends Component {
  state = {refresh: false, mode: 'new'};
  scroll;
  render() {
    return (
      <View style={styles.full}>
        <Card elevation={10} style={styles.top}>
          <View style={styles.modes}>
            <Button
              icon="history"
              mode={this.state.mode === 'new' ? 'contained' : 'text'}
              style={styles.child}
              onPress={() => this._onButtonToggle('new')}>
              Mới
            </Button>
            <Button
              icon="fire"
              mode={this.state.mode === 'hot' ? 'contained' : 'text'}
              style={styles.child}
              onPress={() => this._onButtonToggle('hot')}>
              Nóng
            </Button>
            <Button
              icon="account-supervisor"
              mode={this.state.mode === 'sub' ? 'contained' : 'text'}
              style={styles.child}
              onPress={() => this._onButtonToggle('sub')}>
              Theo dõi
            </Button>
          </View>
        </Card>
        <ScrollView
          ref={r => {
            this.scroll = r;
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._handleRefresh}
            />
          }>
          <ListPost
            mode={this.state.mode}
            navigation={this.props.navigation}
            userid="check"
            refresh={this.state.refresh}
            onFinishRefresh={this._finishRefresh}
            style={styles.full}
          />
        </ScrollView>
      </View>
    );
  }

  _handleRefresh = () => {
    this.setState({refresh: true});
  };
  _finishRefresh = () => {
    this.setState({refresh: false});
  };
  _onButtonToggle = value => {
    if (this.state.mode === value) {
      this.scroll.scrollTo({x: 0, y: 0});
    } else {
      this.scroll.scrollTo({x: 0, y: 0});
      this.setState({mode: value, refresh: true});
    }
  };
}

export default withTheme(HomeScreen);

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  top: {
    padding: 10,
  },
  modes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  child: {
    flex: 1,
  },
});
