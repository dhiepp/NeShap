import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Title,
  Headline,
} from 'react-native-paper';

import PostController from '../../controllers/PostController';

export default class ListPostComponent extends Component {
  state = {loading: true, loading_more: false, no_more: false, posts: []};
  async componentDidMount() {
    const page = this.props.page ? this.props.page : 1;
    await this.loadPosts(page, false);
    this.setState({loading: false});
  }
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    if (this.props.refresh) {
      this.loadPosts(1, true);
    }
    return (
      <View style={styles.full}>
        {this.state.posts.map((post, index) => {
          return (
            <Card
              key={index}
              style={styles.box}
              onPress={() => this._handleViewPost(post.post_id)}>
              <Card.Title
                title={post.author.name}
                subtitle={post.time}
                left={(props) => (
                  <Avatar.Image
                    size={props.size}
                    source={{uri: post.author.avatar}}
                  />
                )}
              />
              {post.has_cover && (
                <Card.Cover style={styles.cover} source={{uri: post.cover}} />
              )}
              <Card.Content>
                <Title style={styles.title}>{post.title}</Title>
              </Card.Content>
              <Card.Actions>
                <Button icon="heart">{post.likes} Thích</Button>
                <Button icon="message">{post.comments} Bình luận</Button>
              </Card.Actions>
            </Card>
          );
        })}
        {this.state.no_more && this.state.page === 1 && (
          <Headline style={styles.title}>Không có bài viết nào</Headline>
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
      </View>
    );
  }
  async loadPosts(page, refresh) {
    const mode = this.props.mode;
    const user_id = this.props.user_id;
    const keyword = this.props.keyword;

    let current_posts = refresh ? [] : this.state.posts;
    let posts = await PostController.list(mode, page, user_id, keyword);
    this.props.onFinishRefresh();
    const no_more = !posts.length;
    this.setState({
      posts: current_posts.concat(posts),
      page: page,
      no_more: no_more,
    });
  }
  _handleViewPost = (postid) => {
    PostController.view(this.props.navigation, postid);
  };
  _handleLoadMore = () => {
    const page = this.state.page + 1;
    this.setState({loading_more: true});
    this.loadPosts(page, false).then(() => {
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
