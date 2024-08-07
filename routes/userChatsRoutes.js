const express = require('express');
const userChatsController = require('../controllers/userChatsController');
const router = express.Router();
const { createThread } = require('../services/openai'); 
const userChats = require('../model/UserChats');

router.get('/get-user-chats', userChatsController.getUserChats);
router.post('/create', async (req, res) => {
    const { userId } = req.body;
    try {
      const thread = await createThread();
      const userThread = new userChats({ userId, threadId: thread.id });
      await userThread.save();
      res.json({ threadId: thread.id });
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;