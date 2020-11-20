import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Colors,
  List,
  Headline,
  Portal,
  Dialog,
  Paragraph,
  Snackbar,
} from 'react-native-paper';

import UserController from '../controllers/UserController';
import {ScrollView} from 'react-native-gesture-handler';

export default class ListUserScreen extends Component {
  state = {
    loading: true,
    loadingmore: false,
    nomore: false,
    delete: false,
    message: false,
    users: [],
    page: 1,
  };
  async componentDidMount() {
    await this.loadUsers(1);
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <ScrollView>
          <Card style={styles.box}>
            {this.state.users.map(user => {
              return (
                <List.Item
                  key={user._id}
                  title={user.username}
                  description={`${
                    user.followers ? user.followers.length : 0
                  } người theo dõi`}
                  left={props => (
                    <Avatar.Image
                      {...props}
                      size={64}
                      source={{uri: user.avatar}}
                    />
                  )}
                  right={props => (
                    <Button
                      {...props}
                      icon="delete"
                      color={Colors.redA200}
                      onPress={() => this._showDialog(user._id)}>
                      Xóa
                    </Button>
                  )}
                  onPress={() => this._handleViewUser(user._id)}
                />
              );
            })}
            {this.state.nomore && this.state.page === 1 && (
              <Headline style={styles.title}>Không có người dùng nào</Headline>
            )}
            {!this.state.nomore && (
              <Button
                loading={this.state.loadingmore}
                disabled={this.state.nomore}
                style={styles.more}
                onPress={this._handleLoadMore}>
                Xem thêm
              </Button>
            )}
          </Card>
        </ScrollView>
        <Portal>
          <Dialog visible={this.state.delete} onDismiss={this._hideDialog}>
            <Dialog.Title>Tài khoản</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Bạn có muốn xóa tài khoản này?</Paragraph>
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
  async loadUsers(page) {
    let oldUsers = this.state.users;
    let users = await UserController.list(page);
    users = await Promise.all(
      users.map(async user => await UserController.get(user._id)),
    );
    const nomore = !users.length;
    this.setState({users: oldUsers.concat(users), page: page, nomore: nomore});
  }
  _handleViewUser = userid => {
    UserController.view(this.props.navigation, userid);
  };
  _showDialog = userid => {
    this.setState({delete: userid});
  };
  _hideDialog = () => {
    this.setState({delete: false});
  };
  _handleDeleteUser = () => {
    UserController.delete(this).then(() => {
      let users = this.state.users;
      users = users.filter(user => user._id !== this.state.delete);
      this.setState({users: users, delete: false});
    });
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loadingmore: true});
    this.loadUsers(page).then(() => {
      this.setState({loadingmore: false});
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
  },
  title: {
    textAlign: 'center',
  },
  more: {
    marginBottom: 10,
  },
});
