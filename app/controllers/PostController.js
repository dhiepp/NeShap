import {CommonActions} from '@react-navigation/native';

import * as AppData from '../AppData';

export default class PostController {
  static async view(navigation, postid) {
    navigation.push('ViewPost', {postid: postid});
  }

  static async write(screen) {
    try {
      screen.setState({message: false});
      const request = {};
      const session_id = (await AppData.getUserData()).session_id;
      request.session_id = session_id;
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
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async edit(screen) {
    try {
      screen.setState({message: false});
      const request = {};
      const userid = (await AppData.getUserData()).userid;
      request.postid = screen.state.post._id;
      request.userid = userid;
      request.title = screen.state.newTitle;
      request.content = screen.state.newContent;
      request.tags = Array.from(screen.state.editTags);
      const cover = screen.state.newCover;

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
      if (json.status === 'success') {
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

      const userid = (await AppData.getUserData()).userid;
      const postid = screen.state.post._id;

      const response = await fetch(
        `${AppData.server}/post/delete?userid=${userid}&postid=${postid}`,
        {method: 'post'},
      );
      const json = await response.json();
      console.log(json);
      if (json.status === 'success') {
        screen.setState({error: false, delete: false});
        screen.props.navigation.navigate('HomeTabs', {screen: 'Account'});
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async get(post_id) {
    try {
      const response = await fetch(
        `${AppData.server}/post/get?post_id=${post_id}`,
        {method: 'get'},
      );
      const json = await response.json();
      // eslint-disable-next-line prettier/prettier
      json.coverUrl = `${AppData.server}/post/cover?post_id=${post_id}&t=${Date.now()}`;
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async list(mode, page, userid, keyword) {
    try {
      if (userid === 'check') {
        userid = (await AppData.getUserData()).userid;
      }
      const response = await fetch(
        // eslint-disable-next-line prettier/prettier
        `${AppData.server}/post/list?mode=${mode}&userid=${userid}&page=${page}&key=${keyword}`,
        {
          method: 'get',
        },
      );
      let json = await response.json();
      json = json.map(post => {
        // eslint-disable-next-line prettier/prettier
        post.cover = `${AppData.server}/post/cover?postid=${post._id}&t=${Date.now()}`;
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
      const userid = (await AppData.getUserData()).userid;
      const postid = screen.state.post._id;

      const response = await fetch(
        `${AppData.server}/post/like?postid=${postid}&userid=${userid}`,
        {method: 'post'},
      );
      const json = await response.json();
      if (json.status === 'success') {
        let likes = screen.state.likes;
        let dislikes = screen.state.dislikes;
        if (json.liked) {
          likes.push(userid);
          dislikes = dislikes.filter(like => like !== userid);
        } else {
          likes = likes.filter(like => like !== userid);
        }
        screen.setState({
          error: false,
          likes: likes,
          dislikes: dislikes,
        });
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async dislike(screen) {
    try {
      screen.setState({message: false});
      const userid = (await AppData.getUserData()).userid;
      const postid = screen.state.post._id;

      const response = await fetch(
        `${AppData.server}/post/dislike?postid=${postid}&userid=${userid}`,
        {method: 'post'},
      );
      const json = await response.json();
      if (json.status === 'success') {
        let likes = screen.state.likes;
        let dislikes = screen.state.dislikes;
        if (json.disliked) {
          dislikes.push(userid);
          likes = likes.filter(like => like !== userid);
        } else {
          dislikes = dislikes.filter(like => like !== userid);
        }
        screen.setState({
          error: false,
          likes: likes,
          dislikes: dislikes,
        });
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }
}
