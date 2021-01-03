import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {
  ActivityIndicator,
  Card,
  Paragraph,
  Avatar,
  TextInput,
  Subheading,
  IconButton,
  TouchableRipple,
  Button,
  Colors,
  withTheme,
  Headline,
  Caption,
  Snackbar,
} from 'react-native-paper';
import ChatController from '../controllers/ChatController';
import MessageController from '../controllers/MessageController';
import UserController from '../controllers/UserController';
import ChatClient from '../miscs/ChatClient';

class ViewChatScreen extends Component {
  state = {
    error: false,
    error_message: false,
    valid: true,
    loading: true,
    loading_more: false,
    messages: [],
    new_message: '',
  };
  async componentDidMount() {
    const chat = await ChatController.detail(this.props.route.params?.chat_id);
    if (!chat) {
      this.setState({loading: false, valid: false});
      return;
    }

    this.props.navigation.setOptions({title: chat.who.name});
    this.setState({chat: chat});

    await this.loadMessages(1);
    await this.connectRoom(chat.chat_id);
  }
  componentWillUnmount() {
    if (this.state.chat) {
      ChatClient.leaveRoom(this.state.chat.chat_id);
    }
    this.socket?.off('join-result', this._onJoinResult);
    this.socket?.off('send-result', this._onSendResult);
    this.socket?.off('receive-message', this._handleUpdate);
    this.socket?.off('disconnect', this._onDisconnect);
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (!this.state.valid) {
      return <Headline style={styles.title}>Đoạn chat không tồn tại</Headline>;
    }
    return (
      <View style={styles.full}>
        {this.state.error && (
          <Button color={Colors.redA400}>{this.state.error}</Button>
        )}
        <FlatList
          inverted
          data={this.state.messages}
          renderItem={({item, index}) => (
            <View style={styles.message_area} key={index}>
              {item.author.user_id !== this.state.chat.user_id && (
                <View style={styles.author_box}>
                  <Avatar.Image size={32} source={{uri: item.author.avatar}} />
                </View>
              )}
              <TouchableRipple
                borderless
                onPress={() => this._handleViewUser(item.author.user_id)}
                style={styles.message_box}>
                <View>
                  <View style={styles.info_box}>
                    <Subheading style={styles.message_username}>
                      {item.author.name}
                    </Subheading>
                    <Caption>{item.time}</Caption>
                  </View>
                  <Paragraph style={styles.message_content}>
                    {item.content}
                  </Paragraph>
                </View>
              </TouchableRipple>
              {item.author.user_id === this.state.chat.user_id && (
                <View style={styles.author_box}>
                  <Avatar.Image size={32} source={{uri: item.author.avatar}} />
                </View>
              )}
            </View>
          )}
          ListFooterComponent={
            <ActivityIndicator
              animating={this.state.loading_more}
              size="small"
            />
          }
          ListFooterComponentStyle={styles.more}
          onEndReached={this._handleLoadMore}
          onEndReachedThreshold={0.1}
          keyExtractor={(item, index) => index.toString()}
        />
        <Card style={styles.box}>
          <View style={styles.new_message_box}>
            <TextInput
              dense
              multiline
              maxLength={500}
              label="Gửi tin nhắn"
              mode="outlined"
              value={this.state.new_message}
              style={styles.new_message_input}
              onChangeText={(text) => this._handleMessageInput(text)}
            />
            <IconButton
              icon="send"
              color={this.props.theme.colors.primary}
              style={styles.new_message_button}
              onPress={this._handleSendMessage}
            />
          </View>
        </Card>
        <Snackbar
          visible={this.state.error_message}
          onDismiss={() => this.setState({error_message: false})}
          action={{
            label: 'OK',
            onPress: () => this.setState({error_message: false}),
          }}>
          {this.state.error_message}
        </Snackbar>
      </View>
    );
  }
  async connectRoom(chat_id) {
    this.socket = await ChatClient.joinRoom(chat_id);
    this.socket.on('join-result', this._onJoinResult);
    this.socket.on('send-result', this._onSendResult);
    this.socket.on('receive-message', this._handleUpdate);
    this.socket.on('disconnect', this._onDisconnect);
  }
  async loadMessages(page) {
    let current_messages = this.state.messages;
    let load_messages = await MessageController.list(
      this.state.chat.chat_id,
      page,
    );

    this.setState({
      loading: false,
      loading_more: false,
      messages: current_messages.concat(load_messages),
      page: page,
    });
  }
  _onDisconnect = () => {
    this.setState({error: 'Đã mất kết nối.'});
  };
  _onJoinResult = (data) => {
    if (!data.status) {
      this.setState({error: data.message});
      return;
    }
  };
  _onSendResult = (data) => {
    if (!data.status) {
      this.setState({error_message: data.message});
      return;
    }
    this._handleUpdate(data.sent_message);
  };
  _handleUpdate = (message) => {
    let messages = this.state.messages;
    messages.unshift(MessageController.update(message));
    this.setState({messages: messages});
  };
  _handleLoadMore = () => {
    this.setState({loading_more: true});
    const page = this.state.page + 1;
    this.loadMessages(page);
  };
  _handleMessageInput = (text) => {
    this.setState({new_message: text});
  };
  _handleSendMessage = () => {
    ChatClient.send(this.state.chat.chat_id, this.state.new_message);
    this.setState({new_message: ''});
  };
  _handleViewUser = (user_id) => {
    if (user_id === undefined) {
      return;
    }
    UserController.view(this.props.navigation, user_id);
  };
}

export default withTheme(ViewChatScreen);

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  box: {
    padding: 5,
  },
  title: {
    margin: 10,
    textAlign: 'center',
  },
  new_message_box: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  new_message_input: {
    flex: 9,
    margin: 5,
  },
  new_message_button: {
    flex: 1,
    margin: 5,
  },
  message_area: {
    flexDirection: 'row',
    margin: 5,
  },
  author_box: {
    flex: 1,
    padding: 5,
  },
  message_box: {
    flex: 9,
    borderRadius: 10,
    padding: 10,
    backgroundColor: Colors.white,
  },
  info_box: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  message_username: {
    fontWeight: 'bold',
  },
  message_content: {
    margin: 10,
  },
  more: {
    margin: 10,
  },
});
