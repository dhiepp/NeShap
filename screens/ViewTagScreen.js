import React, {Component} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View, RefreshControl, StyleSheet} from 'react-native';
import {Card, Chip, withTheme, Title} from 'react-native-paper';

import ListPost from './components/ListPost';
//import UserController from '../controllers/UserController';

class HomeScreen extends Component {
  state = {refresh: false};
  render() {
    return (
      <View style={styles.full}>
        <Card elevation={10} style={styles.top}>
          <View style={styles.tags}>
            <Title>Bài viết gắn Tag: </Title>
            <Chip icon="tag">{this.props.route.params.tag}</Chip>
          </View>
        </Card>
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

export default withTheme(HomeScreen);

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
