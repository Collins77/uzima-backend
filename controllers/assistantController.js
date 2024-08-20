const express = require('express');
const router = express.Router();
const { createThread, runAssistant, checkingStatus, addMessage } = require('../services/openai');
const Thread = require('../model/Thread');
const User = require('../model/User');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const checkPromptLimit = async (userId) => {
    try {
        const user = await User.findById(userId).populate('planId');
        if (!user) {
            throw new Error('User not found');
        }
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log(`Checking prompt limit for user ${userId}`);
        console.log(`Today's date: ${today}`);
        console.log(`User's last reset: ${user.lastPromptReset}`);
        console.log(`User's prompts today: ${user.promptsToday}`);
        
        // Reset prompt count if it's a new day
        if (user.lastPromptReset !== today) {
            user.promptsToday = 0;
            user.lastPromptReset = today;
            await user.save(); // Save user with reset values
            console.log('Prompt count reset');
        }

        // Define the daily limit for the free plan
        const freePlanLimit = 5; // Example limit

        // Check if the user has exceeded their daily limit
        if (user.planId.name === 'Free' && user.promptsToday >= freePlanLimit) {
            return { allowed: false, message: 'You have reached your daily prompt limit. Please upgrade your plan to continue.' };
        }

        // Increment prompt count and save the user
        user.promptsToday += 1;
        await user.save();

        console.log(`Updated prompts today: ${user.promptsToday}`);

        return { allowed: true };
    } catch (error) {
        console.error('Error checking prompt limit:', error);
        return { allowed: false, message: 'Error checking prompt limit' };
    }
};

// Create a new thread or fetch existing one
const getThread = async (req, res) => {
    try {
        const userId = req.query.userId;
        let thread = await Thread.findOne({ userId });

        if (!thread) {
            // Create a new thread if it doesn't exist
            const newThread = await createThread();
            thread = new Thread({
                userId,
                threadId: newThread.id
            });
            await thread.save();
        }

        res.json({ threadId: thread.threadId });
    } catch (error) {
        console.error('Error creating or fetching thread:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a message to the thread and run assistant
const addMessageToThread = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const { allowed, message: errorMessage } = await checkPromptLimit(userId);
        if (!allowed) {
            return res.status(403).json({ error: errorMessage });
            console.log(errorMessage);
        }

        const thread = await Thread.findOne({ userId });

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        // Add the user message to the thread
        const userMessage = await addMessage(thread.threadId, message);

        // Run the assistant and get the response
        const assistantResponse = await runAssistant(thread.threadId);

        const pollingInterval = setInterval(async () => {
            const runObject = await openai.beta.threads.runs.retrieve(thread.threadId, assistantResponse.id);

            const status = runObject.status;
            console.log('Current status: ' + status);

            if (status === 'completed') {
                clearInterval(pollingInterval);

                // Fetch the latest message (which should be the assistant's response)
                const messagesList = await openai.beta.threads.messages.list(thread.threadId);
                const latestMessages = messagesList.body.data.slice(-2); // Get the last two messages (user + assistant)

                

                res.json({
                    userMessage: latestMessages[0].content, // The user's message
                    assistantResponse: latestMessages[1].content // The assistant's response
                });
            }
        }, 1000);

    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Retrieve user thread and its messages
const getThreadMessages = async (req, res) => {
    try {
        const userId = req.query.userId;
        let thread = await Thread.findOne({ userId });

        if (!thread) {
            // Create a new thread if it doesn't exist
            const newThread = await createThread();
            thread = new Thread({
                userId,
                threadId: newThread.id
            });
            await thread.save();
        }

        // Fetch the messages from OpenAI for the thread
        const messagesList = await openai.beta.threads.messages.list(thread.threadId);
        let messages = messagesList.body.data.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        res.json({ threadId: thread.threadId, messages });
    } catch (error) {
        console.error('Error fetching or creating thread messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getThread, addMessageToThread, getThreadMessages };
