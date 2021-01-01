const express = require('express');
const server = express();
const port = 6969;

const UserRouter = require('./router/UserRouter');
const PostRouter = require('./router/PostRouter');
const CommentRouter = require('./router/CommentRouter');
const NotificationRouter = require('./router/NotificationRouter');
const ChatRouter = require('./router/ChatRouter');
const MessageRouter = require('./router/MessageRouter');

server.use(express.json());

server.use('/user', UserRouter);
server.use('/post', PostRouter);
server.use('/comment', CommentRouter);
server.use('/notification', NotificationRouter);
server.use('/chat', ChatRouter);
server.use('/message', MessageRouter);

server.listen(process.env.PORT || port, () => {
	console.log('RESTful API server started on: ' + port);
});