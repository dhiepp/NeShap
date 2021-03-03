const NotificationData = require('../data/NotificationData');

const express = require('express');

const router = express.Router();

router.get('/badge', async (req, res) => {
	res.json(await NotificationData.badge(req.query));
});

router.get('/list', async (req, res) => {
	res.json(await NotificationData.list(req.query));
});

router.post('/read', async (req, res) => {
	res.json(await NotificationData.read(req.query));
});

module.exports = router;