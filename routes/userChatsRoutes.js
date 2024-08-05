const express = require('express');
const userChatsController = require('../controllers/userChatsController');
const router = express.Router();

router.get('/get-user-chats', userChatsController.getUserChats);

module.exports = router;