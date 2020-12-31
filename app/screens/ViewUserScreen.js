import React, {Component} from 'react';
import {StyleSheet, RefreshControl, View, ScrollView} from 'react-native';
import {
  ActivityIndicator,
  Headline,
  Avatar,
  Title,
  Button,
  Card,
  Snackbar,
  Subheading,
  Caption,
  Colors,
} from 'react-native-paper';

import UserController from '../controllers/UserController';
import ListPostComponent from './components/ListPostComponent';

export default class ViewUserScreen extends Component {
  state = {
    loading: true,
    valid: true,
    refresh: false,
    message: false,
  };
  async componentDidMount() {
    this.loadUser();
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (!this.state.valid) {
      return <Headline style={styles.title}>Tài khoản không tồn tại</Headline>;
    }
    return (
      <View style={styles.full}>
        <ScrollView
          style={styles.full}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._handleRefresh}
            />
          }>
          <Card style={styles.box}>
            <Avatar.Image
              size={96}
              source={{uri: this.state.user.avatar}}
              style={styles.avatar}
            />
            <Title style={styles.title}>{this.state.user.name}</Title>
            {this.state.status && (
              <Caption style={styles.child}>{this.state.status}</Caption>
            )}
            {(this.state.perm.value === 1 || this.state.perm.value === 3) && (
              <Button
                mode={this.state.f2 ? 'text' : 'contained'}
                icon={this.state.f2 ? 'account-remove' : 'account-plus'}
                style={styles.child}
                onPress={this._handleFriend}>
                {this.state.action}
              </Button>
            )}
            {this.state.perm.value === 3 && (
              <Button
                mode="text"
                icon="briefcase-account"
                color={Colors.redA200}
                style={styles.child}
                onPress={this._handleMange}>
                Quản lý người dùng
              </Button>
            )}
          </Card>
          <Subheading style={styles.title}>Các bài viết</Subheading>
          <ListPostComponent
            mode="profile"
            user_id={this.state.user.user_id}
            navigation={this.props.navigation}
            refresh={this.state.refresh}
            onFinishRefresh={this._finishRefresh}
            style={styles.full}
          />
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
  async loadUser() {
    const user_id = this.props.route.params?.user_id;
    if (!user_id) {
      this.setState({loading: false, valid: false});
      return;
    }
    const data = await UserController.profile(user_id);
    const perm = await UserController.checkPerm(user_id);
    this.setState({
      loading: false,
      refresh: false,
      user: data.user,
      perm: perm,
      f1: data.f1,
      f2: data.f2,
    });
    this.updateFriendship();
  }
  updateFriendship() {
    let status;
    let action;
    if (this.state.f1) {
      if (this.state.f2) {
        action = 'Xóa bạn bè';
      } else {
        status = 'Đã gửi cho bạn lời mời kết bạn';
        action = 'Chấp nhận';
      }
    } else {
      if (this.state.f2) {
        status = 'Đã gửi lời mời kết bạn';
        action = 'Hủy kết bạn';
      } else {
        action = 'Thêm bạn bè';
      }
    }
    this.setState({status: status, action: action});
  }
  _handleRefresh = () => {
    this.setState({refresh: true});
    this.loadUser();
  };
  _finishRefresh = () => {
    this.setState({refresh: false});
  };
  _handleFriend = () => {
    UserController.friend(this).then(() => this.updateFriendship());
  };
  _handleMange = () => {
    this.props.navigation.push('ManageUser', {
      user_id: this.state.user.user_id,
    });
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
