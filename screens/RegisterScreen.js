import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput, Button, HelperText, Headline} from 'react-native-paper';

import UserController from '../controllers/UserController';

export default class RegisterScreen extends Component {
  state = {username: '', password: '', message: false};
  render() {
    return (
      <View style={styles.main}>
        <Headline style={styles.title}>Đăng ký</Headline>
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
          onChangeText={text => this.setState({username: text})}
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
          onPress={this._handleRegister}>
          Đăng ký
        </Button>
        <Button
          mode="text"
          style={styles.child}
          onPress={() => this.props.navigation.navigate('Login')}>
          Đăng nhập
        </Button>
      </View>
    );
  }

  _handleRegister = () => {
    UserController.register(this);
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
