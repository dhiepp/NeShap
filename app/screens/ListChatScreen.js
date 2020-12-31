import React, {Component} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  TouchableRipple,
  Headline,
  Title,
  Subheading,
} from 'react-native-paper';

import NotificationController from '../controllers/NotificationController';

export default class ListChatScreen extends Component {
  state = {
    loading: true,
    loading_more: false,
    no_more: false,
    notifications: [],
    page: 1,
  };
  async componentDidMount() {
    await this.loadNotifications(1);
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <ScrollView>
          {this.state.notifications.map((notification, index) => {
            return (
              <Card
                style={styles.box}
                key={index} //   onPress={() => this._handleViewUser(user.user_id)}
              >
                <Card.Title
                  title={notification.mention.name}
                  subtitle={notification.time}
                  left={(props) => (
                    <Avatar.Image
                      size={props.size}
                      source={{uri: notification.mention.avatar}}
                    />
                  )}
                  right={() => <Button icon="delete">Xóa</Button>}
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
  async loadNotifications(page) {
    let current_notifications = this.state.notifications;
    let notifications = await NotificationController.list(page);
    const no_more = !notifications.length;
    this.setState({
      notifications: current_notifications.concat(notifications),
      page: page,
      no_more: no_more,
    });
  }
  _handleViewNotification = (user_id) => {
    // UserController.view(this.props.navigation, user_id);
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadNotifications(page).then(() => {
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
  more: {
    marginBottom: 10,
  },
});
