import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Text,
  Headline,
} from 'react-native-paper';
import moment from 'moment';

import UserController from '../../controllers/UserController';
import PostController from '../../controllers/PostController';

export default class ListPost extends Component {
  state = {loading: true, loadingmore: false, nomore: false, posts: []};
  async componentDidMount() {
    const page = this.props.page ? this.props.page : 1;
    await this.loadPosts(page);
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (this.props.refresh) {
      this.loadPosts(1);
    }
    return (
      <View style={styles.full}>
        {this.state.posts.map(post => {
          return (
            <Card key={post._id} style={styles.box}>
              <Card.Title
                title={post.author.username}
                subtitle={moment(post.time).fromNow()}
                left={props => (
                  <Avatar.Image
                    size={props.size}
                    source={{uri: post.author.avatar}}
                  />
                )}
              />
              {post.hasCover && (
                <Card.Cover style={styles.cover} source={{uri: post.cover}} />
              )}
              <Card.Content>
                <Text style={styles.title}>{post.title}</Text>
              </Card.Content>
              <Card.Actions>
                <Button icon="star">{post.rating ? post.rating : 0}</Button>
                <Button onPress={() => this._handleViewPost(post._id)}>
                  Xem chi tiết
                </Button>
              </Card.Actions>
            </Card>
          );
        })}
        {this.state.nomore && this.state.page === 1 && (
          <Headline style={styles.title}>Không có bài viết nào</Headline>
        )}
        {!this.state.nomore && (
          <Button
            loading={this.state.loadingmore}
            disabled={this.state.nomore}
            style={styles.more}
            onPress={this._handleLoadMore}>
            Xem thêm
          </Button>
        )}
      </View>
    );
  }
  async loadPosts(page) {
    const mode = this.props.mode;
    const userid = this.props.userid;
    const keyword = this.props.keyword;
    let oldPosts = this.state.posts;
    if (this.props.refresh) {
      oldPosts = [];
    }
    let posts = await PostController.list(mode, page, userid, keyword);
    posts = await Promise.all(
      posts.map(async post => {
        const author = await UserController.get(post.authorid);
        post.author = author;
        return post;
      }),
    );
    this.props.onFinishRefresh();
    const nomore = !posts.length;
    this.setState({posts: oldPosts.concat(posts), page: page, nomore: nomore});
  }
  _handleViewPost = postid => {
    PostController.view(this.props.navigation, postid);
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loadingmore: true});
    this.loadPosts(page).then(() => {
      this.setState({loadingmore: false});
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
  cover: {
    margin: 5,
    resizeMode: 'contain',
  },
  title: {
    textAlign: 'center',
  },
  more: {
    marginBottom: 10,
  },
});
