const Neo4j = require('./Neo4j');
const sharp = require('sharp');
const fs = require('fs');

const UserData = require('./UserData');

module.exports = class PostData {
	static async getByPostID(post_id) {
		if (!post_id) return null;
		const result = await Neo4j.run('MATCH (u:User)-[:WRITES_POST]->(p:Post {post_id: $postParam}) RETURN p LIMIT 1',
			{ postParam: post_id });
		return result.records[0]?.get('p')?.properties;
	}

	static async check(user_id, post_id) {
		if (!user_id || !post_id) return false;

		const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})
			OPTIONAL MATCH (u)-[r:WRITES_POST]->(p:Post {post_id: $postParam}) 
			RETURN u.role, r LIMIT 1`, { userParam: user_id, postParam: post_id });
		const record = result.records[0];
		if (record.get('u.role') > 0) return true;
		if (record.get('r')) return true;
		return false;
	}

	static async write(data_string, cover) {
		try {
			const data = JSON.parse(data_string);
			const session_id = data.session_id;
			const title = data.title;
			const content = data.content;
			const tags = data.tags;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!title || !content) {
				return { status: false, message: 'Yêu cầu nhập tiêu đề và nội dung bài viết!' };
			}
			if (tags) {
				for (const tag of tags) {
					if (!tag.match(/^[0-9a-zA-Z]{3,20}$/)) {
						return { status: false, message: 'Tag không hợp lệ!' };
					}
				}
			}

			const has_cover = cover ? true : false;
			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) CREATE (u)-[:WRITES_POST]->(p:Post 
				{post_id: randomUUID(), title: $titleParam, content: $contentParam, time: datetime(),
				has_cover: $coverParam, tags: $tagsParam, likes: 0, comments: 0}) RETURN p.post_id`,
			{ userParam: user_id, titleParam: title, contentParam: content, coverParam: has_cover, tagsParam: tags });
			const post_id = result.records[0]?.get('p.post_id');
			if (!post_id) throw 'Post Write failed';

			if (cover) {
				await sharp(cover)
					.resize({ width: 1280, height: 720, fit: 'contain', position: 'center', background: '#ffffff', withoutEnlargement: true })
					.jpeg({ quality: 50, force: true }).toFile(`./images/cover/${post_id}.jpg`);
			}

			return { status: true, post_id: post_id };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể viết bài mới!' };
		}
	}

	static async edit(data_string, cover) {
		try {
			const data = JSON.parse(data_string);
			const session_id = data.session_id;
			const post_id = data.post_id;
			const title = data.title;
			const content = data.content;
			const tags = data.tags;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!await this.check(user_id, post_id)) {
				return { status: false, message: 'Không có quyền sửa hoặc bài viết không tồn tại!' };
			}
			if (!title || !content) {
				return { status: false, message: 'Yêu cầu nhập tiêu đề và nội dung bài viết!' };
			}
			if (tags) {
				for (const tag of tags) {
					if (!tag.match(/^[0-9a-zA-Z]{3,20}$/)) {
						return { status: false, message: 'Tag không hợp lệ!' };
					}
				}
			}

			const edit_cover = cover ? ' p.has_cover = true,' : '';
			const result = await Neo4j.run(`MATCH (p:Post {post_id: $postParam}) SET p.title = $titleParam, 
				p.content = $contentParam,${edit_cover} p.tags = $tagsParam RETURN p.post_id`,
			{ postParam: post_id, titleParam: title, contentParam: content, tagsParam: tags });
			if (result.summary.counters.updates().propertiesSet == 0) throw 'Post Edit failed';

			if (cover) {
				await sharp(cover)
					.resize({ width: 1280, height: 720, fit: 'contain', position: 'center', background: '#ffffff', withoutEnlargement: true })
					.jpeg({ quality: 50, force: true }).toFile(`./images/cover/${post_id}.jpg`);
			}

			return { status: true, post_id: post_id };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể sửa bài viết!' };
		}
	}

	static async delete(query) {
		try {
			const session_id = query.session_id;
			const post_id = query.post_id;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!await this.check(user_id, post_id)) {
				return { status: false, message: 'Không có quyền xóa hoặc bài viết không tồn tại!' };
			}

			const result = await Neo4j.run(`MATCH (p:Post {post_id: $postParam}) 
				OPTIONAL MATCH (p)-[:HAS_COMMENT]-(c:Comment) DETACH DELETE p, c`,
			{ postParam: post_id });
			if (result.summary.counters.updates().deletedNodes == 0) {
				return { status: false, message: 'Bài viết không bị xóa!' };
			}

			fs.unlink(`./images/cover/${post_id}.jpg`, () => null);
			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể xóa bài viết!' };
		}
	}

	static async list(query) {
		try {
			const mode = query.mode;
			const page = query.page;
			const user_id = query.user_id;
			const key = query.key?.toLowerCase();

			const skip = Neo4j.int((page - 1) * 10);
			const limit = Neo4j.int(10);
			let records;
			switch (mode) {
			case 'new': {
				const result = await Neo4j.run(`MATCH (p:Post) OPTIONAL MATCH (a:User)-[:WRITES_POST]->(p) 
					RETURN p, a ORDER BY p.time DESC SKIP $skip LIMIT $limit`,
				{ skip: skip, limit: limit });
				records = result.records;
				break;
			}
			case 'hot': {
				const time = new Date();
				time.setDate(time.getDate() - 30);
				const result = await Neo4j.run(`MATCH (p:Post) WHERE p.time > datetime($timeParam) 
					OPTIONAL MATCH (a:User)-[:WRITES_POST]->(p) 
					RETURN p, a ORDER BY p.likes + p.comments DESC SKIP $skip LIMIT $limit`,
				{ timeParam: time.toISOString(), skip: skip, limit: limit });
				records = result.records;
				break;
			}
			case 'friend': {
				if (!user_id) return [];
				const result = await Neo4j.run(`MATCH (:User {user_id: $userParam})-[:FRIENDS]->(a:User)-[:WRITES_POST]->(p:Post) 
					RETURN p, a ORDER BY p.time DESC SKIP $skip LIMIT $limit`,
				{ userParam: user_id, skip: skip, limit: limit });
				records = result.records;
				break;
			}
			case 'search': {
				if (key.length < 3) return[];
				const result = await Neo4j.run(`MATCH (p:Post) WHERE toLower(p.title) CONTAINS $keyParam 
					OR toLower(p.content) CONTAINS $keyParam OPTIONAL MATCH (a:User)-[:WRITES_POST]->(p) 
					RETURN p, a ORDER BY p.time DESC SKIP $skip LIMIT $limit`,
				{ keyParam: key, skip: skip, limit: limit });
				records = result.records;
				break;
			}
			case 'tag': {
				if (!key.match(/^[0-9a-zA-Z]{3,20}$/)) return [];
				const result = await Neo4j.run(`MATCH (p:Post) WHERE $keyParam IN p.tags OPTIONAL MATCH (a:User)-[:WRITES_POST]->(p) 
					RETURN p, a ORDER BY p.time DESC SKIP $skip LIMIT $limit`,
				{ keyParam: key, skip: skip, limit: limit });
				records = result.records;
				break;
			}
			case 'profile': {
				if (!user_id) return [];
				const result = await Neo4j.run(`MATCH (a:User {user_id: $userParam})-[:WRITES_POST]->(p:Post) 
					RETURN p, a ORDER BY p.time DESC SKIP $skip LIMIT $limit`,
				{ userParam: user_id, skip: skip, limit: limit });
				records = result.records;
				break;
			}
			default: return [];
			}

			const posts = records.map(record => {
				const post = record.get('p')?.properties;
				const author = record.get('a')?.properties;
				post.author = author ? { user_id : author.user_id, name: author.name } : { name: '[đã xóa]' };
				post.likes = Neo4j.int(post.likes).toInt();
				post.comments = Neo4j.int(post.comments).toInt();
				post.time = post.time.toString();
				return post;
			});
			return posts;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}

	static async detail(query) {
		try {
			const post_id = query.post_id ? query.post_id : null;
			const viewer_id = query.viewer_id ? query.viewer_id : null;

			const result = await Neo4j.run(`MATCH (p:Post {post_id: $postParam}) 
				OPTIONAL MATCH (a:User)-[:WRITES_POST]->(p) OPTIONAL MATCH (v:User {user_id: $viewerParam})-[:LIKES]->(p) 
				RETURN p, a, v`,
			{ postParam: post_id, viewerParam: viewer_id });
			const record = result.records[0];
			if (!record) throw 'Post not found';

			const post = record.get('p')?.properties;
			const author = record.get('a')?.properties;
			post.author = author ? { user_id : author.user_id, name: author.name } : { name: '[đã xóa]' };
			post.likes = Neo4j.int(post.likes).toInt();
			post.comments = Neo4j.int(post.comments).toInt();
			post.time = post.time.toString();
			post.liked = record.get('v') ? true : false;
			return post;
		}
		catch (exception) {
			console.log(exception);
			return null;
		}
	}

	static async like(query) {
		try {
			const session_id = query.session_id;
			const post_id = query.post_id ? query.post_id : null;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) MATCH (p:Post {post_id: $postParam}) 
				MERGE (u)-[r:LIKES]->(p) ON CREATE SET p.likes = p.likes + 1 RETURN p.likes`, { userParam: user_id, postParam: post_id });
			if (result.summary.counters.updates().relationshipsCreated == 0) throw 'Post like failed!';

			const likes = Neo4j.int(result.records[0]?.get('p.likes')).toInt();
			return { status: true, likes: likes };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể thích bài viết!' };
		}
	}

	static async unlike(query) {
		try {
			const session_id = query.session_id;
			const post_id = query.post_id ? query.post_id : null;

			const user_id = await UserData.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})-[r:LIKES]->(p:Post {post_id: $postParam}) 
				DELETE r SET p.likes = p.likes - 1 RETURN p.likes`, { userParam: user_id, postParam: post_id });
			if (result.summary.counters.updates().relationshipsDeleted == 0) throw 'Post unlike failed!';

			const likes = Neo4j.int(result.records[0]?.get('p.likes')).toInt();
			return { status: true, likes: likes };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể bỏ thích bài viết!' };
		}
	}

};