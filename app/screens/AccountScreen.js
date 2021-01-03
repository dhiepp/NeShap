import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Colors,
  Button,
  Card,
  Avatar,
  Title,
} from 'react-native-paper';

import UserController from '../controllers/UserController';

export default class AccountScreen extends Component {
  state = {loading: true};
  async componentDidMount() {
    await this.loadUser();
  }

  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <Card style={styles.box}>
          <Avatar.Image
            size={96}
            source={{uri: this.state.user.avatar}}
            style={styles.avatar}
          />
          <Title style={styles.title}>{this.state.user.name}</Title>
          <Button
            mode="contained"
            icon="account"
            style={styles.child}
            onPress={this._handleProfile}>
            Xem trang cá nhân
          </Button>
        </Card>
        <Card style={styles.box}>
          <Button
            icon="account-edit"
            style={styles.child}
            onPress={() =>
              this.props.navigation.navigate('EditUser', {
                user_id: this.state.user.user_id,
              })
            }>
            Sửa thông tin cá nhân
          </Button>
          <Button
            icon="plus-circle"
            style={styles.child}
            onPress={() => this.props.navigation.navigate('WritePost')}>
            Đăng bài viết mới
          </Button>
          <Button
            icon="account-multiple"
            style={styles.child}
            onPress={() =>
              this.props.navigation.navigate('ListUser', {mode: 'friend'})
            }>
            Xem danh sách bạn bè
          </Button>
          {this.state.user.role === 1 && (
            <Button
              color={Colors.redA200}
              icon="briefcase-account"
              style={styles.child}
              onPress={() => this.props.navigation.navigate('ManageUser')}>
              Quản lý người dùng
            </Button>
          )}
          <Button
            icon="exit-to-app"
            style={styles.child}
            onPress={this._handleLogout}>
            Đăng xuất
          </Button>
        </Card>
      </View>
    );
  }

  async loadUser() {
    const user_id = this.props.user_id;
    const user = await UserController.search(user_id);
    if (!user) {
      this._handleLogout();
      return;
    }
    this.setState({loading: false, user: user});
  }
  _handleProfile = () => {
    this.loadUser();
    this.props.navigation.navigate('ViewUser', {
      user_id: this.state.user.user_id,
    });
  };
  _handleLogout = () => {
    UserController.logout(this);
  };
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  box: {
    margin: 20,
    marginTop: 5,
    marginBottom: 5,
    padding: 10,
    justifyContent: 'center',
  },
  child: {
    margin: 5,
    textAlign: 'center',
  },
  avatar: {
    margin: 10,
    alignSelf: 'center',
  },
  title: {
    margin: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
