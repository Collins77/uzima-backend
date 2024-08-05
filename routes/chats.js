const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();

router.post('/create-chat',  chatController.createChat);
router.get('/get-chat/:id', chatController.getChat);
router.put('/update-chat/:id', chatController.updateChat);

module.exports = router;
