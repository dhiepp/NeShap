const CommentData = require('../data/CommentData');

const express = require('express');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/write', upload.none(), async (req, res) => {
	res.json(await CommentData.write(req.body));
});

router.post('/delete', async (req, res) => {
	res.json(await CommentData.delete(req.query));
});

router.get('/list', async (req, res) => {
	res.json(await CommentData.list(req.query));
});

module.exports = router;