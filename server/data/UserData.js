const { ObjectID } = require('mongodb');
const Connection = require('./Connection');

module.exports = class UserData {
	static async get(query, projection) {
		try {
			const userCollection = await Connection.getCollection('user');
			const result = await userCollection.findOne(query, { projection: projection });
			return result;
		}
		catch (exception) {
			console.log(exception);
			return null;
		}
	}
	static async getByID(userid, projection) {
		try {
			return await this.get({ _id: new ObjectID(userid) }, projection);
		}
		catch (exception) {
			console.log(exception);
			return null;
		}
	}
	static async checkExist(query) {
		if (await this.get(query, { _id: 1 })) return true;
		return false;
	}
	static async checkExistByID(userid) {
		try {
			if (await this.get({ _id: new ObjectID(userid) }, { _id: 1 })) return true;
			return false;
		}
		catch (exception) {
			console.log(exception);
			return false;
		}
	}
	static async checkPerm(userid, checkid) {
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
				{ projection: { _id: true }, sort: { username: 1 }, skip: 10 * (page - 1), limit: 10 });
			const result = cursor.toArray();
			return result;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}

	static async register(query) {
		try {
			const username = query.username ? query.username.toLowerCase() : null;
			const password = query.password;
			if (!username || !password) {
				return { status: 'fail', message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!username.match(/^[0-9a-zA-Z]{3,20}$/)) {
				return { status: 'fail', message: 'Tên đăng nhập không hợp lệ!' };
			}
			if (await this.checkExist({ username: username })) {
				return { status: 'fail', message: 'Tên tài khoản đã tồn tại!' };
			}

			const user = { username: username, password: password, role: 0 };
			const userCollection = await Connection.getCollection('user');
			const result = await userCollection.insertOne(user);
			return { status: 'success', userid: result.insertedId, role: 0 };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể tạo tài khoản!' };
		}
	}
	static async login(query) {
		try {
			const username = query.username ? query.username.toLowerCase() : null;
			const password = query.password;
			if (!username || !password) {
				return { status: 'fail', message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!username.match(/^[0-9a-zA-Z]{3,20}$/)) {
				return { status: 'fail', message: 'Tên đăng nhập không hợp lệ!' };
			}

			const result = await this.get({ username: username, password: password });
			if (!result) {
				return { status: 'fail', message: 'Sai tên đăng nhập hoặc mật khẩu!' };
			}
			return { status: 'success', userid: result._id, role: result.role };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể đăng nhập!' };
		}
	}
	static async edit(query, avatar) {
		try {
			const userid = query.userid;
			const username = query.username ? query.username.toLowerCase() : null;
			const password = query.password;
			const set = {};

			if (!await this.checkExistByID(userid)) {
				return { status: 'fail', message: 'User ID không tồn tại!' };
			}
			if (!username && !password && !avatar) {
				return { status: 'fail', message: 'Thông tin cá nhân không thay đổi!' };
			}
			if (username) {
				if (!username.match(/^[0-9a-zA-Z]{1,20}$/)) {
					return { status: 'fail', message: 'Tên đăng nhập không hợp lệ!' };
				}
				if (await this.checkExist({ _id: { $not: { $eq: new ObjectID(userid) } }, username: username })) {
					return { status: 'fail', message: 'Tên tài khoản đã được sử dụng!' };
				}
				set.username = username;
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
