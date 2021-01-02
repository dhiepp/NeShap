const ChatData = require('../data/ChatData');
const UserData = require('../data/UserData');

module.exports = class MessageService {
	static start(io) {
		this.io = io;
		io.on('connect', this.connect);
	}

	static connect(socket) {
		console.log('User connected to chat: ' + socket.id);

		socket.on('auth', data => MessageService.check(socket, data));
	}

	static update(chat_id, message) {
		this.io.in(chat_id).emit('message', message);
	}

	static async check(socket, data) {
		const session_id = data.session_id;
		const chat_id = data.chat_id;
		const user_id = await UserData.verify(session_id);
		const check = await ChatData.check(user_id, chat_id);
		if (!check) {
			socket.disconnect(true);
		}
		socket.join(data.chat_id);
	}

};