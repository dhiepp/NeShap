import * as AppData from '../AppData';

export default class PostController {
  static async getFromPost(postid) {
    try {
      const response = await fetch(
        `${AppData.server}/comment/get?postid=${postid}`,
        {method: 'get'},
      );
      const json = await response.json();
      return json;
    } catch (exception) {
      console.log(exception);
      return [];
    }
  }
  static async add(screen) {
    try {
      screen.setState({message: false});
      const data = {};
      const userid = (await AppData.getUserData()).userid;
      data.authorid = userid;
      data.postid = screen.props.postid;
      data.content = screen.state.new_comment;
      console.log(data);
      const init = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      const response = await fetch(`${AppData.server}/comment/add`, init);
      const json = await response.json();
      console.log(json);
      if (json.status === 'success') {
        screen.setState({error: false, new_comment: ''});
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
      const comment = screen.state.selectedComment;

      const userid = (await AppData.getUserData()).userid;
      const postid = screen.props.postid;
      const commentid = comment.commentid;

      const response = await fetch(
        `${
          AppData.server
        }/comment/delete?userid=${userid}&postid=${postid}&commentid=${commentid}`,
        {method: 'post'},
      );
      const json = await response.json();
      console.log(json);
      if (json.status === 'success') {
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
