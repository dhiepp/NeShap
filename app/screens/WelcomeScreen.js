import React, {Component} from 'react';
import {StyleSheet, Image, ImageBackground} from 'react-native';
import {
  Colors,
  Button,
  Card,
  ActivityIndicator,
  Headline,
} from 'react-native-paper';
import {CommonActions} from '@react-navigation/native';

import UserController from '../controllers/UserController';
import * as AppData from '../AppData';

export default class AccountScreen extends Component {
  state = {loading: false};
  async componentDidMount() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setState({loading: true});
    const loggedIn = await AppData.checkUserData();
    const targetScreen = loggedIn ? 'HomeTabs' : 'Login';
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: targetScreen,
          },
        ],
      }),
    );
  }
  render() {
    return (
      <ImageBackground
        source={require('./static/background.png')}
        style={styles.full}>
        <Image source={require('./static/logo.png')} style={styles.logo} />
        <ActivityIndicator
          size="large"
          animating={this.state.loading}
          color={Colors.white}
        />
      </ImageBackground>
    );
  }
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
