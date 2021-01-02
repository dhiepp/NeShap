import React, {Component} from 'react';
import {StyleSheet, View, RefreshControl, ScrollView} from 'react-native';
import {
  ActivityIndicator,
  Title,
  Button,
  Card,
  Chip,
  Colors,
  Snackbar,
  Paragraph,
  Avatar,
  Headline,
  TouchableRipple,
} from 'react-native-paper';

import PostController from '../controllers/PostController';
import UserController from '../controllers/UserController';
import ListCommentComponent from './components/ListCommentComponent';

export default class ViewPostScreen extends Component {
  state = {
    loading: true,
    valid: true,
    refresh: false,
    message: false,
  };
  async componentDidMount() {
    await this.loadPost();
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (!this.state.valid) {
      return <Headline style={styles.title}>Bài viết không tồn tại</Headline>;
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
            <TouchableRipple
              borderles
              style={styles.author_box}
              onPress={this._handleViewAuthor}>
              <Card.Title
                title={this.state.post.author.name}
                subtitle={this.state.post.time}
                left={(props) => (
                  <Avatar.Image
                    size={props.size}
                    source={{uri: this.state.post.author.avatar}}
                  />
                )}
                right={() => {
                  if (this.state.perm.value >= 2) {
                    return (
                      <Button
                        icon="pencil"
                        color={this.state.perm.value > 2 ? Colors.redA200 : ''}
                        onPress={this._handleEdit}>
                        Sửa
                      </Button>
                    );
                  }
                }}
              />
            </TouchableRipple>

            {this.state.post.has_cover && (
              <Card.Cover
                style={styles.cover}
                source={{uri: this.state.post.cover}}
              />
            )}
            <Card.Content>
              <Title style={styles.title}>{this.state.post.title}</Title>
              <Paragraph>{this.state.post.content}</Paragraph>
              <View style={styles.tags}>
                {this.state.post.tags.map((tag) => (
                  <Chip
                    key={tag}
                    icon="tag"
                    style={styles.tagchip}
                    onPress={() => this._handleViewTag(tag)}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                icon="heart"
                mode={this.state.post.liked ? 'contained' : 'text'}
                disabled={this.state.perm.value === 0}
                onPress={this._handleLike}>
                {this.state.post.likes} Thích
              </Button>
            </Card.Actions>
          </Card>
          <ListCommentComponent
            post_id={this.state.post.post_id}
            refresh={this.state.refresh}
            navigation={this.props.navigation}
            onMessage={this._handleMessage}
            onFinishRefresh={this._finishRefresh}
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

  async loadPost() {
    const post = await PostController.detail(this.props.route.params?.post_id);
    if (!post) {
      this.setState({loading: false, valid: false});
      return;
    }
    const perm = await UserController.checkPerm(post.author.user_id);
    this.setState({
      loading: false,
      refresh: false,
      post: post,
      perm: perm,
    });
  }
  _handleRefresh = () => {
    this.setState({refresh: true});
    this.loadPost();
  };
  _finishRefresh = () => {
    this.setState({refresh: false});
  };
  _handleViewAuthor = () => {
    if (!this.state.post.author.user_id) {
      return;
    }
    UserController.view(this.props.navigation, this.state.post.author.user_id);
  };
  _handleEdit = () => {
    this.props.navigation.navigate('EditPost', {
      post_id: this.state.post.post_id,
    });
  };
  _handleViewTag = (tag) => {
    this.props.navigation.push('ViewTag', {tag: tag});
  };
  _handleLike = () => {
    PostController.like(this);
  };
  _handleMessage = (message) => {
    this.setState({message: message});
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
  author_box: {
    borderRadius: 10,
  },
  cover: {
    margin: 5,
    resizeMode: 'contain',
  },
  tags: {
    flex: 1,
    marginTop: 10,
    marginLeft: -5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  tagchip: {
    margin: 2,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  comment_avatar: {
    marginTop: 10,
  },
  comment_content: {
    flex: 5,
    margin: 5,
  },
});
