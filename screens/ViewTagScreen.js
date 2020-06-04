import React, {Component} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View, RefreshControl, StyleSheet} from 'react-native';
import {withTheme} from 'react-native-paper';

import ListPost from './components/ListPost';
//import UserController from '../controllers/UserController';

class ViewTagScreen extends Component {
  state = {refresh: false};
  render() {
    this.props.navigation.setOptions({
      title: 'Xem tag: ' + this.props.route.params.tag,
    });
    return (
      <View style={styles.full}>
        <ScrollView
          style={styles.full}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._handleRefresh}
            />
          }>
          <ListPost
            mode="tag"
            page={this.state.page}
            keyword={this.props.route.params.tag}
            navigation={this.props.navigation}
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
}

export default withTheme(ViewTagScreen);

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  top: {
    padding: 10,
  },
  tags: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  child: {
    flex: 1,
  },
});
