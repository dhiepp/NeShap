const SessionData = require('../data/SessionData');

module.exports = class SessionController {
	constructor() {
		this.router = require('express').Router();

		this.router.post('/validate', async (req, res) => {
			res.json(await this.validate(req.query.session_id, req.query.user_id));
		});
	}

	async validate(session_id, user_id) {
		try {
			const result = await SessionData.getUser(session_id);
			if (!result || user_id != result.get('u').properties.user_id) {
				return { status: false, message: 'Phiên đăng nhập không hợp lệ!' };
			}

			return { status: true };
		}
		catch (exception) {
			console.log(exception);
			return { status: false, message: 'Không thể xác thực phiên đăng nhập!' };
		}
	}
};