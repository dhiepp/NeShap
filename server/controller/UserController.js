const UserData = require('../data/UserData');

module.exports = class UserController {
	constructor() {
		this.router = require('express').Router();

		this.router.post('/register', async (req, res) => {
			res.json(await this.register(req.query.name, req.query.password));
		});

		this.router.post('/login', async (req, res) => {
			res.json(await this.login(req.query.name, req.query.password));
		});
	}

	async register(name, password) {
		try {
			if (!name || !password) {
				return { status: false, message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!name.match(/^[0-9a-zA-Z_]{3,20}$/)) {
				return { status: false, message: 'Tên đăng nhập không hợp lệ!' };
			}
			if (await UserData.getByName(name)) {
				return { status: false, message: 'Tên tài khoản đã tồn tại!' };
			}

			const result = await UserData.create(name, password);
			if (!result) throw 'No node created';

			const user_id = result.get('u').properties.user_id;
			const session_id = result.get('s').properties.session_id;
			return { status: true, user_id: user_id, session_id: session_id };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể tạo tài khoản!' };
		}
	}

	async login(name, password) {
		try {
			if (!name || !password) {
				return { status: false, message: 'Chưa nhập đầy đủ thông tin!' };
			}
			if (!name.match(/^[0-9a-zA-Z]{3,20}$/)) {
				return { status: false, message: 'Tên tài khoản không hợp lệ!' };
			}

			const result = await UserData.check(name, password);
			if (!result) {
				return { status: false, message: 'Sai tên tài khoản hoặc mật khẩu!' };
			}

			const user_id = result.get('u').properties.user_id;
			const session_id = result.get('s').properties.session_id;
			return { status: true, user_id: user_id, session_id: session_id };
		}
		catch (exception) {
			console.log(exception);
			return { status: 'fail', message: 'Không thể đăng nhập!' };
		}
	}
};