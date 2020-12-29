import React, {Component} from 'react';
import {View, RefreshControl, StyleSheet, ScrollView} from 'react-native';
import {withTheme, Card, Chip} from 'react-native-paper';

import ListPostComponent from './components/ListPostComponent';

class ViewTagScreen extends Component {
  state = {refresh: false, tag: this.props.route.params?.tag};
  render() {
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
          <Card style={styles.box}>
            <Chip icon="tag" style={styles.tag}>
              {this.state.tag}
            </Chip>
          </Card>
          <ListPostComponent
            mode="tag"
            page={this.state.page}
            keyword={this.state.tag}
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
  box: {
    padding: 10,
    margin: 10,
    marginBottom: 0,
  },
  tag: {
    alignSelf: 'center',
  },
});
