const Neo4j = require('./Neo4j');

const UserData = require('./UserData');

module.exports = class NotificationData {
	static async badge(query) {
		try {
			const session_id = query.session_id;

			const user_id = await UserData.verify(session_id);
			if (!user_id) return { notifications: 0, chats: 0 };

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) 
				OPTIONAL MATCH (u)-[:HAS_NOTIFICATION]->(n:Notification) WHERE n.read = false
				OPTIONAL MATCH (u)<-[c:HAS_MEMBER]-(:Chat) WHERE c.read = false
				RETURN count(n) as nc, count(c) as cc`, { userParam: user_id });
			const record = result.records[0];

			const notifications = Neo4j.int(record.get('nc')).toInt();
			const chats = Neo4j.int(record.get('cc')).toInt();
			return { notifications: notifications, chats: chats };
		}
		catch (error) {
			console.log(error);
			return { notifications: 0, chats: 0 };
		}
	}

	static async list(query) {
		try {
			const session_id = query.session_id;
			const page = query.page;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}

			const skip = Neo4j.int((page - 1) * 10);
			const limit = Neo4j.int(10);
			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})-[:HAS_NOTIFICATION]-(n:Notification)
				OPTIONAL MATCH (n)-[:MENTIONS]->(m:User) OPTIONAL MATCH (n)-[:LINKS_TO]->(p:Post) 
				RETURN n, m, p ORDER BY n.time DESC SKIP $skip LIMIT $limit`,
			{ userParam: user_id, skip: skip, limit: limit });
			const records = result.records;

			const notifications = records.map(record => {
				const notification = record.get('n')?.properties;
				const mention = record.get('m')?.properties;
				const post = record.get('p')?.properties;
				notification.mention = mention ? { user_id: mention.user_id, name: mention.name } : { name: '[đã xóa]' };
				notification.link = post?.post_id;
				notification.time = notification.time.toString();
				return notification;
			});
			return notifications;
		}
		catch (error) {
			console.log(error);
			return [];
		}
	}

	static async read(query) {
		try {
			const session_id = query.session_id;
			const notification_id = query.notification_id;

			if (!notification_id) return { status: false };
			const user_id = await UserData.verify(session_id);
			if (!user_id) return { status: false };

			const result = await Neo4j.run(`MATCH (:User {user_id: $userParam})-[:HAS_NOTIFICATION]->
				(:Notification {notification_id: $notificationParam}) SET n.read = true`,
			{ userParam: user_id, notificationParam: notification_id });
			if (result.summary.counters.updates().propertiesSet == 0) throw 'Notification Read failed';
			return { status: true };
		}
		catch(error) {
			console.log(error);
			return { status: false };
		}
	}
};