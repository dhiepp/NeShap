import * as AppData from '../AppData';
import TimeUtils from '../utils/TimeUtils';

export default class NotificationController {
  static async badge() {
    try {
      const session_id = (await AppData.getUserData()).session_id;

      const response = await fetch(
        `${AppData.server}/notification/badge?session_id=${session_id}`,
        {method: 'get'},
      );
      let json = await response.json();
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static icon(type) {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'message';
      case 'friend':
        return 'account-multiple';
      default:
        return 'earth';
    }
  }

  static async list(page) {
    try {
      const session_id = (await AppData.getUserData()).session_id;

      const response = await fetch(
        `${AppData.server}/notification/list?session_id=${session_id}&page=${page}`,
        {method: 'get'},
      );
      let json = await response.json();

      const time = Date.now();
      json = json.map((notification) => {
        notification.mention.avatar = `${AppData.server}/user/avatar?user_id=${notification.mention.user_id}&t=${time}`;
        notification.time = TimeUtils.translate(notification.time);
        notification.icon = this.icon(notification.type);
        return notification;
      });
      return json;
    } catch (exception) {
      console.log(exception);
      return [];
    }
  }

  static async read(notification_id) {
    try {
      const session_id = (await AppData.getUserData()).session_id;

      await fetch(
        `${AppData.server}/notification/read?session_id=${session_id}&notification_id=${notification_id}`,
        {method: 'post'},
      );
    } catch (exception) {
      console.log(exception);
    }
  }
}
