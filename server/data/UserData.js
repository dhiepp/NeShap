const Neo4j = require('./Neo4j');
const sharp = require('sharp');

module.exports = class UserData {
	static async getByUserID(user_id) {
		const result = await Neo4j.run('MATCH (u:User {user_id: $userParam}) RETURN u LIMIT 1', { userParam: user_id });
		return result.records[0]?.get('u')?.properties;
	}

	static async getByName(name) {
		const result = await Neo4j.run('MATCH (u:User {name: $nameParam}) RETURN u LIMIT 1', { nameParam: name });
		return result.records[0]?.get('u')?.properties;
	}

	static async verify(session_id) {
		if (!session_id) return false;

		const result = await Neo4j.run('MATCH (u:User)-[:HAS_SESSION]->(s:Session {session_id: $sessionParam}) RETURN u.user_id LIMIT 1',
			{ sessionParam: session_id });
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
				-[:HAS_SESSION]->(s:Session {session_id: randomUUID(), time: datetime()}) RETURN u.user_id, s.session_id`,
			{ nameParam: name, passwordParam: password });
			const record = result.records[0];
			if (!record) throw 'User Register failed';

			const user_id = record.get('u.user_id');
			const session_id = record.get('s.session_id');
			return { status: true, user_id: user_id, session_id: session_id };
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
				RETURN u.user_id, s.session_id LIMIT 1`, { nameParam: name, passwordParam: password });
			const record = result.records[0];
			if (!record) {
				return { status: false, message: 'Sai tên tài khoản hoặc mật khẩu!' };
			}

			const user_id = record.get('u.user_id');
			const session_id = record.get('s.session_id');
			return { status: true, user_id: user_id, session_id: session_id };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể đăng nhập!' };
		}
	}

	static async profile(query) {
		try {
			const user_id = query.user_id;
			const viewer_id = query.viewer_id ? query.viewer_id : null;

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) OPTIONAL MATCH (v:User {user_id: $viewerParam}) 
				OPTIONAL MATCH (u)-[f1:FRIENDS]->(v) OPTIONAL MATCH (u)<-[f2:FRIENDS]-(v) RETURN u, f1, f2`,
			{ userParam: user_id, viewerParam: viewer_id });
			const record = result.records[0];
			if (!record) throw 'User Profile not found';

			const user = record.get('u').properties;
			const f1 = record.get('f1') ? true : false;
			const f2 = record.get('f2') ? true : false;
			return { name: user.name, f1: f1, f2: f2 };
		}
		catch (exception) {
			console.log(exception);
			return null;
		}
	}

	static async edit(data, avatar) {
		try {
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

	// static async perm(userid, checkid) {
	// 	const user = await this.getByID(userid);
	// 	const check = await this.checkExistByID(userid);
	// 	// Invalid user
	// 	if (!user || !check) return 0;
	// 	// The same user
	// 	if (userid === checkid) return 2;
	// 	// Admin
	// 	if (user.role === 1) return 3;
	// 	// Normal user
	// 	return 1;
	// }


	// static async list(query) {
	// 	try {
	// 		const adminid = query.adminid;
	// 		const page = query.page;
	// 		const userCollection = await Connection.getCollection('user');

	// 		const admin = await this.getByID(adminid);
	// 		if (!admin || admin.role < 1) {
	// 			return null;
	// 		}
	// 		const cursor = await userCollection.find({},
	// 			{ projection: { _id: true }, sort: { name: 1 }, skip: 10 * (page - 1), limit: 10 });
	// 		const result = cursor.toArray();
	// 		return result;
	// 	}
	// 	catch (exception) {
	// 		console.log(exception);
	// 		return [];
	// 	}
	// }


	// static async delete(query) {
	// 	try {
	// 		const adminid = query.adminid;
	// 		const deleteid = query.deleteid;

	// 		if (UserData.checkPerm(adminid, deleteid) < 3) {
	// 			return { status: 'fail', message: 'Không có quyền xóa tài khoản!' };
	// 		}

	// 		const userCollection = await Connection.getCollection('user');
	// 		const result = await userCollection.deleteOne({ _id: new ObjectID(deleteid) });
	// 		if (result.modifiedCount === 0) {
	// 			return { status: 'fail', message: 'Tài khoản không bị xóa!' };
	// 		}
	// 		return { status: 'success' };
	// 	}
	// 	catch (exception) {
	// 		console.log(exception);
	// 		return { status: 'fail', message: 'Không thể xóa tài khoản!' };
	// 	}
	// }

	static async friend(query) {
		try {
			const session_id = query.session_id;
			const friend_id = query.friend_id;

			const user_id = await this.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (user_id == session_id) throw 'User Friend to self!';

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam}) MATCH (f:User {user_id: $friendParam})
				MERGE (u)-[r:FRIENDS]->(f)`, { userParam: user_id, friendParam: friend_id });
			if (result.summary.counters.updates().relationshipsCreated == 0) throw 'User Friend failed!';

			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể kết bạn!' };
		}
	}

	static async unfriend(query) {
		try {
			const session_id = query.session_id;
			const friend_id = query.friend_id;

			const user_id = await this.verify(session_id);
			if (!user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (user_id == session_id) throw 'User Unfriend to self!';

			const result = await Neo4j.run(`MATCH (u:User {user_id: $userParam})-[r:FRIENDS]-(f:User {user_id: $friendParam})
				DELETE r`, { userParam: user_id, friendParam: friend_id });
			if (result.summary.counters.updates().relationshipsDeleted == 0) throw 'User Unfriend failed!';

			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể hủy kết bạn!' };
		}
	}
};
