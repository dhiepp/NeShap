import * as AppData from '../AppData';
import TimeUtils from '../utils/TimeUtils';
import {io} from 'socket.io-client';

export default class MessageController {
  static async list(chat_id, page) {
    try {
      const session_id = (await AppData.getUserData()).session_id;
      const response = await fetch(
        `${AppData.server}/message/list?session_id=${session_id}&chat_id=${chat_id}&page=${page}`,
        {method: 'get'},
      );
      let json = await response.json();

      const time = Date.now();
      json = json.map((message) => {
        message.author.avatar = `${AppData.server}/user/avatar?user_id=${message.author.user_id}&t=${time}`;
        message.time = TimeUtils.translate(message.time);
        return message;
      });
      return json;
    } catch (exception) {
      console.log(exception);
      return [];
    }
  }

  static async send(screen) {
    try {
      const content = screen.state.new_message;
      screen.setState({error: false, new_message: ''});
      const session_id = (await AppData.getUserData()).session_id;
      const data = {};
      data.session_id = session_id;
      data.chat_id = screen.state.chat.chat_id;
      data.content = content;
      const init = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      const response = await fetch(`${AppData.server}/message/send`, init);
      const json = await response.json();
      console.log(json);
      if (json.status) {
        return json.message_id;
      } else {
        screen.setState({error: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async connect(chat_id) {
    try {
      const session_id = (await AppData.getUserData()).session_id;

      const socket = io(AppData.server, {path: '/realtime-chat'});
      socket.emit('auth', {session_id: session_id, chat_id: chat_id});
      return socket;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static update(message) {
    // eslint-disable-next-line prettier/prettier
    message.author.avatar = `${AppData.server}/user/avatar?user_id=${message.author.user_id}&t=${Date.now()}`;
    message.time = TimeUtils.translate(message.time);
    return message;
  }
}
