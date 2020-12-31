import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, RefreshControl} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Headline,
  Subheading,
  Colors,
} from 'react-native-paper';

import NotificationController from '../controllers/NotificationController';
import PostController from '../controllers/PostController';
import UserController from '../controllers/UserController';

export default class ListNotificationScreen extends Component {
  state = {
    loading: true,
    refresh: false,
    loading_more: false,
    no_more: false,
    notifications: [],
    page: 1,
  };
  async componentDidMount() {
    await this.loadNotifications(1, false);
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._handleRefresh}
            />
          }>
          {this.state.notifications.map((notification, index) => {
            return (
              <Card
                style={styles.box}
                key={index}
                onPress={() => this._handleViewNotification(notification)}>
                <Card.Title
                  title={notification.mention.name}
                  subtitle={notification.time}
                  left={(props) => (
                    <Avatar.Image
                      size={props.size}
                      source={{uri: notification.mention.avatar}}
                    />
                  )}
                  right={() => (
                    <Avatar.Icon
                      size={32}
                      icon={notification.icon}
                      color={Colors.white}
                      style={
                        notification.read ? styles.icon : styles.icon_unread
                      }
                    />
                  )}
                />
                <Card.Content>
                  <Subheading>{notification.content}</Subheading>
                </Card.Content>
              </Card>
            );
          })}
          {this.state.no_more && this.state.page === 1 && (
            <Headline style={styles.title}>Không có thông báo nào</Headline>
          )}
          {!this.state.no_more && (
            <Button
              loading={this.state.loading_more}
              disabled={this.state.no_more}
              style={styles.more}
              onPress={this._handleLoadMore}>
              Xem thêm
            </Button>
          )}
        </ScrollView>
      </View>
    );
  }
  async loadNotifications(page, refresh) {
    let current_notifications = refresh ? [] : this.state.notifications;
    let notifications = await NotificationController.list(page);
    const no_more = !notifications.length;
    this.setState({
      refresh: false,
      notifications: current_notifications.concat(notifications),
      page: page,
      no_more: no_more,
    });
  }
  _handleRefresh = () => {
    this.setState({refresh: true}, () => {
      this.loadNotifications(1, true);
      this.props.loadBadges();
    });
  };
  _finishRefresh = () => {
    this.setState({refresh: false});
  };
  _handleViewNotification = (notification) => {
    NotificationController.read(notification.notification_id).then(
      this._handleRefresh,
    );
    if (notification.link) {
      PostController.view(this.props.navigation, notification.link);
    } else {
      UserController.view(this.props.navigation, notification.mention.user_id);
    }
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadNotifications(page, false).then(() => {
      this.setState({loading_more: false});
    });
  };
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    marginTop: 10,
  },
  box: {
    padding: 10,
    margin: 10,
    marginTop: 0,
  },
  icon: {
    marginRight: 20,
  },
  icon_unread: {
    marginRight: 20,
    backgroundColor: Colors.redA200,
  },
  title: {
    textAlign: 'center',
  },
  more: {
    marginBottom: 10,
  },
});
