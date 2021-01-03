const Neo4j = require('./Neo4j');

const UserData = require('./UserData');

module.exports = class ChatData {
	static async check(user_id, chat_id) {
		if (!user_id || !chat_id) return false;

		const result = await Neo4j.run(`MATCH (:User {user_id: $userParam})<-[m:HAS_MEMBER]-(:Chat {chat_id: $chatParam}) 
			RETURN m LIMIT 1`, { userParam: user_id, chatParam: chat_id });
		const record = result.records[0];
		if (record?.get('m')) return true;
		return false;
	}

	static async list(query) {
		try {
			const session_id = query.session_id;
			const page = query.page;

			const user_id = await UserData.verify(session_id);
			if (!user_id) return [];

			const skip = Neo4j.int((page - 1) * 10);
			const limit = Neo4j.int(10);
			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})<-[m:HAS_MEMBER]-(c:Chat)
				OPTIONAL MATCH (w:User)<-[:HAS_MEMBER]-(c) WHERE NOT w.user_id = $userParam 
				RETURN c, w, m.read ORDER BY c.last DESC SKIP $skip LIMIT $limit`,
			{ userParam: user_id, skip: skip, limit: limit });
			const records = result.records;

			const chats = records.map(record => {
				const chat = record.get('c')?.properties;
				const who = record.get('w')?.properties;
				chat.read = record.get('m.read');
				chat.who = who ? { user_id : who.user_id, name: who.name } : { name: '[đã xóa]' };
				chat.last = chat.last.toString();
				return chat;
			});
			return chats;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}

	static async detail(query) {
		try {
			const session_id = query.session_id;
			const chat_id = query.chat_id;

			if (!chat_id) return null;
			const user_id = await UserData.verify(session_id);
			if (!user_id) return null;

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})<-[m:HAS_MEMBER]-(c:Chat {chat_id: $chatParam}) 
				OPTIONAL MATCH (w:User)<-[:HAS_MEMBER]-(c) WHERE NOT w.user_id = $userParam RETURN c, w`,
			{ userParam: user_id, chatParam: chat_id });
			const record = result.records[0];
			if (!record) return null;

			const chat = record.get('c')?.properties;
			const who = record.get('w')?.properties;
			chat.who = who ? { user_id : who.user_id, name: who.name } : { name: '[đã xóa]' };
			return chat;
		}
		catch(error) {
			console.log(error);
			return null;
		}
	}

	static async read(query) {
		try {
			const session_id = query.session_id;
			const chat_id = query.chat_id;

			if (!chat_id) return { status: false };
			const user_id = await UserData.verify(session_id);
			if (!user_id) return { status: false };

			const result = await Neo4j.run(`MATCH (:User {user_id: $userParam})<-[m:HAS_MEMBER]-(:Chat {chat_id: $chatParam}) 
				SET m.read = true`, { userParam: user_id, chatParam: chat_id });
			if (result.summary.counters.updates().propertiesSet == 0) throw 'Chat Read failed';
			return { status: true };
		}
		catch(error) {
			console.log(error);
			return { status: false };
		}
	}

	static async start(query) {
		try {
			const session_id = query.session_id;
			const who_id = query.who_id;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})<-[:FRIENDS]->(w:User {user_id: $whoParam})
				MERGE (u)<-[m1:HAS_MEMBER]-(c:Chat)-[m2:HAS_MEMBER]->(w) 
				ON CREATE SET c.chat_id = randomUUID(), c.last = datetime(), m1.read = false, m2.read = false RETURN c.chat_id`,
			{ userParam: user_id, whoParam: who_id });
			const chat_id = result.records[0]?.get('c.chat_id');
			if (!chat_id) throw 'Chat Start failed';

			return { status: true, chat_id: chat_id };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể bắt đầu đoạn chat!' };
		}
	}

	static async delete(query) {
		try {
			const session_id = query.session_id;
			const chat_id = query.chat_id;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!await this.check(user_id, chat_id)) {
				return { status: false, message: 'Không có quyền xóa hoặc đoạn chat không tồn tại!' };
			}

			const result = await Neo4j.run(`MATCH (c:Chat {chat_id: $chatParam})-[:HAS_MESSAGE]->(m:Message) 
				DETACH DELETE c, m`, { chatParam: chat_id });
			if (result.summary.counters.updates().deletedNodes == 0) throw 'Chat Delete Failed!';

			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể xóa đoạn chat!' };
		}
	}
};
