const ChatData = require('../data/ChatData');

const express = require('express');

const router = express.Router();

router.get('/list', async (req, res) => {
	res.json(await ChatData.list(req.query));
});

router.get('/detail', async (req, res) => {
	res.json(await ChatData.detail(req.query));
});

router.post('/start', async (req, res) => {
	res.json(await ChatData.start(req.query));
});

router.post('/read', async (req, res) => {
	res.json(await ChatData.read(req.query));
});

router.post('/delete', async (req, res) => {
	res.json(await ChatData.delete(req.query));
});


module.exports = router;