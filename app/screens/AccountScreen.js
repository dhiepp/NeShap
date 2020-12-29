import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Colors, Button, Card} from 'react-native-paper';

import UserController from '../controllers/UserController';
import * as AppData from '../AppData';

export default class AccountScreen extends Component {
  state = {role: 0};
  async componentDidMount() {
    const user_data = await AppData.getUserData();
    this.setState({role: user_data.role, user_id: user_data.user_id});
  }

  render() {
    return (
      <View style={styles.full}>
        <Card style={styles.box}>
          <Button
            icon="account"
            style={styles.child}
            onPress={() =>
              this.props.navigation.navigate('ViewUser', {
                user_id: this.state.user_id,
              })
            }>
            Xem trang cá nhân
          </Button>
          <Button
            icon="account-edit"
            style={styles.child}
            onPress={() => this.props.navigation.navigate('EditUser')}>
            Sửa thông tin cá nhân
          </Button>
          <Button
            icon="plus-circle"
            style={styles.child}
            onPress={() => this.props.navigation.navigate('WritePost')}>
            Đăng bài viết mới
          </Button>
          {this.state.role === '1' && (
            <Button
              color={Colors.redA200}
              icon="briefcase-account"
              style={styles.child}
              onPress={() => this.props.navigation.navigate('ListUser')}>
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
    padding: 10,
    justifyContent: 'center',
  },
  child: {
    margin: 5,
    textAlign: 'center',
  },
});
