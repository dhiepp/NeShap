import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, RefreshControl} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Colors,
  Headline,
  Portal,
  Dialog,
  Text,
  Snackbar,
  Checkbox,
  Subheading,
} from 'react-native-paper';

import UserController from '../controllers/UserController';

export default class ManageUserScreen extends Component {
  state = {
    loading: true,
    loading_more: false,
    no_more: false,
    delete: false,
    message: false,
    users: [],
    page: 1,
  };
  async componentDidMount() {
    await this.loadUsers(1);
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
                  right={() => (
                    <Button
                      icon="delete"
                      color={Colors.redA200}
                      onPress={() => this._showDialog(user.user_id)}>
                      Xóa
                    </Button>
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
        <Portal>
          <Dialog visible={this.state.delete} onDismiss={this._hideDialog}>
            <Dialog.Title>Tài khoản</Dialog.Title>
            <Dialog.Content>
              <Subheading>Bạn có muốn xóa tài khoản này?</Subheading>
              <View style={styles.inline}>
                <Checkbox
                  status={this.state.hard ? 'checked' : 'unchecked'}
                  onPress={() => this.setState({hard: !this.state.hard})}
                />
                <Text onPress={() => this.setState({hard: !this.state.hard})}>
                  Xóa tất cả bài viết và bình luận
                </Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this._handleDeleteUser}>Có</Button>
              <Button onPress={this._hideDialog}>Không</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    if (!refresh) {
      const user_id = this.props.route.params?.user_id;
      if (user_id) {
        let user = await UserController.search(user_id);
        this.setState({
          loading: false,
          users: [user],
          page: 0,
          no_more: true,
        });
        return;
      }
    }

    let current_users = refresh ? [] : this.state.users;
    let users = await UserController.list('all', page);
    const no_more = !users.length;
    this.setState({
      users: current_users.concat(users),
      page: page,
      refresh: false,
      no_more: no_more,
    });
  }
  _handleViewUser = (user_id) => {
    UserController.view(this.props.navigation, user_id);
  };
  _showDialog = (user_id) => {
    this.setState({delete: user_id});
  };
  _hideDialog = () => {
    this.setState({delete: false, hard: false});
  };
  _handleDeleteUser = () => {
    UserController.delete(this).then(() => {
      let users = this.state.users;
      users = users.filter((user) => user.user_id !== this.state.delete);
      this.setState({users: users, delete: false, hard: false});
    });
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
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
