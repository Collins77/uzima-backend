const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');

// Company routes
router.get('/create-thread', assistantController.getThread);
router.get('/thread-messages', assistantController.getThreadMessages);
router.post('/add-message', assistantController.addMessageToThread);


module.exports = router;
