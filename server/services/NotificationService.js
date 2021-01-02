const Neo4j = require('../data/Neo4j');

// Just funny name because Nodejs is dumb
module.exports = class NotificationService {
	static async from_post(user_id, post_id, type, amount) {
		try {
			let content = 'Đã tương tác với bài viết của bạn.';
			switch (type) {
			case 'like': content = `Và ${amount - 1} người khác đã thích bài viết của bạn.`; break;
			case 'comment': content = `Đã bình luận về bài viết của bạn (${amount} bình luận).`; break;
			}
			await Neo4j.run(`MATCH (a:User)-[:WRITES_POST]->(p:Post {post_id: $postParam}) WHERE NOT a.user_id = $userParam 
				MERGE (a)-[:HAS_NOTIFICATION]->(n:Notification {type: $typeParam})-[:LINKS_TO]->(p) 
				SET n.notification_id = randomUUID(), n.time = datetime(), n.read = false, n.content = $contentParam WITH n 
				MATCH (u:User {user_id: $userParam}) OPTIONAL MATCH (n)-[m:MENTIONS]->(:User) DELETE m CREATE (n)-[:MENTIONS]->(u)`,
			{ postParam: post_id, userParam: user_id, typeParam: type, contentParam: content });
		}
		catch (error) {
			console.log(error);
		}
	}

	static async from_friend(user_id, friend_id) {
		try {
			const content = 'Đã gửi cho bạn lời mời kết bạn.';
			await Neo4j.run(`MATCH (f:User {user_id: $friendParam}) OPTIONAL MATCH (u:User {user_id: $userParam}) 
				MERGE (f)-[:HAS_NOTIFICATION]->(n:Notification {type: 'friend'})-[:MENTIONS]->(u) 
				SET n.notification_id = randomUUID(), n.time = datetime(), n.read = false, n.content = $contentParam`,
			{ friendParam: friend_id, userParam: user_id, contentParam: content });
		}
		catch (error) {
			console.log(error);
		}
	}
};