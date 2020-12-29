import {CommonActions} from '@react-navigation/native';

import * as AppData from '../AppData';

export default class PostController {
  static cover(post_id) {
    return `${AppData.server}/post/cover?post_id=${post_id}&t=${Date.now()}`;
  }

  static async view(navigation, post_id) {
    navigation.push('ViewPost', {post_id: post_id});
  }

  static async write(screen) {
    try {
      screen.setState({message: false, loading: true});
      const request = {};
      request.session_id = (await AppData.getUserData()).session_id;
      request.title = screen.state.title;
      request.content = screen.state.content;
      request.tags = Array.from(screen.state.tags);
      const cover = screen.state.cover;

      const data = new FormData();
      data.append('data', JSON.stringify(request));
      if (cover) {
        data.append('cover', {
          name: cover.fileName,
          type: cover.type,
          uri: cover.uri,
        });
      }
      const init = {
        method: 'post',
        body: data,
      };

      const response = await fetch(`${AppData.server}/post/write`, init);
      const json = await response.json();
      console.log(json);
      if (json.status) {
        screen.props.navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {name: 'HomeTabs'},
              {name: 'ViewPost', params: {post_id: json.post_id}},
            ],
          }),
        );
      } else {
        screen.setState({error: true, loading: false, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async edit(screen) {
    try {
      screen.setState({message: false});
      const request = {};
      request.session_id = (await AppData.getUserData()).session_id;
      request.post_id = screen.state.post.post_id;
      request.title = screen.state.new_title;
      request.content = screen.state.new_content;
      request.tags = Array.from(screen.state.edit_tags);
      const cover = screen.state.new_cover;

      const data = new FormData();
      data.append('data', JSON.stringify(request));
      if (cover) {
        data.append('cover', {
          name: cover.fileName,
          type: cover.type,
          uri: cover.uri,
        });
      }
      const init = {
        method: 'post',
        body: data,
      };

      const response = await fetch(`${AppData.server}/post/edit`, init);
      const json = await response.json();
      console.log(json);
      if (json.status) {
        screen.setState({error: false, message: 'Đã sửa bài viết'});
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async delete(screen) {
    try {
      screen.setState({message: false});

      const session_id = (await AppData.getUserData()).session_id;
      const post_id = screen.state.post.post_id;

      const response = await fetch(
        `${AppData.server}/post/delete?session_id=${session_id}&post_id=${post_id}`,
        {method: 'post'},
      );
      const json = await response.json();
      if (json.status) {
        screen.setState({error: false, delete: false});
        screen.props.navigation.navigate('HomeTabs');
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async detail(post_id) {
    try {
      const viewer_id = (await AppData.getUserData()).user_id;
      const response = await fetch(
        `${AppData.server}/post/detail?post_id=${post_id}&viewer_id=${viewer_id}`,
        {method: 'get'},
      );
      const json = await response.json();

      // eslint-disable-next-line prettier/prettier
      json.author.avatar = `${AppData.server}/user/avatar?user_id=${json.author.user_id}&t=${Date.now()}`;
      // eslint-disable-next-line prettier/prettier
      json.cover = `${AppData.server}/post/cover?post_id=${post_id}&t=${Date.now()}`;
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async list(mode, page, user_id, keyword) {
    try {
      if (user_id == null) {
        user_id = (await AppData.getUserData()).user_id;
      }
      const response = await fetch(
        `${AppData.server}/post/list?mode=${mode}&user_id=${user_id}&page=${page}&key=${keyword}`,
        {
          method: 'get',
        },
      );
      let json = await response.json();
      json = json.map((post) => {
        // eslint-disable-next-line prettier/prettier
        post.author.avatar = `${AppData.server}/user/avatar?user_id=${post.author.user_id}&t=${Date.now()}`;
        // eslint-disable-next-line prettier/prettier
        post.cover = `${AppData.server}/post/cover?post_id=${post.post_id}&t=${Date.now()}`;
        return post;
      });
      return json;
    } catch (exception) {
      console.log(exception);
      return [];
    }
  }

  static async like(screen) {
    try {
      screen.setState({message: false});
      const session_id = (await AppData.getUserData()).session_id;
      const post_id = screen.state.post.post_id;
      const liked = screen.state.post.liked;
      const action = liked ? 'unlike' : 'like';

      const response = await fetch(
        `${AppData.server}/post/${action}?post_id=${post_id}&session_id=${session_id}`,
        {method: 'post'},
      );
      const json = await response.json();
      if (json.status) {
        screen.setState((prevState) => ({
          error: false,
          post: {
            ...prevState.post,
            liked: !liked,
            likes: json.likes,
          },
        }));
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }
}
