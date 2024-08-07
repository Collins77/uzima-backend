const express = require('express');
const router = express.Router();
const { addMessage, runAssistant, checkStatus, listMessages } = require('../services/openai'); // Ensure correct path

// Route to add a message and process the assistant
router.post('/add', async (req, res) => {
  const { threadId, message } = req.body;
  try {
    await addMessage(threadId, message);
    const run = await runAssistant(threadId);
    const runId = run.id;

    // Polling for status
    let status = 'running';
    while (status === 'running') {
      const runObject = await checkStatus(threadId, runId);
      status = runObject.status;
      if (status === 'completed') {
        const messages = await listMessages(threadId);
        res.json({ messages: messages.body.data });
        return; // Exit after sending the response
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
