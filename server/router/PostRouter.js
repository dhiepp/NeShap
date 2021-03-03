const PostData = require('../data/PostData');

const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/write', upload.single('cover'), async (req, res) => {
	res.json(await PostData.write(req.body.data, req.file?.buffer));
});

router.post('/edit', upload.single('cover'), async (req, res) => {
	res.json(await PostData.edit(req.body.data, req.file?.buffer));
});

router.post('/delete', async (req, res) => {
	res.json(await PostData.delete(req.query));
});

router.get('/list', async (req, res) => {
	res.json(await PostData.list(req.query));
});

router.get('/detail', async (req, res) => {
	res.json(await PostData.detail(req.query));
});

router.get('/cover', async (req, res) => {
	const post_id = req.query.post_id;
	try {
		const post = await PostData.getByPostID(post_id);
		if (!post) throw 'Post not found';

		await fs.access(`./images/cover/${post_id}.jpg`);
		res.sendFile(`${post_id}.jpg`, { maxAge: '1h', root: './images/cover' });
	}
	catch (error) {
		res.sendFile('default_cover.jpg', { maxAge: '1h', root: './images' });
	}
});

router.post('/like', async (req, res) => {
	res.json(await PostData.like(req.query));
});

router.post('/unlike', async (req, res) => {
	res.json(await PostData.unlike(req.query));
});

module.exports = router;