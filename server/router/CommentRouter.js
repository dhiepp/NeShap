const CommentData = require('../data/CommentData');

const express = require('express');

const router = express.Router();

router.post('/write', async (req, res) => {
	res.json(await CommentData.write(req.query));
});

router.post('/delete', async (req, res) => {
	res.json(await CommentData.delete(req.query));
});

router.get('/list', async (req, res) => {
	res.json(await CommentData.list(req.query));
});

module.exports = router;