const MessageService = require('../services/MessageService');
const ChatData = require('./ChatData');
const Neo4j = require('./Neo4j');

const UserData = require('./UserData');

module.exports = class MessageData {
	static async list(query) {
		try {
			const session_id = query.session_id;
			const chat_id = query.chat_id;
			const page = query.page;

			const user_id = await UserData.verify(session_id);
			if (!user_id) return [];
			if (!await ChatData.check(user_id, chat_id)) return [];

			const skip = Neo4j.int((page - 1) * 10);
			const limit = Neo4j.int(10);
			const result = await Neo4j.run(`MATCH (:Chat {chat_id: $chatParam})-[:HAS_MESSAGE]->(m:Message)<-[:SENDS_MESSAGE]-(a:User) 
				RETURN m, a ORDER BY m.time DESC SKIP $skip LIMIT $limit`,
			{ chatParam: chat_id, skip: skip, limit: limit });
			const records = result.records;

			const messages = records.map(record => {
				const message = record.get('m').properties;
				const author = record.get('a')?.properties;
				message.author = author ? { user_id : author.user_id, name: author.name } : { name: '[đã xóa]' };
				message.time = message.time.toString();
				return message;
			});
			return messages;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}

	static async send(data) {
		try {
			const session_id = data.session_id;
			const chat_id = data.chat_id;
			const content = data.content;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!await ChatData.check(user_id, chat_id)) {
				return { status: false, message: 'Không có quyền gửi tin nhắn tại đây!' };
			}
			if (!content) {
				return { status: false, message: 'Yêu cầu nhập nội dung tin nhắn!' };
			}

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})<-[:HAS_MEMBER]-(c:Chat {chat_id: $chatParam}) 
				CREATE (u)-[:SENDS_MESSAGE]->(m:Message {message_id: randomUUID(), content: $contentParam, time: datetime()})
				<-[:HAS_MESSAGE]-(c) SET c.last = datetime() WITH u, m, c 
				OPTIONAL MATCH (c)-[r:HAS_MEMBER]->(:User) SET r.read = false RETURN u, m`,
			{ userParam: user_id, chatParam: chat_id, contentParam: content });
			const record = result.records[0];
			if (!record) throw 'Message Write failed';

			const message = record.get('m').properties;
			const author = record.get('u')?.properties;
			message.author = author ? { user_id : author.user_id, name: author.name } : { name: '[đã xóa]' };
			message.time = message.time.toString();
			MessageService.update(chat_id, message);

			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể gửi tin nhắn!' };
		}
	}
};
