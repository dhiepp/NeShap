import React, {Component} from 'react';
import {StyleSheet, Keyboard, View} from 'react-native';
import {
  ActivityIndicator,
  TextInput,
  Avatar,
  Title,
  Button,
  Divider,
  Card,
  Snackbar,
} from 'react-native-paper';
import ImagePicker from 'react-native-image-picker';
import {ScrollView} from 'react-native-gesture-handler';

import UserController from '../controllers/UserController';

export default class EditUserScreen extends Component {
  state = {
    loading: true,
    message: false,
    newAvatar: false,
    newUsername: '',
    newPassword: '',
  };
  async componentDidMount() {
    const userid = this.props.route.params
      ? this.props.route.params.userid
      : undefined;
    const user = await UserController.get(userid);
    this.setState({loading: false, user: user});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.full}>
          <Card style={styles.box} onPress={() => Keyboard.dismiss()}>
            <Title style={styles.title}>Ảnh đại diện</Title>
            <Avatar.Image
              size={96}
              source={{
                uri: this.state.newAvatar
                  ? this.state.newAvatar.uri
                  : this.state.user.avatar,
              }}
              style={styles.avatar}
            />
            <Button
              mode="contained"
              icon="account-box"
              style={styles.child}
              onPress={this._handleImagePicker}>
              Chọn ảnh mới
            </Button>
            <Divider style={styles.child} />
            <Title style={styles.title}>Thông tin đăng nhập</Title>
            <TextInput
              label="Tên đăng nhập"
              mode="outlined"
              maxLength={20}
              defaultValue={this.state.user.username}
              style={styles.child}
              onChangeText={text => this.setState({newUsername: text})}
            />
            <TextInput
              label="Mật khẩu"
              mode="outlined"
              secureTextEntry={true}
              style={styles.child}
              onChangeText={text => this.setState({newPassword: text})}
            />
            <Button
              mode="contained"
              icon="account-check"
              style={styles.child}
              onPress={this._handleSubmit}>
              Lưu
            </Button>
          </Card>
        </ScrollView>
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

  _handleImagePicker = () => {
    ImagePicker.showImagePicker(response => {
      if (response.didCancel === undefined) {
        this.setState({newAvatar: response});
      }
    });
  };
  _handleSubmit = () => {
    UserController.edit(this);
  };
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  box: {
    padding: 10,
    margin: 10,
  },
  title: {
    flex: 1,
    margin: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  child: {
    margin: 5,
    textAlign: 'center',
  },
  avatar: {
    margin: 10,
    alignSelf: 'center',
  },
});
