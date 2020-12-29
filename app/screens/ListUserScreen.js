import React, {Component} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Colors,
  TouchableRipple,
  Headline,
  Portal,
  Dialog,
  Paragraph,
  Snackbar,
} from 'react-native-paper';

import UserController from '../controllers/UserController';

export default class ListUserScreen extends Component {
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
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <ScrollView>
          {this.state.users.map((user) => {
            return (
              <Card style={styles.box} key={user.user_id}>
                <TouchableRipple
                  borderles
                  onPress={() => this._handleViewUser(user.user_id)}>
                  <Card.Title
                    title={user.name}
                    subtitle={user.role > 0 ? 'Quản trị viên' : 'Người dùng'}
                    left={(props) => (
                      <Avatar.Image
                        size={props.size}
                        source={{uri: user.avatar}}
                        style={styles.avatar}
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
                </TouchableRipple>
                {/* <List.Item
                  title={user.name}
                  description={user.role > 0 ? 'Quản trị viên' : 'Người dùng'}
                  left={(props) => (
                    <Avatar.Image
                      {...props}
                      size={64}
                      source={{uri: user.avatar}}
                    />
                  )}
                  right={(props) => (
                    <Button
                      {...props}
                      icon="delete"
                      color={Colors.redA200}
                      onPress={() => this._showDialog(user.user_id)}>
                      Xóa
                    </Button>
                  )}
                  onPress={() => this._handleViewUser(user.user_id)}
                /> */}
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
    let current_users = this.state.users;
    let users = await UserController.list(page);
    const no_more = !users.length;
    this.setState({
      users: current_users.concat(users),
      page: page,
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
    this.setState({delete: false});
  };
  _handleDeleteUser = () => {
    UserController.delete(this).then(() => {
      let users = this.state.users;
      users = users.filter((user) => user.user_id !== this.state.delete);
      this.setState({users: users, delete: false});
    });
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadUsers(page).then(() => {
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
