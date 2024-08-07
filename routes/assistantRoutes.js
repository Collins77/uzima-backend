// routes/assistantRoutes.js
const express = require('express');
const router = express.Router();
const { addMessage, runAssistant, checkingStatus, createThread } = require('../services/openai');

const OpenAI = require('openai');

router.get('/create-thread', async (req, res) => {
    createThread().then(thread => {
        res.json({ threadId: thread.id });
    });
});

router.post('/add', async (req, res) => {
    const { message, threadId } = req.body;
    addMessage(threadId, message).then(message => {
        // res.json({ messageId: message.id });

        // Run the assistant
        runAssistant(threadId).then(run => {
            const runId = run.id;           
            
            // Check the status
            pollingInterval = setInterval(() => {
                checkingStatus(res, threadId, runId);
            }, 5000);
        });
    });
});

module.exports = router;
