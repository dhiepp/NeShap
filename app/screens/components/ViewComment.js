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
} from 'react-native-paper';

import UserController from '../../controllers/UserController';
import CommentController from '../../controllers/CommentController';

class ViewComment extends Component {
  state = {loading: true, error: false, message: false, selectedComment: false};
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
          {this.state.perm.value > 0 && (
            <View style={styles.new_comment_box}>
              <TextInput
                label="Thêm bình luận"
                mode="outlined"
                value={this.state.new_comment}
                style={styles.new_comment_input}
                onChangeText={text => this._handleCommentInput(text)}
              />
              <IconButton
                icon="send"
                color={this.props.theme.colors.primary}
                style={styles.new_comment_button}
                onPress={this._handleAddComment}
              />
            </View>
          )}
          {this.state.comments.map(comment => (
            <TouchableRipple
              borderless
              key={comment.commentid}
              onPress={() => {}}
              onLongPress={() => this._handleCommentAction(comment)}
              style={styles.comment_box}>
              <View>
                <TouchableRipple
                  borderles
                  style={styles.author_box}
                  onPress={() => this._handleViewUser(comment.author._id)}>
                  <View style={styles.comment_author}>
                    <Avatar.Image
                      size={32}
                      source={{uri: comment.author.avatar}}
                    />
                    <Subheading style={styles.comment_username}>
                      {comment.author.username}
                    </Subheading>
                  </View>
                </TouchableRipple>
                <Paragraph>{comment.content}</Paragraph>
              </View>
            </TouchableRipple>
          ))}
        </Card>
        <Portal>
          <Dialog
            visible={this.state.selectedComment}
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
    let comments = await CommentController.getFromPost(this.props.postid);
    const perm = await UserController.checkPerm(this.props.postid);
    comments = await Promise.all(
      comments.reverse().map(async comment => {
        const author = await UserController.get(comment.authorid);
        let cPerm = perm.value;
        if (perm.userid === comment.authorid) {
          cPerm = 2;
        }
        return {
          commentid: comment._id,
          author: author,
          content: comment.content,
          perm: cPerm,
        };
      }),
    );
    this.props.onFinishRefresh();
    this.setState({comments: comments, perm: perm});
  }
  _handleCommentInput = text => {
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
  _handleViewUser = userid => {
    if (userid === undefined) {
      return;
    }
    this.props.navigation.push('ViewUser', {userid: userid});
  };
  _handleCommentAction = comment => {
    if (comment.perm >= 2) {
      this.setState({selectedComment: comment});
    }
  };
  _handleDeleteComment = () => {
    CommentController.delete(this).then(() => {
      this._handleMessage();
      if (!this.state.error) {
        let comments = this.state.comments;
        const selectedid = this.state.selectedComment.commentid;
        comments = comments.filter(comment => comment.commentid !== selectedid);
        this.setState({comments: comments, selectedComment: false});
      }
    });
  };
  _hideDialog = () => {
    this.setState({selectedComment: false});
  };
  _handleMessage = () => {
    this.props.onMessage(this.state.message);
  };
}

export default withTheme(ViewComment);

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
    alignItems: 'flex-start',
    borderRadius: 20,
    padding: 10,
    margin: 5,
    backgroundColor: Colors.grey200,
  },
  comment_author: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comment_username: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
