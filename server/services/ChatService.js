const ChatData = require('../data/ChatData');
const MessageData = require('../data/MessageData');
const UserData = require('../data/UserData');

module.exports = class MessageService {
	static connect(socket) {
		console.log('User connected to chat: ' + socket.id);

		socket.on('join-room', data => MessageService.joinRoom(socket, data));
		socket.on('leave-room', data => MessageService.leaveRoom(socket, data));
		socket.on('send-message', data => MessageService.sendMessage(socket, data));
	}

	static async joinRoom(socket, data) {
		const session_id = data.session_id;
		const chat_id = data.chat_id;
		const user_id = await UserData.verify(session_id);
		const check = await ChatData.check(user_id, chat_id);
		if (!check) {
			socket.emit('join-result', { status: false, message: 'Không có quyền tham gia đoạn chat này!' });
			return;
		}

		socket.join(data.chat_id);
		socket.emit('join-result', { status: true });
	}

	static async leaveRoom(socket, data) {
		socket.leave(data.chat_id);
	}

	static async sendMessage(socket, data) {
		const result = await MessageData.send(data);
		socket.emit('send-result', result);
		if (result.status) {
			socket.in(data.chat_id).emit('receive-message', result.sent_message);
		}
	}
};