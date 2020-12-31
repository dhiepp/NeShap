const Neo4j = require('./Neo4j');
const sharp = require('sharp');
const fs = require('fs');

const NotificationService = require('./NotificationService');

module.exports = class UserData {
	static async getByUserID(user_id) {
		if (!user_id) return null;
		const result = await Neo4j.run('MATCH (u:User {user_id: $userParam}) RETURN u LIMIT 1', { userParam: user_id });
		return result.records[0]?.get('u')?.properties;
	}

	static async getByName(name) {
		if (!name) return null;
		const result = await Neo4j.run('MATCH (u:User {name: $nameParam}) RETURN u LIMIT 1', { nameParam: name });
		return result.records[0]?.get('u')?.properties;
	}

	static async verify(session_id) {
		if (!session_id) return false;

		const result = await Neo4j.run('MATCH (u:User)-[:HAS_SESSION]->(s:Session {session_id: $sessionParam}) RETURN u.user_id LIMIT 1',
			{ sessionParam: session_id });
		return result.records[0]?.get('u.user_id');
	}

	static async verify_admin(session_id) {
		if (!session_id) return false;

		const result = await Neo4j.run(`MATCH (u:User {role: 1})-[:HAS_SESSION]->(s:Session {session_id: $sessionParam}) 
			RETURN u.user_id LIMIT 1`, { sessionParam: session_id });
		return result.records[0]?.get('u.user_id');
	}

	static async register(query) {
		try {
			const name = query.name;
			const password = query.password;

			if (!name || !password) {
				return { status: false, message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!name.match(/^[0-9a-zA-Z_]{3,20}$/)) {
				return { status: false, message: 'Tên đăng nhập không hợp lệ!' };
			}
			if (await this.getByName(name)) {
				return { status: false, message: 'Tên tài khoản đã tồn tại!' };
			}

			const result = await Neo4j.run(`CREATE (u:User {user_id:randomUUID(), name:$nameParam, password: $passwordParam, role: 0})
				-[:HAS_SESSION]->(s:Session {session_id: randomUUID(), time: datetime()}) RETURN u.user_id, s.session_id, u.role`,
			{ nameParam: name, passwordParam: password });
			const record = result.records[0];
			if (!record) throw 'User Register failed';

			const user_id = record.get('u.user_id');
			const session_id = record.get('s.session_id');
			const role = Neo4j.int(record.get('u.role')).toInt();
			return { status: true, user_id: user_id, session_id: session_id, role: role };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể tạo tài khoản!' };
		}
	}

	static async login(query) {
		try {
			const name = query.name;
			const password = query.password;

			if (!name || !password) {
				return { status: false, message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!name.match(/^[0-9a-zA-Z]{3,20}$/)) {
				return { status: false, message: 'Tên tài khoản không hợp lệ!' };
			}

			const result = await Neo4j.run(`MATCH (u:User {name:$nameParam, password: $passwordParam})-[:HAS_SESSION]->(s:Session) 
				RETURN u.user_id, s.session_id, u.role LIMIT 1`, { nameParam: name, passwordParam: password });
			const record = result.records[0];
			if (!record) {
				return { status: false, message: 'Sai tên tài khoản hoặc mật khẩu!' };
			}

			const user_id = record.get('u.user_id');
			const session_id = record.get('s.session_id');
			const role = Neo4j.int(record.get('u.role')).toInt();
			return { status: true, user_id: user_id, session_id: session_id, role: role };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể đăng nhập!' };
		}
	}

	static async profile(query) {
		try {
			const user_id = query.user_id;
			const viewer_id = query.viewer_id;

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) OPTIONAL MATCH (v:User {user_id: $viewerParam}) 
				OPTIONAL MATCH (u)-[f1:FRIENDS]->(v) OPTIONAL MATCH (u)<-[f2:FRIENDS]-(v) RETURN u, f1, f2`,
			{ userParam: user_id, viewerParam: viewer_id });
			const record = result.records[0];
			if (!record) throw 'User Profile not found';

			const user = record.get('u').properties;
			const f1 = record.get('f1') ? true : false;
			const f2 = record.get('f2') ? true : false;
			const role = Neo4j.int(user.role)?.toInt();
			return { user: { user_id: user.user_id, name: user.name, role: role }, f1: f1, f2: f2 };
		}
		catch (exception) {
			console.log(exception);
			return null;
		}
	}

	static async edit(data_string, avatar) {
		try {
			const data = JSON.parse(data_string);
			const session_id = data.session_id;
			const name = data.name ? data.name.toLowerCase() : undefined;
			const password = data.password;

			const user_id = await this.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!name && !password && !avatar) {
				return { status: false, message: 'Thông tin cá nhân không thay đổi!' };
			}
			if (name) {
				if (!name.match(/^[0-9a-zA-Z]{1,20}$/)) {
					return { status: false, message: 'Tên đăng nhập không hợp lệ!' };
				}
				if (await this.getByName(name)) {
					return { status: false, message: 'Tên tài khoản đã được sử dụng!' };
				}
				const result = await Neo4j.run('MATCH (u:User {user_id:$userParam}) SET u.name = $nameParam',
					{ userParam: user_id, nameParam: name });
				if (result.summary.counters.updates().propertiesSet == 0) throw 'User Edit name failed';
			}
			if (password) {
				const result = await Neo4j.run('MATCH (u:User {user_id:$userParam}) SET u.password = $passwordParam',
					{ userParam: user_id, passwordParam: password });
				if (result.summary.counters.updates().propertiesSet == 0) throw 'User edit password failed';
			}
			if (avatar) {
				sharp(avatar).resize({ width: 256, fit: 'cover', position: 'center', withoutEnlargement: true })
					.jpeg({ quality: 80, force: true }).toFile(`./images/avatar/${user_id}.jpg`);
			}

			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể sửa thông tin cá nhân!' };
		}
	}

	static async friend(query) {
		try {
			const session_id = query.session_id;
			const friend_id = query.friend_id ? query.friend_id : null;

			const user_id = await this.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (user_id == session_id) throw 'User Friend to self!';

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) MATCH (f:User {user_id: $friendParam})
				OPTIONAL MATCH (u)<-[f1:FRIENDS]-(f) MERGE (u)-[:FRIENDS]->(f) RETURN f1`,
			{ userParam: user_id, friendParam: friend_id });
			if (result.summary.counters.updates().relationshipsCreated == 0) throw 'User Friend failed!';

			NotificationService.from_friend(user_id, friend_id);

			const f1 = result.records[0]?.get('f1') ? true : false;
			return { status: true, f1: f1, f2: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể kết bạn!' };
		}
	}

	static async unfriend(query) {
		try {
			const session_id = query.session_id;
			const friend_id = query.friend_id ? query.friend_id : null;

			const user_id = await this.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (user_id == session_id) throw 'User Unfriend to self!';

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})-[r:FRIENDS]-(f:User {user_id: $friendParam})
				DELETE r`, { userParam: user_id, friendParam: friend_id });
			if (result.summary.counters.updates().relationshipsDeleted == 0) throw 'User Unfriend failed!';

			return { status: true, f1: false, f2: false };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể hủy kết bạn!' };
		}
	}

	static async list(query) {
		try {
			const session_id = query.session_id;
			const page = query.page;

			const user_id = await this.verify_admin(session_id);
			if (!user_id) throw 'List User failed: Invalid session or non admin';

			const skip = Neo4j.int((page - 1) * 10);
			const limit = Neo4j.int(10);
			const result = await Neo4j.run('MATCH (u:User) RETURN u ORDER BY u.role DESC, u.name SKIP $skip LIMIT $limit', { skip: skip, limit: limit });

			const users = result.records.map(record => {
				const user = record.get('u')?.properties;
				const role = Neo4j.int(user.role)?.toInt();
				return { user_id: user.user_id, name: user.name, role: role };
			});
			return users;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}

	static async delete(query) {
		try {
			const session_id = query.session_id;
			const delete_id = query.delete_id;

			const user_id = await this.verify_admin(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			const result = await Neo4j.run('MATCH (u:User {user_id: $deleteParam}) DETACH DELETE u', { deleteParam: delete_id });
			if (result.summary.counters.updates().deletedNodes == 0) {
				return { status: false, message: 'Tài khoản không bị xóa!' };
			}

			fs.unlink(`./images/avatar/${delete_id}.jpg`, () => null);
			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể xóa tài khoản!' };
		}
	}

};
