import React, {Component} from 'react';
import {StyleSheet, View, Keyboard, RefreshControl} from 'react-native';
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
import {ScrollView} from 'react-native-gesture-handler';
import moment from 'moment';

import PostController from '../controllers/PostController';
import UserController from '../controllers/UserController';
import ViewComment from './components/ViewComment';

export default class ViewPostScreen extends Component {
  state = {
    loading: true,
    valid: true,
    refresh: false,
    message: false,
  };
  componentDidMount() {
    this.loadPost();
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
          <Card style={styles.box} onPress={() => Keyboard.dismiss()}>
            <TouchableRipple
              borderles
              style={styles.author_box}
              onPress={this._handleViewAuthor}>
              <Card.Title
                title={this.state.author.name}
                subtitle={this.state.time}
                left={props => (
                  <Avatar.Image
                    size={props.size}
                    source={{uri: this.state.author.avatar}}
                    style={styles.avatar}
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

            {this.state.post.cover && (
              <Card.Cover
                style={styles.cover}
                source={{uri: this.state.post.coverUrl}}
              />
            )}
            <Card.Content>
              <Title style={styles.title}>{this.state.post.title}</Title>
              <Paragraph>{this.state.post.content}</Paragraph>
              <View style={styles.tags}>
                {this.state.post.tags.map(tag => (
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
                icon="thumb-up"
                mode={this.state.liked ? 'contained' : 'text'}
                disabled={this.state.perm.value === 0}
                onPress={this._handleLike}>
                {this.state.likes.length} Thích
              </Button>
              <Button
                icon="thumb-down"
                mode={this.state.disliked ? 'contained' : 'text'}
                disabled={this.state.perm.value === 0}
                onPress={this._handleDislike}>
                {this.state.dislikes.length} Không thích
              </Button>
            </Card.Actions>
          </Card>
          <ViewComment
            postid={this.state.post._id}
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
    const post = await PostController.get(this.props.route.params.post_id);
    if (!post) {
      this.setState({loading: false, valid: false});
      return;
    }
    const author = post.author;
    //const perm = await UserController.checkPerm(post.authorid);
    const time = moment(post.time).fromNow();
    //const likes = post.likes ? post.likes : [];
    //const dislikes = post.dislikes ? post.dislikes : [];
    this.setState({
      loading: false,
      refresh: false,
      post: post,
      author: author,
      // perm: perm,
      perm: 2,
      time: time,
      // likes: likes,
      // dislikes: dislikes,
      likes: [],
      dislikes: [],
    });
    // this.updateRating();
  }
  updateRating() {
    const liked = this.state.likes.includes(this.state.perm.userid);
    const disliked = this.state.dislikes.includes(this.state.perm.userid);
    this.setState({
      liked: liked,
      disliked: disliked,
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
    if (this.state.author._id === undefined) {
      return;
    }
    UserController.view(this.props.navigation, this.state.post.authorid);
  };
  _handleEdit = () => {
    this.props.navigation.navigate('EditPost', {postid: this.state.post._id});
  };
  _handleViewTag = tag => {
    this.props.navigation.push('ViewTag', {tag: tag});
  };
  _handleLike = () => {
    PostController.like(this).then(() => this.updateRating());
  };
  _handleDislike = () => {
    PostController.dislike(this).then(() => this.updateRating());
  };
  _handleMessage = message => {
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
