const MessageData = require('../data/MessageData');

const express = require('express');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/send', upload.none(), async (req, res) => {
	res.json(await MessageData.send(req.body));
});

router.get('/list', async (req, res) => {
	res.json(await MessageData.list(req.query));
});

module.exports = router;