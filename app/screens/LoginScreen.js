import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput, Button, HelperText, Headline} from 'react-native-paper';

import UserController from '../controllers/UserController';

export default class LoginScreen extends Component {
  state = {name: '', password: '', message: false};
  render() {
    return (
      <View style={styles.main}>
        <Headline style={styles.title}>Đăng nhập</Headline>
        <HelperText
          type="error"
          visible={this.state.message}
          style={styles.child}>
          {this.state.message}
        </HelperText>
        <TextInput
          label="Tên tài khoản"
          mode="outlined"
          autoCapitalize="none"
          maxLength={20}
          style={styles.child}
          onChangeText={text => this.setState({name: text})}
        />
        <TextInput
          label="Mật khẩu"
          mode="outlined"
          secureTextEntry={true}
          numberOfLines={1}
          style={styles.child}
          onChangeText={text => this.setState({password: text})}
        />
        <Button
          mode="contained"
          style={styles.child}
          onPress={this._handleLogin}>
          Đăng nhập
        </Button>
        <Button
          mode="text"
          style={styles.child}
          onPress={() => this.props.navigation.navigate('Register')}>
          Đăng ký
        </Button>
      </View>
    );
  }

  _handleLogin = () => {
    UserController.login(this);
  };
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
  },
  child: {
    margin: 5,
    textAlign: 'center',
  },
});
