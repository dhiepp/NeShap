import {io} from 'socket.io-client';
import * as AppData from './AppData';

export default class ChatClient {
  static async get() {
    return this.socket;
  }

  static async connect() {
    try {
      if (this.socket) {
        this.socket.connect();
      }

      this.socket = io(AppData.server, {path: '/realtime-chat'});
    } catch (exception) {
      console.log(exception);
    }
    return this.socket;
  }

  static async joinRoom(chat_id) {
    const session_id = (await AppData.getUserData()).session_id;
    this.socket.emit('join-room', {session_id: session_id, chat_id: chat_id});
    return this.socket;
  }

  static async leaveRoom(chat_id) {
    this.socket.emit('leave-room', {chat_id: chat_id});
  }

  static async send(chat_id, content) {
    const session_id = (await AppData.getUserData()).session_id;
    this.socket.emit('send-message', {
      session_id: session_id,
      chat_id: chat_id,
      content: content,
    });
  }
}
