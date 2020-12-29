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
    loading: true,
    error: false,
    message: false,
    selected_comment: false,
  };
  async componentDidMount() {
    await this.updateComments();
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (this.props.refresh) {
      this.updateComments();
    }
    return (
      <View>
        <Card style={styles.box} onPress={() => Keyboard.dismiss()}>
          <Title style={styles.title}>Bình luận</Title>
          <View style={styles.new_comment_box}>
            <TextInput
              label="Thêm bình luận"
              mode="outlined"
              value={this.state.new_comment}
              style={styles.new_comment_input}
              onChangeText={(text) => this._handleCommentInput(text)}
              onSubmitEditing={this._handleAddComment}
            />
            <IconButton
              icon="send"
              color={this.props.theme.colors.primary}
              style={styles.new_comment_button}
              onPress={this._handleAddComment}
            />
          </View>
          {this.state.comments.map((comment) => (
            <TouchableRipple
              borderless
              key={comment.comment_id}
              onPress={() => null}
              onLongPress={() => this._handleCommentAction(comment)}
              style={styles.comment_box}>
              <View>
                <View style={styles.info_box}>
                  <TouchableRipple
                    borderles
                    onPress={() =>
                      this._handleViewUser(comment.author.user_id)
                    }>
                    <View style={styles.comment_author}>
                      <Avatar.Image
                        size={32}
                        source={{uri: comment.author.avatar}}
                      />
                      <Subheading style={styles.comment_username}>
                        {comment.author.name}
                      </Subheading>
                    </View>
                  </TouchableRipple>
                  <Caption>{comment.time}</Caption>
                </View>
                <Paragraph style={styles.comment_content}>
                  {comment.content}
                </Paragraph>
              </View>
            </TouchableRipple>
          ))}
        </Card>
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
  async updateComments() {
    let comments = await CommentController.list(this.props.post_id);
    comments = await Promise.all(
      comments.map(async (comment) => {
        const perm = await UserController.checkPerm(comment.author.user_id);
        comment.perm = perm.value;
        return comment;
      }),
    );
    this.props.onFinishRefresh();
    this.setState({comments: comments});
  }
  _handleCommentInput = (text) => {
    this.setState({new_comment: text});
  };
  _handleAddComment = () => {
    Keyboard.dismiss();
    CommentController.add(this).then(() => {
      this._handleMessage();
      if (!this.state.error) {
        this.updateComments();
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
  child: {
    margin: 5,
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
  comment_box: {
    flexDirection: 'column',
    borderRadius: 20,
    padding: 10,
    margin: 5,
    backgroundColor: Colors.grey200,
  },
  info_box: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  comment_author: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comment_username: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  comment_content: {
    margin: 10,
  },
});
