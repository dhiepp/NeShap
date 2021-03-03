import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, RefreshControl} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Headline,
  Snackbar,
} from 'react-native-paper';

import UserController from '../controllers/UserController';

export default class ListUserScreen extends Component {
  state = {
    loading: true,
    loading_more: false,
    no_more: false,
    users: [],
    page: 1,
  };
  async componentDidMount() {
    await this.loadUsers(1, false);
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._handleRefresh}
            />
          }>
          {this.state.users.map((user, index) => {
            return (
              <Card
                style={styles.box}
                key={index}
                onPress={() => this._handleViewUser(user.user_id)}>
                <Card.Title
                  title={user.name}
                  subtitle={user.role > 0 ? 'Quản trị viên' : 'Người dùng'}
                  left={(props) => (
                    <Avatar.Image
                      size={props.size}
                      source={{uri: user.avatar}}
                    />
                  )}
                />
              </Card>
            );
          })}
          {this.state.no_more && this.state.page === 1 && (
            <Headline style={styles.title}>Không có người dùng nào</Headline>
          )}
          {!this.state.no_more && (
            <Button
              loading={this.state.loading_more}
              disabled={this.state.no_more}
              style={styles.more}
              onPress={this._handleLoadMore}>
              Xem thêm
            </Button>
          )}
        </ScrollView>
        <Snackbar
          visible={this.state.message}
          onDismiss={() => this.setState({message: false})}
          action={{
            label: 'OK',
            onPress: () => this.setState({message: false}),
          }}>
          {this.state.message}
        </Snackbar>
      </View>
    );
  }
  async loadUsers(page, refresh) {
    const mode = this.props.route.params?.mode;
    let current_users = refresh ? [] : this.state.users;
    let users = await UserController.list(mode, page);
    const no_more = !users.length;
    this.setState({
      loading: false,
      refresh: false,
      users: current_users.concat(users),
      page: page,
      no_more: no_more,
    });
  }
  _handleViewUser = (user_id) => {
    UserController.view(this.props.navigation, user_id);
  };
  _handleRefresh = () => {
    this.setState({refresh: true});
    this.loadUsers(1, true);
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadUsers(page, false).then(() => {
      this.setState({loading_more: false});
    });
  };
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    marginTop: 10,
  },
  box: {
    padding: 10,
    margin: 10,
    marginTop: 0,
  },
  title: {
    textAlign: 'center',
  },
  more: {
    marginBottom: 10,
  },
});
