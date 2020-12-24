const UserData = require('../data/UserData');

const express = require('express');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/register', async (req, res) => {
	res.json(await UserData.register(req.query));
});

router.post('/login', async (req, res) => {
	res.json(await UserData.login(req.query));
});

router.post('/edit', upload.single('avatar'), async (req, res) => {
	res.json(await UserData.edit(req.body, req.file?.buffer));
});

router.get('/profile', async (req, res) => {
	res.json(await UserData.profile(req.query));
});

router.get('/avatar', async (req, res) => {
	const user_id = req.query.user_id;
	const user = await UserData.getByUserID(user_id);
	if (user) {
		res.sendFile(`${user_id}.jpg`, { maxAge: '1h', root: './images/avatar/' });
	}
	else {
		res.sendStatus(404);
	}
});

router.post('/friend', async (req, res) => {
	res.json(await UserData.friend(req.query));
});

router.post('/unfriend', async (req, res) => {
	res.json(await UserData.unfriend(req.query));
});

module.exports = router;