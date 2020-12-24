const Neo4j = require('./Neo4j');

const UserData = require('./UserData');

module.exports = class CommentData {
	static async list(query) {
		try {
			const post_id = query.post_id;

			const result = await Neo4j.run(`MATCH (p:Post {post_id: $postParam})-[:HAS_COMMENT]-(c:Comment)
				OPTIONAL MATCH (a:User)-[:WRITES_COMMENT]->(c) RETURN c, a ORDER BY c.time DESC`,
			{ postParam: post_id });
			const records = result.records;

			const comments = records.map(record => {
				const comment = record.get('c')?.properties;
				const author = record.get('a')?.properties;
				comment.author = author ? { user_id : author.user_id, name: author.name } : null;
				comment.time = comment.time.toString();
				return comment;
			});
			return comments;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}

	static async check(user_id, comment_id) {
		if (!user_id || !comment_id) return false;

		const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})
			OPTIONAL MATCH (u)-[r:WRITES_COMMENT]->(c:Comment {comment_id: $commentParam}) 
			RETURN u.role, r LIMIT 1`, { userParam: user_id, commentParam: comment_id });
		const record = result.records[0];
		if (record.get('u.role') > 0) return true;
		if (record.get('r')) return true;
		return false;
	}

	static async write(query) {
		try {
			const session_id = query.session_id;
			const post_id = query.post_id;
			const content = query.content;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!content) {
				return { status: false, message: 'Yêu cầu nhập nội dung bình luận!' };
			}

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) MATCH (p:Post {post_id: $postParam})
				CREATE (u)-[:WRITES_COMMENT]->(c:Comment {comment_id: randomUUID(), content: $contentParam, time: datetime()})
				<-[:HAS_COMMENT]-(p) RETURN c.comment_id`,
			{ userParam: user_id, postParam: post_id, contentParam: content });
			const comment_id = result.records[0]?.get('c.comment_id');
			if (!comment_id) throw 'Comment Write failed';

			return { status: true, comment_id: comment_id };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể viết bình luận!' };
		}
	}

	static async delete(query) {
		try {
			const session_id = query.session_id;
			const comment_id = query.comment_id;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!await this.check(user_id, comment_id)) {
				return { status: false, message: 'Không có quyền xóa bình luận!' };
			}

			const result = await Neo4j.run('MATCH (c:Comment {comment_id: $commentParam}) DETACH DELETE c',
				{ commentParam: comment_id });
			if (result.summary.counters.updates().deletedNodes == 0) {
				return { status: false, message: 'Bình luận không bị xóa!' };
			}

			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể xóa bình luận!' };
		}
	}
};
