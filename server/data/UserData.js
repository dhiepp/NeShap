const Neo4j = require('./Neo4j');

exports = class UserData {
	static async get(user_id) {
		const result = await Neo4j.run('MATCH (u:User {user_id: $idParam}) RETURN u LIMIT 1', { idParam: user_id });
		session.close();

		if (result.records.length == 0) return null;
		return result.records[0];
	}

	static async getID(name) {
		const session = driver.session();
		const result = await session.run('MATCH (u:User {name: $nameParam}) RETURN u.user_id LIMIT 1', { nameParam: name });
		session.close();

		if (result.records.length == 0) return null;
		return result.records[0].get('u.user_id');
	}

	static async verify(session_id) {

	}

	static async perm(userid, checkid) {
		const user = await this.getByID(userid);
		const check = await this.checkExistByID(userid);
		// Invalid user
		if (!user || !check) return 0;
		// The same user
		if (userid === checkid) return 2;
		// Admin
		if (user.role === 1) return 3;
		// Normal user
		return 1;
	}

	static async rejoin(user_id, session_id) {
		try {
			if (!user_id || !session_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}

			const loginSession = new LoginSession(session_id);
			if (user_id === await loginSession.verify()) {
				return { status: true };
			}
			return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể xác thực phiên đăng nhập!' };
		}
	}

	static async register(name, password) {
		try {
			if (!name || !password) {
				return { status: 'fail', message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!name.match(/^[0-9a-zA-Z_]{3,20}$/)) {
				return { status: 'fail', message: 'Tên đăng nhập không hợp lệ!' };
			}
			if (await this.getID(name)) {
				return { status: 'fail', message: 'Tên tài khoản đã tồn tại!' };
			}

			const session = driver.session();
			const result = await session.run(`MERGE (u:User {user_id:randomUUID(), name:$nameParam, password: $passwordParam, role: 0})
				-[:HAS_SESSION]->(s:Session {session_id:randomUUID(), time: datetime()}) RETURN u.user_id, s.session_id`,
			{ nameParam: name, passwordParam: password });
			const record = result.records[0];
			if (!record) throw 'No row changed!';
			return { status: 'success', user_id: record.get('u.user_id'), session_id: record.get('s.session_id') };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể tạo tài khoản!' };
		}
	}

	static async login(name, password) {
		try {
			if (!name || !password) {
				return { status: 'fail', message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!name.match(/^[0-9a-zA-Z]{3,20}$/)) {
				return { status: 'fail', message: 'Tên đăng nhập không hợp lệ!' };
			}

			const session = driver.session();
			const result = await session.run(`MATCH (u:User {name:$nameParam, password: $passwordParam})
				CREATE (u)-[:HAS_SESSION]->(s:Session {session_id: randomUUID(), time: datetime()}) RETURN u.user_id, s.session_id`,
			{ nameParam: name, passwordParam: password });
			const record = result.records[0];
			if (!record) {
				return { status: 'fail', message: 'Sai tên đăng nhập hoặc mật khẩu!' };
			}
			return { status: 'success', user_id: record.get('u.user_id'), session_id: record.get('s.session_id') };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể đăng nhập!' };
		}
	}

	static async list(query) {
		try {
			const adminid = query.adminid;
			const page = query.page;
			const userCollection = await Connection.getCollection('user');

			const admin = await this.getByID(adminid);
			if (!admin || admin.role < 1) {
				return null;
			}
			const cursor = await userCollection.find({},
				{ projection: { _id: true }, sort: { name: 1 }, skip: 10 * (page - 1), limit: 10 });
			const result = cursor.toArray();
			return result;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}


	static async edit(query, avatar) {
		try {
			const session_id = query.session_id;
			const name = query.name ? query.name.toLowerCase() : null;
			const password = query.password;

			const user_id = verify(session_id);
			if (!user_id) {
				return { status: 'fail', message: 'Phiên đăng nhập không hợp lệ!' };
			}
			if (!name && !password && !avatar) {
				return { status: 'fail', message: 'Thông tin cá nhân không thay đổi!' };
			}
			if (name) {
				if (!name.match(/^[0-9a-zA-Z]{1,20}$/)) {
					return { status: 'fail', message: 'Tên đăng nhập không hợp lệ!' };
				}
				if (await this.getID(name)) {
					return { status: 'fail', message: 'Tên tài khoản đã được sử dụng!' };
				}
				set.name = name;
			}
			if (password) {
				set.password = password;
			}
			if (avatar) {
				set.avatar = avatar;
			}

			const userCollection = await Connection.getCollection('user');
			const result = await userCollection.updateOne({ _id: new ObjectID(userid) }, { $set: set });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Thông tin cá nhân không thay đổi!' };
			}
			return { status: 'success' };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể sửa thông tin cá nhân!' };
		}
	}

	static async delete(query) {
		try {
			const adminid = query.adminid;
			const deleteid = query.deleteid;

			if (UserData.checkPerm(adminid, deleteid) < 3) {
				return { status: 'fail', message: 'Không có quyền xóa tài khoản!' };
			}

			const userCollection = await Connection.getCollection('user');
			const result = await userCollection.deleteOne({ _id: new ObjectID(deleteid) });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Tài khoản không bị xóa!' };
			}
			return { status: 'success' };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể xóa tài khoản!' };
		}
	}

	static async follow(query) {
		try {
			const userid = query.userid;
			const followid = query.followid;
			const perm = await this.checkPerm(userid, followid);
			if (perm === 0 || perm === 2) {
				return { status: 'fail', message: 'Không thể theo dõi!' };
			}

			const userCollection = await Connection.getCollection('user');
			const result = await userCollection.updateOne({ _id: new ObjectID(followid) },
				{ $addToSet: { followers: userid } });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Không thể theo dõi!' };
			}
			return { status: 'success', message: 'Đã theo dõi tải khoản này' };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể theo dõi!' };
		}
	}
	static async unfollow(query) {
		try {
			const userid = query.userid;
			const followid = query.followid;
			const perm = await this.checkPerm(userid, followid);
			if (perm === 0 || perm === 2) {
				return { status: 'fail', message: 'Không thể hủy theo dõi!' };
			}

			const userCollection = await Connection.getCollection('user');
			const result = await userCollection.updateOne({ _id: new ObjectID(followid) },
				{ $pull: { followers: userid } });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Không thể hủy theo dõi!' };
			}
			return { status: 'success', message: 'Đã hủy theo dõi tải khoản này' };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể hủy theo dõi!' };
		}
	}
	static async listFollowing(userid) {
		try {
			const userCollection = await Connection.getCollection('user');
			const cursor = await userCollection.find({ followers: { $elemMatch: { $eq: userid } } }, { projection: { _id: true } });
			const result = (await cursor.toArray()).map(item => item._id);
			return result;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}
};
