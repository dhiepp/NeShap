const { ObjectID } = require('mongodb');
const Connection = require('./Connection');

const UserData = require('./UserData');

module.exports = class PostData {
	static async getByID(postid, projection) {
		try {
			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.findOne({ _id: new ObjectID(postid) }, { projection: projection });
			return result;
		}
		catch (exception) {
			return null;
		}
	}
	static async checkExistByID(postid) {
		try {
			if (await this.getByID(postid, { _id: 1 })) return true;
			return false;
		}
		catch (exception) {
			console.log(exception);
			return false;
		}
	}

	static async list(query) {
		try {
			const mode = query.mode;
			const userid = query.userid;
			const page = query.page;
			const key = query.key;

			const postCollection = await Connection.getCollection('post');
			let cursor = null;
			switch (mode) {
			case 'hot': {
				const limit = new Date();
				limit.setDate(limit.getDate() - 7);
				cursor = await postCollection.find({ time: { $gt: limit } },
					{ sort: { rating: -1 }, skip: 10 * (page - 1), limit: 10, projection: { cover: false, comments: false } });
				break;
			}
			case 'sub': {
				if (userid === undefined) return [];
				const following = await UserData.listFollowing(userid);
				if (following !== undefined) {
					cursor = await postCollection.find({ authorid: { $in: following } },
						{ sort: { time: -1 }, skip: 10 * (page - 1), limit: 10, projection: { cover: false, comments: false } });
				}
				break;
			}
			case 'src': {
				if (key.length < 3) {
					return [];
				}
				const regex = new RegExp(`\\b(${key})\\b`, 'i');
				cursor = await postCollection.find({ $or: [{ title: { $regex: regex } }, { content: { $regex: regex } }] },
					{ sort: { time: -1 }, skip: 10 * (page - 1), limit: 10, projection: { cover: false, comments: false } });
				break;
			}
			case 'tag': {
				cursor = await postCollection.find({ tags: { $elemMatch: { $eq: key } } },
					{ sort: { time: -1 }, skip: 10 * (page - 1), limit: 10, projection: { cover: false, comments: false } });
				break;
			}
			case 'pro': {
				if (userid === undefined) return [];
				cursor = await postCollection.find({ authorid: new ObjectID(userid) },
					{ sort: { time: -1 }, skip: 10 * (page - 1), limit: 10, projection: { cover: false, comments: false } });
				break;
			}
			// Default = list new
			default: {
				cursor = await postCollection.find({},
					{ sort: { time: -1 }, skip: 10 * (page - 1), limit: 10, projection: { cover: false, comments: false } });
			}
			}

			let result = [];
			if (cursor !== null) {
				result = await cursor.toArray();
			}
			return result;
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}

	static async write(data, cover) {
		try {
			if (data === undefined) {
				return { status: 'fail', message: 'Không hợp lệ!' };
			}
			data = JSON.parse(data);

			const authorid = data.authorid;
			const title = data.title;
			const content = data.content;
			const tags = data.tags;

			if (!await UserData.checkExistByID(authorid)) {
				return { status: 'fail', message: 'User ID không tồn tại!' };
			}
			if (!title || !content) {
				return { status: 'fail', message: 'Chưa nhập đầy đủ thông tin!' };
			}
			for (const tag of tags) {
				if (!tag.match(/^[0-9a-zA-Z]{3,20}$/)) {
					return { status: 'fail', message: 'Tags không hợp lệ!' };
				}
			}

			const time = new Date();
			const insert = { authorid: new ObjectID(authorid), title: title, hasCover:false, content: content, time: time, tags: tags, rating: 0 };
			if (cover) {
				insert.cover = cover;
				insert.hasCover = true;
			}

			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.insertOne(insert);
			return { status: 'success', postid: result.insertedId };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể viết bài mới!' };
		}
	}
	static async edit(data, cover) {
		try {
			if (data === undefined) {
				return { status: 'fail', message: 'Không hợp lệ!' };
			}
			data = JSON.parse(data);

			const userid = data.userid;
			const postid = data.postid;
			const title = data.title;
			const content = data.content;
			const tags = data.tags;
			const set = {};

			const post = await this.getByID(postid);
			if (!post) {
				return { status: 'fail', message: 'Bài viết không tồn tại!' };
			}
			if (UserData.checkPerm(userid, post.authorid) < 2) {
				return { status: 'fail', message: 'Không có quyền sửa bài viết!' };
			}
			if (!title && !content && !tags && !cover) {
				return { status: 'fail', message: 'Thông tin bài viết không thay đổi!' };
			}
			if (title) {
				set.title = title;
			}
			if (content) {
				set.content = content;
			}
			if (tags) {
				for (const tag in tags) {
					if (!tag.match(/^[0-9a-zA-Z,]*$/)) {
						return { status: 'fail', message: 'Tags không hợp lệ!' };
					}
				}
				set.tags = tags;
			}
			if (cover) {
				set.cover = cover;
				set.hasCover = true;
			}

			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.updateOne({ _id: new ObjectID(postid) }, { $set: set });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Bài viết không thay đổi!' };
			}
			return { status: 'success' };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể sửa bài viết!' };
		}
	}
	static async delete(data) {
		try {
			if (data === undefined) {
				return { status: 'fail', message: 'Không hợp lệ!' };
			}

			const userid = data.userid;
			const postid = data.postid;

			const post = await this.getByID(postid);
			if (!post) {
				return { status: 'fail', message: 'Bài viết không tồn tại!' };
			}
			if (UserData.checkPerm(userid, post.authorid) < 2) {
				return { status: 'fail', message: 'Không có quyền xóa bài viết!' };
			}

			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.deleteOne({ _id: new ObjectID(postid) });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Bài viết không bị xóa!' };
			}
			return { status: 'success' };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể xóa bài viết!' };
		}
	}

	static async like(query) {
		try {
			const userid = query.userid;
			const postid = query.postid;

			const post = await this.getByID(postid, { likes: true, dislikes: true });

			if (!post) {
				return { status: 'fail', message: 'Bài viết không tồn tại!' };
			}
			if (!UserData.checkExistByID(userid)) {
				return { status: 'fail', message: 'Không thể đánh giá!' };
			}

			let action = { $push: { likes: userid }, $inc: { rating: 1 } };
			let liked = true;
			// Unlike
			if (post.likes && post.likes.includes(userid)) {
				action = { $pull: { likes: userid }, $inc: { rating: -1 } };
				liked = false;
			}
			// Switch
			if (post.dislikes && post.dislikes.includes(userid)) {
				action = { $push: { likes: userid }, $pull: { dislikes: userid }, $inc: { rating: 2 } };
			}

			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.updateOne({ _id: new ObjectID(postid) }, action);
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Không thể đánh giá!' };
			}
			return { status: 'success', liked: liked };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể đánh giá!' };
		}
	}

	static async dislike(query) {
		try {
			const userid = query.userid;
			const postid = query.postid;

			const post = await this.getByID(postid, { likes: true, dislikes: true });

			if (!post) {
				return { status: 'fail', message: 'Bài viết không tồn tại!' };
			}
			if (!UserData.checkExistByID(userid)) {
				return { status: 'fail', message: 'Không thể đánh giá!' };
			}

			let action = { $push: { dislikes: userid }, $inc: { rating: -1 } };
			let disliked = true;
			// Undislike
			if (post.dislikes && post.dislikes.includes(userid)) {
				action = { $pull: { dislikes: userid }, $inc: { rating: 1 } };
				disliked = false;
			}
			// Switch
			if (post.likes && post.likes.includes(userid)) {
				action = { $push: { dislikes: userid }, $pull: { likes: userid }, $inc: { rating: -2 } };
			}

			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.updateOne({ _id: new ObjectID(postid) }, action);
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Không thể đánh giá!' };
			}
			return { status: 'success', disliked: disliked };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể đánh giá!' };
		}
	}
};