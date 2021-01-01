import React, {Component} from 'react';
import {StyleSheet, View, Keyboard, ScrollView} from 'react-native';
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

class ViewChatScreen extends Component {
  state = {
    messages: [],
    valid: true,
    loading: true,
    loading_more: false,
    no_more: false,
    error: false,
    sendable: true,
  };
  async componentDidMount() {
    const page = this.props.page ? this.props.page : 1;
    const chat = await ChatController.detail(this.props.route.params?.chat_id);
    if (!chat) {
      this.setState({loading: false, valid: false});
      return;
    }

    this.props.navigation.setOptions({title: chat.who.name});
    this.setState({chat: chat});
    await this.loadMessages(page, false);
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
        <ScrollView
          ref={(r) => {
            this.scroll = r;
          }}
          onContentSizeChange={() => {
            if (this.state.page === 1) {
              this.scroll.scrollToEnd();
            }
          }}>
          {!this.state.no_more && (
            <Button
              loading={this.state.loading_more}
              disabled={this.state.no_more}
              style={styles.more}
              onPress={this._handleLoadMore}>
              Xem thêm
            </Button>
          )}
          {this.state.messages.map((message, index) => (
            <View style={styles.message_area} key={index}>
              {message.author.user_id !== this.state.chat.user_id && (
                <View style={styles.author_box}>
                  <Avatar.Image
                    size={32}
                    source={{uri: message.author.avatar}}
                  />
                </View>
              )}
              <TouchableRipple
                borderless
                onPress={() => null}
                style={styles.message_box}>
                <View>
                  <View style={styles.info_box}>
                    <Subheading style={styles.message_username}>
                      {message.author.name}
                    </Subheading>
                    <Caption>{message.time}</Caption>
                  </View>
                  <Paragraph style={styles.message_content}>
                    {message.content}
                  </Paragraph>
                </View>
              </TouchableRipple>
              {message.author.user_id === this.state.chat.user_id && (
                <View style={styles.author_box}>
                  <Avatar.Image
                    size={32}
                    source={{uri: message.author.avatar}}
                  />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        <Card style={styles.box} onPress={() => Keyboard.dismiss()}>
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
              onSubmitEditing={this._handleSendMessage}
            />
            {this.state.sendable && (
              <IconButton
                icon="send"
                color={this.props.theme.colors.primary}
                style={styles.new_message_button}
                onPress={this._handleSendMessage}
              />
            )}
          </View>
        </Card>
        <Snackbar
          visible={this.state.error}
          onDismiss={() => this.setState({error: false})}
          action={{
            label: 'OK',
            onPress: () => this.setState({error: false}),
          }}>
          {this.state.error}
        </Snackbar>
      </View>
    );
  }
  async loadMessages(page, refresh) {
    let current_messages = refresh ? [] : this.state.messages;
    let messages = await MessageController.list(this.state.chat.chat_id, page);
    messages = messages.reverse();

    const no_more = !messages.length;
    this.setState({
      loading: false,
      messages: messages.concat(current_messages),
      page: page,
      no_more: no_more,
    });
  }
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadMessages(page, false).then(() => {
      this.setState({loading_more: false});
    });
  };
  _handleMessageInput = (text) => {
    this.setState({new_message: text});
  };
  _handleSendMessage = () => {
    if (!this.state.sendable) {
      return;
    }
    Keyboard.dismiss();
    MessageController.send(this).then((message_id) => {
      this.loadMessages(1, true);
    });
  };
  _handleViewUser = (user_id) => {
    if (user_id === undefined) {
      return;
    }
    this.props.navigation.push('ViewUser', {user_id: user_id});
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
    marginBottom: 10,
  },
});
