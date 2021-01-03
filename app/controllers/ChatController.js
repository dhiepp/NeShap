import * as AppData from '../miscs/AppData';
import * as TimeUtils from '../miscs/TimeUtils';

export default class ChatController {
  static async view(navigation, chat_id) {
    navigation.push('ViewChat', {chat_id: chat_id});
  }

  static async list(page) {
    try {
      const session_id = (await AppData.getUserData()).session_id;

      const response = await fetch(
        `${AppData.server}/chat/list?session_id=${session_id}&page=${page}`,
        {method: 'get'},
      );
      let json = await response.json();

      const time = Date.now();
      json = json.map((chat) => {
        chat.who.avatar = `${AppData.server}/user/avatar?user_id=${chat.who.user_id}&t=${time}`;
        chat.last = TimeUtils.translate(chat.last);
        return chat;
      });
      return json;
    } catch (exception) {
      console.log(exception);
      return [];
    }
  }

  static async detail(chat_id) {
    try {
      const user_data = await AppData.getUserData();
      const session_id = user_data.session_id;

      const response = await fetch(
        `${AppData.server}/chat/detail?chat_id=${chat_id}&session_id=${session_id}`,
        {method: 'get'},
      );
      const json = await response.json();

      // eslint-disable-next-line prettier/prettier
      json.who.avatar = `${AppData.server}/user/avatar?user_id=${json.who.user_id}&t=${Date.now()}`;
      json.user_id = user_data.user_id;

      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async start(screen) {
    try {
      const session_id = (await AppData.getUserData()).session_id;
      const who_id = screen.state.user.user_id;

      const response = await fetch(
        `${AppData.server}/chat/start?session_id=${session_id}&who_id=${who_id}`,
        {method: 'post'},
      );
      const json = await response.json();
      console.log(json);

      if (json.status) {
        screen.props.navigation.push('ViewChat', {chat_id: json.chat_id});
      } else {
        screen.setState({message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async delete(screen) {
    try {
      const session_id = (await AppData.getUserData()).session_id;
      const chat_id = screen.state.chat.chat_id;

      const response = await fetch(
        `${AppData.server}/chat/delete?session_id=${session_id}&chat_id=${chat_id}`,
        {method: 'post'},
      );
      const json = await response.json();
      console.log(json);

      if (json.status) {
        screen.props.navigation.goBack();
      } else {
        screen.setState({error_message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async read(chat_id) {
    try {
      const session_id = (await AppData.getUserData()).session_id;

      await fetch(
        `${AppData.server}/chat/read?session_id=${session_id}&chat_id=${chat_id}`,
        {method: 'post'},
      );
    } catch (exception) {
      console.log(exception);
    }
  }
}
