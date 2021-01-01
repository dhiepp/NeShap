import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, RefreshControl} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Headline,
  Colors,
} from 'react-native-paper';

import ChatController from '../controllers/ChatController';

export default class ListNotificationScreen extends Component {
  state = {
    loading: true,
    refresh: false,
    loading_more: false,
    no_more: false,
    chats: [],
    page: 1,
  };
  async componentDidMount() {
    await this.loadChats(1, false);
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
          {this.state.chats.map((chat, index) => {
            return (
              <Card
                style={styles.box}
                key={index}
                onPress={() => this._handleViewChat(chat.chat_id)}>
                <Card.Title
                  title={chat.who.name}
                  subtitle={chat.last}
                  left={(props) => (
                    <Avatar.Image
                      size={props.size}
                      source={{uri: chat.who.avatar}}
                    />
                  )}
                  right={() =>
                    !chat.read && (
                      <Avatar.Icon
                        size={32}
                        icon="chat-alert"
                        color={Colors.white}
                        style={styles.icon}
                      />
                    )
                  }
                />
              </Card>
            );
          })}
          {this.state.no_more && this.state.page === 1 && (
            <Headline style={styles.title}>Không có tin nhắn nào</Headline>
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
  async loadChats(page, refresh) {
    let current_chats = refresh ? [] : this.state.chats;
    let chats = await ChatController.list(page);
    const no_more = !chats.length;
    this.setState({
      loading: false,
      refresh: false,
      chats: current_chats.concat(chats),
      page: page,
      no_more: no_more,
    });
  }
  _handleRefresh = () => {
    this.setState({refresh: true}, () => {
      this.loadChats(1, true);
      this.props.loadBadges();
    });
  };
  _finishRefresh = () => {
    this.setState({refresh: false});
  };
  _handleViewChat = (chat_id) => {
    ChatController.read(chat_id).then(this._handleRefresh);
    ChatController.view(this.props.navigation, chat_id);
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadChats(page, false).then(() => {
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
