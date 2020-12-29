const UserData = require('../data/UserData');

const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/register', async (req, res) => {
	res.json(await UserData.register(req.query));
});

router.post('/login', async (req, res) => {
	res.json(await UserData.login(req.query));
});

router.post('/edit', upload.single('avatar'), async (req, res) => {
	res.json(await UserData.edit(req.body.data, req.file?.buffer));
});

router.get('/profile', async (req, res) => {
	res.json(await UserData.profile(req.query));
});

router.get('/avatar', async (req, res) => {
	const user_id = req.query.user_id;
	try {
		const user = await UserData.getByUserID(user_id);
		if (!user) throw 'User not found';

		await fs.access(`./images/avatar/${user_id}.jpg`);
		res.sendFile(`${user_id}.jpg`, { maxAge: '1h', root: './images/avatar' });
	}
	catch (error) {
		res.sendFile('default_avatar.png', { maxAge: '1h', root: './images' });
	}
});

router.get('/search', async (req, res) => {
	const name = req.query.name;
	const user = await UserData.getByName(name);
	if (user) {
		res.json({ user_id: user.user_id, name: user.name });
	}
	else {
		res.json(null);
	}
});

router.post('/friend', async (req, res) => {
	res.json(await UserData.friend(req.query));
});

router.post('/unfriend', async (req, res) => {
	res.json(await UserData.unfriend(req.query));
});

router.get('/list', async (req, res) => {
	res.json(await UserData.list(req.query));
});

router.post('/delete', async (req, res) => {
	res.json(await UserData.delete(req.query));
});

module.exports = router;