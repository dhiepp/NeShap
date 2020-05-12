const { ObjectID } = require('mongodb');
const Connection = require('./Connection');

const UserData = require('./UserData');
const PostData = require('./PostData');

module.exports = class CommentData {
	static async getByID(postid, commentid) {
		try {
			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.findOne({ _id: new ObjectID(postid) },
				{ projection: { _id: false, comments: { $elemMatch: { _id: new ObjectID(commentid) } } } });
			if (result) return result.comments[0];
			return false;
		}
		catch (exception) {
			console.log(exception);
			return false;
		}
	}
	static async listFromPost(query) {
		try {
			const postid = query.postid;
			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.findOne({ _id: new ObjectID(postid) }, { projection: { comments: true } });
			return result.comments ? result.comments : [];
		}
		catch (exception) {
			console.log(exception);
			return [];
		}
	}
	static async add(data) {
		try {
			if (data === undefined) {
				return { status: 'fail', message: 'Không hợp lệ!' };
			}

			const postid = data.postid;
			const authorid = data.authorid;
			const content = data.content;

			if (!await UserData.checkExistByID(authorid)) {
				return { status: 'fail', message: 'User ID không tồn tại!' };
			}
			if (!await PostData.checkExistByID(postid)) {
				return { status: 'fail', message: 'Post ID không tồn tại!' };
			}
			if (!content) {
				return { status: 'fail', message: 'Chưa nhập bình luận!' };
			}
			// const time = new Date();

			const postCollection = await Connection.getCollection('post');
			const commentid = new ObjectID();
			const result = await postCollection.updateOne({ _id: new ObjectID(postid) },
				{ $push: { comments: { _id: commentid, authorid: authorid, content: content } } });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Không thể thêm bình luận!' };
			}
			return { status: 'success', commentid: commentid };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể thêm bình luận!' };
		}
	}

	static async delete(query) {
		try {
			const postid = query.postid;
			const commentid = query.commentid;
			const userid = query.userid;
			const authorid = (await this.getByID(postid, commentid)).authorid;

			if (!await UserData.checkExistByID(userid)) {
				return { status: 'fail', message: 'User ID không tồn tại!' };
			}
			if (!await PostData.checkExistByID(postid)) {
				return { status: 'fail', message: 'Post ID không tồn tại!' };
			}
			if (!authorid) {
				return { status: 'fail', message: 'Comment ID không tồn tại!' };
			}
			if (await UserData.checkPerm(userid, authorid) < 2) {
				return { status: 'fail', message: 'Không thể xóa bình luận! Perm' };
			}

			const postCollection = await Connection.getCollection('post');
			const result = await postCollection.updateOne({ _id: new ObjectID(postid) },
				{ $pull: { comments: { _id: new ObjectID(commentid) } } });
			if (result.modifiedCount === 0) {
				return { status: 'fail', message: 'Không thể xóa bình luận! Mo' };
			}
			return { status: 'success' };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể xóa bình luận! Ex' };
		}
	}
};
