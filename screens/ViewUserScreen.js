import React, {Component} from 'react';
import {StyleSheet, RefreshControl, View} from 'react-native';
import {
  ActivityIndicator,
  Headline,
  Avatar,
  Colors,
  Title,
  Button,
  Card,
  Snackbar,
  Subheading,
  Caption,
} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';

import UserController from '../controllers/UserController';
import ListPost from './components/ListPost';

export default class EditUserScreen extends Component {
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
            <Title style={styles.title}>{this.state.user.username}</Title>
            <Caption style={styles.child}>
              {this.state.followers.length} người theo dõi
            </Caption>
            {(this.state.perm.value === 1 || this.state.perm.value === 3) && (
              <Button
                mode="contained"
                icon={this.state.followed ? 'account-remove' : 'account-plus'}
                style={styles.child}
                onPress={this._handleFollow}>
                {this.state.followed ? 'Hủy theo dõi' : 'Theo dõi'}
              </Button>
            )}
            {(this.state.perm.value === 2 || this.state.perm.value === 3) && (
              <Button
                color={this.state.perm.value === 3 ? Colors.redA200 : ''}
                icon="account-edit"
                style={styles.child}
                onPress={this._handleEdit}>
                Sửa thông tin
              </Button>
            )}
          </Card>
          <Subheading style={styles.title}>Các bài viết</Subheading>
          <ListPost
            mode="pro"
            userid={this.state.user._id}
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
    let userid = this.props.route.params
      ? this.props.route.params.userid
      : undefined;
    const user = await UserController.get(userid);
    userid = user._id;
    let perm = await UserController.checkPerm(userid);
    const followers = user.followers ? user.followers : [];
    const followed = followers.includes(perm.userid);
    if (userid === perm.userid) {
      perm.value = 2;
    }
    this.setState({
      loading: false,
      refresh: false,
      user: user,
      perm: perm,
      followers: followers,
      followed: followed,
    });
  }
  _handleRefresh = () => {
    this.setState({refresh: true});
    this.loadUser();
  };
  _finishRefresh = () => {
    this.setState({refresh: false});
  };
  _handleFollow = () => {
    UserController.follow(this);
  };
  _handleEdit = () => {
    this.props.navigation.navigate('EditUser', {userid: this.state.user._id});
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
