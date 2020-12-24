import React, {Component} from 'react';
import {StyleSheet, Image, ImageBackground} from 'react-native';
import {
  Colors,
  Button,
  Card,
  ActivityIndicator,
  Headline,
} from 'react-native-paper';

import UserController from '../controllers/UserController';
import * as AppData from '../AppData';

export default class AccountScreen extends Component {
  state = {loading: true, active: true};
  async componentDidMount() {
    const userdata = await AppData.getUserData();
    console.log(userdata);
    if (userdata.user_id == null) {
      this.setState({isLoggedIn: false});
    } else {
      this.setState({isLoggedIn: true, role: userdata.role});
    }
    this.setState({loading: false});
  }
  render() {
    if (this.route !== undefined) {
      this.setState({isLoggedIn: true, loading: false});
    }
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (this.state.isLoggedIn) {
      return <this.LoggedInView />;
    } else {
      return <this.NotLoggedInView />;
    }
  }

  LoggedInView = () => {
    return (
      <ImageBackground
        source={require('./static/background.png')}
        style={styles.full}>
        <Image source={require('./static/logo.png')} style={styles.logo} />
        <Card style={styles.box}>
          <Button
            icon="account"
            style={styles.child}
            onPress={() => this.props.navigation.navigate('ViewUser')}>
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
      </ImageBackground>
    );
  };
  NotLoggedInView = () => {
    return (
      <ImageBackground
        source={require('./static/background.png')}
        style={styles.full}>
        <Image source={require('./static/logo.png')} style={styles.logo} />
        <Card style={styles.box}>
          <Headline style={styles.title}>Bạn chưa đăng nhập!</Headline>
          <Button
            style={styles.child}
            onPress={() => this.props.navigation.navigate('Login')}>
            Đăng nhập
          </Button>
          <Button
            style={styles.child}
            onPress={() => this.props.navigation.navigate('Register')}>
            Đăng ký
          </Button>
        </Card>
      </ImageBackground>
    );
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
  logo: {
    alignSelf: 'center',
    width: '80%',
    height: '20%',
    resizeMode: 'contain',
  },
  box: {
    margin: 20,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    margin: 10,
    textAlign: 'center',
  },
  child: {
    margin: 5,
    textAlign: 'center',
  },
});
