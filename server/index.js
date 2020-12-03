const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const server = express();
const port = 6969;

const Session = require('./data/SessionData');
const User = require('./data/UserData');

const upload = multer({ storage: multer.memoryStorage() });
server.use(express.json());

server.post('/user/rejoin', Session.validate(req,r)
/*
server.post('/user/rejoin', async (req, res) => {
	res.json(await UserData.rejoin(req.query.user_id, req.query.session_id));
});

server.post('/user/login', async (req, res) => {
	res.json(await UserData.login(req.query.name, req.query.password));
});

server.post('/user/register', async (req, res) => {
	res.json(await UserData.register(req.query.name, req.query.password));
});


server.get('/user/get', async (req, res) => {
	const result = await UserData.getByID(req.query.userid, { password: false, avatar: false });
	res.json(result);
});

server.get('/user/avatar', async (req, res) => {
	const result = await UserData.getByID(req.query.userid, { avatar: true });
	if (!result || result.avatar === undefined) {
		res.sendFile('/images/default_avatar.png', { root: __dirname });
		return;
	}
	res.contentType('jpeg');
	res.send(result.avatar.buffer);
});

server.get('/user/search', async (req, res) => {
	const result = await UserData.get({ username: req.query.username }, { password: false, avatar: false });
	res.json(result);
});

server.get('/user/list', async (req, res) => {
	const result = await UserData.list(req.query);
	res.json(result);
});

server.post('/user/delete', async (req, res) => {
	const result = await UserData.delete(req.query);
	res.json(result);
});

server.post('/user/edit', upload.single('avatar'), async (req, res) => {
	let avatar = null;
	if (req.file !== undefined) {
		avatar = await sharp(req.file.buffer)
			.resize({ width: 256, fit: 'cover', position: 'center', withoutEnlargement: true })
			.jpeg({ quality: 80, force: true });
	}
	res.json(await UserData.edit(req.query, avatar));
});

server.post('/user/follow', async (req, res) => {
	res.json(await UserData.follow(req.query));
});

server.post('/user/unfollow', async (req, res) => {
	res.json(await UserData.unfollow(req.query));
});

server.post('/post/write', upload.single('cover'), async (req, res) => {
	let cover = null;
	if (req.file !== undefined) {
		cover = await sharp(req.file.buffer)
			.resize({ width: 1280, height: 720, fit: 'contain', position: 'center', background: '#ffffff', withoutEnlargement: true })
			.jpeg({ quality: 50, force: true }).toBuffer();
	}
	const result = await PostData.write(req.body.data, cover);
	res.json(result);
});

server.post('/post/edit', upload.single('cover'), async (req, res) => {
	let cover = null;
	if (req.file !== undefined) {
		cover = await sharp(req.file.buffer)
			.resize({ width: 1280, height: 720, fit: 'contain', position: 'center', background: '#ffffff', withoutEnlargement: true })
			.jpeg({ quality: 50, force: true }).toBuffer();
	}
	const result = await PostData.edit(req.body.data, cover);
	res.json(result);
});

server.post('/post/delete', async (req, res) => {
	const result = await PostData.delete(req.query);
	res.json(result);
});

server.get('/post/get', async (req, res) => {
	const result = await PostData.getByID(req.query.postid, { cover: false, comments: false });
	res.json(result);
});

server.get('/post/list/', async (req, res) => {
	const result = await PostData.list(req.query);
	res.json(result);
});

server.get('/post/cover', async (req, res) => {
	const result = await PostData.getByID(req.query.postid, { cover: true });
	if (result.cover === undefined) {
		res.json(null);
		return;
	}
	res.contentType('jpeg');
	res.send(result.cover.buffer);
});

server.post('/post/like', async (req, res) => {
	const result = await PostData.like(req.query);
	res.json(result);
});

server.post('/post/dislike', async (req, res) => {
	const result = await PostData.dislike(req.query);
	res.json(result);
});

server.get('/comment/get', async (req, res) => {
	const result = 	await CommentData.listFromPost(req.query);
	res.json(result);
});

server.post('/comment/add', async (req, res) => {
	const result = await CommentData.add(req.body);
	res.json(result);
});

server.post('/comment/delete', async (req, res) => {
	const result = await CommentData.delete(req.query);
	res.json(result);
});
*/

server.listen(process.env.PORT || port, () => {
	console.log('RESTful API server started on: ' + port);
});