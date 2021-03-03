import React, {Component} from 'react';
import {StyleSheet, Image, ImageBackground} from 'react-native';
import {Colors, ActivityIndicator} from 'react-native-paper';
import {CommonActions} from '@react-navigation/native';

import * as AppData from '../miscs/AppData';

export default class AccountScreen extends Component {
  state = {loading: false};
  async componentDidMount() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setState({loading: true});

    const check = await AppData.checkUserData();
    const user_data = await AppData.getUserData();
    let targetScreen = 'Login';
    if (check) {
      targetScreen = 'HomeTabs';
    }

    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: targetScreen,
            params: {user_data: user_data},
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
