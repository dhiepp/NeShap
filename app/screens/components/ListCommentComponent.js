import React, {Component} from 'react';
import {StyleSheet, View, Keyboard} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Paragraph,
  Avatar,
  TextInput,
  Subheading,
  IconButton,
  TouchableRipple,
  Portal,
  Dialog,
  Button,
  Colors,
  withTheme,
  Title,
  Caption,
} from 'react-native-paper';

import UserController from '../../controllers/UserController';
import CommentController from '../../controllers/CommentController';

class ListCommentComponent extends Component {
  state = {
    comments: [],
    loading: true,
    loading_more: false,
    no_more: false,
    error: false,
    message: false,
    selected_comment: false,
    sendable: true,
  };
  async componentDidMount() {
    const page = this.props.page ? this.props.page : 1;
    await this.loadComments(page, false);
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (this.props.refresh) {
      this.loadComments(1, true);
    }
    return (
      <View>
        <Card style={styles.box}>
          <Title style={styles.title}>Bình luận</Title>
          <View style={styles.new_comment_box}>
            <TextInput
              dense
              multiline
              maxLength={500}
              label="Thêm bình luận"
              mode="outlined"
              value={this.state.new_comment}
              style={styles.new_comment_input}
              onChangeText={(text) => this._handleCommentInput(text)}
              onSubmitEditing={this._handleAddComment}
            />
            {this.state.sendable && (
              <IconButton
                icon="send"
                color={this.props.theme.colors.primary}
                style={styles.new_comment_button}
                onPress={this._handleAddComment}
              />
            )}
          </View>
          {this.state.comments.map((comment, index) => (
            <View style={styles.comment_area} key={index}>
              <View style={styles.author_box}>
                <TouchableRipple
                  borderless
                  onPress={() => this._handleViewUser(comment.author.user_id)}>
                  <Avatar.Image
                    size={32}
                    source={{uri: comment.author.avatar}}
                  />
                </TouchableRipple>
              </View>
              <TouchableRipple
                borderless
                onPress={() => null}
                onLongPress={() => this._handleCommentAction(comment)}
                style={styles.comment_box}>
                <View>
                  <View style={styles.info_box}>
                    <TouchableRipple
                      borderless
                      onPress={() =>
                        this._handleViewUser(comment.author.user_id)
                      }>
                      <Subheading style={styles.comment_username}>
                        {comment.author.name}
                      </Subheading>
                    </TouchableRipple>
                    <Caption>{comment.time}</Caption>
                  </View>
                  <Paragraph style={styles.comment_content}>
                    {comment.content}
                  </Paragraph>
                </View>
              </TouchableRipple>
            </View>
          ))}
        </Card>
        {this.state.no_more && this.state.page === 1 && (
          <Subheading style={styles.title}>Không có bình luận nào</Subheading>
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
        <Portal>
          <Dialog
            visible={this.state.selected_comment}
            onDismiss={this._hideDialog}>
            <Dialog.Title>Bình luận</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Bạn có muốn xóa bình luận này?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this._handleDeleteComment}>Có</Button>
              <Button onPress={this._hideDialog}>Không</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    );
  }
  async loadComments(page, refresh) {
    let current_comments = refresh ? [] : this.state.comments;
    let comments = await CommentController.list(this.props.post_id, page);
    comments = await Promise.all(
      comments.map(async (comment) => {
        const perm = await UserController.checkPerm(comment.author.user_id);
        comment.perm = perm.value;
        return comment;
      }),
    );
    this.props.onFinishRefresh();
    const no_more = !comments.length;
    this.setState({
      comments: current_comments.concat(comments),
      page: page,
      no_more: no_more,
    });
  }
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadComments(page, false).then(() => {
      this.setState({loading_more: false});
    });
  };
  _handleCommentInput = (text) => {
    this.setState({new_comment: text});
  };
  _handleAddComment = () => {
    if (!this.state.sendable) {
      return;
    }
    Keyboard.dismiss();
    CommentController.add(this).then(() => {
      this._handleMessage();
      if (!this.state.error) {
        this.loadComments(1, true);
      }
    });
  };
  _handleViewUser = (user_id) => {
    if (user_id === undefined) {
      return;
    }
    this.props.navigation.push('ViewUser', {user_id: user_id});
  };
  _handleCommentAction = (comment) => {
    if (comment.perm >= 2) {
      this.setState({selected_comment: comment});
    }
  };
  _handleDeleteComment = () => {
    CommentController.delete(this).then(() => {
      this._handleMessage();
      if (!this.state.error) {
        let comments = this.state.comments;
        const selected_id = this.state.selected_comment.comment_id;
        comments = comments.filter(
          (comment) => comment.comment_id !== selected_id,
        );
        this.setState({comments: comments, selected_comment: false});
      }
    });
  };
  _hideDialog = () => {
    this.setState({selected_comment: false});
  };
  _handleMessage = () => {
    this.props.onMessage(this.state.message);
  };
}

export default withTheme(ListCommentComponent);

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  box: {
    padding: 10,
    margin: 10,
    marginTop: 0,
  },
  title: {
    margin: 10,
    textAlign: 'center',
  },
  new_comment_box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  new_comment_input: {
    flex: 9,
    margin: 5,
  },
  new_comment_button: {
    flex: 1,
    margin: 5,
  },
  comment_area: {
    flexDirection: 'row',
    margin: 5,
  },
  author_box: {
    flex: 1,
    padding: 5,
    paddingLeft: 0,
  },
  comment_box: {
    flex: 9,
    borderRadius: 10,
    padding: 10,
    backgroundColor: Colors.grey200,
  },
  info_box: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  comment_username: {
    fontWeight: 'bold',
  },
  comment_content: {
    margin: 10,
  },
  more: {
    marginBottom: 10,
  },
});
