import * as AppData from '../AppData';
import TimeUtils from '../utils/TimeUtils';

export default class CommentController {
  static async list(post_id, page) {
    try {
      const response = await fetch(
        `${AppData.server}/comment/list?post_id=${post_id}&page=${page}`,
        {method: 'get'},
      );
      let json = await response.json();

      const time = Date.now();
      json = json.map((comment) => {
        comment.author.avatar = `${AppData.server}/user/avatar?user_id=${comment.author.user_id}&t=${time}`;
        comment.time = TimeUtils.translate(comment.time);
        return comment;
      });
      return json;
    } catch (exception) {
      console.log(exception);
      return [];
    }
  }
  static async add(screen) {
    try {
      screen.setState({message: false, sendable: false});
      const session_id = (await AppData.getUserData()).session_id;
      const data = {};
      data.session_id = session_id;
      data.post_id = screen.props.post_id;
      data.content = screen.state.new_comment;
      const init = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      const response = await fetch(`${AppData.server}/comment/write`, init);
      const json = await response.json();
      console.log(json);
      if (json.status) {
        screen.setState({error: false, sendable: true, new_comment: ''});
        return json.comment_id;
      } else {
        screen.setState({
          error: true,
          sendable: true,
          message: json.message,
        });
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async delete(screen) {
    try {
      screen.setState({message: false});
      const comment = screen.state.selected_comment;

      const session_id = (await AppData.getUserData()).session_id;
      const comment_id = comment.comment_id;

      const response = await fetch(
        `${AppData.server}/comment/delete?session_id=${session_id}&comment_id=${comment_id}`,
        {method: 'post'},
      );
      const json = await response.json();
      console.log(json);
      if (json.status) {
        screen.setState({
          error: false,
          message: 'Đã xóa bình luận!',
        });
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }
}
