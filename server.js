const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const OpenAI = require('openai');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = "asst_5HQ5ZlbHH7EAieBqPLykbU9x"
let pollingInterval;

async function createThread() {
  console.log('Creating a new thread...');
  const thread = await openai.beta.threads.create();
  return thread;
}

async function addMessage(threadId, message) {
  console.log('Adding a new message to thread: ' + threadId);
  const response = await openai.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: message
    }
  );
  return response;
}

async function runAssistant(threadId) {
  console.log('Running assistant for thread: '  + threadId);
  const response =  await openai.beta.threads.runs.create(
    threadId,
    {
      assistant_id: assistantId
    }
  );
  console.log(response)
  return response 
}

async function checkingStatus(res, threadId, runId) {
  const runObject = await openai.beta.threads.runs.retrieve(
    threadId, 
    runId
  );

  const status = runObject.status;
  console.log(runObject);
  console.log('Current status: ' + status);

  if(status == 'completed') {
    clearInterval(pollingInterval);

    const messagesList = await openai.beta.threads.messages.list(threadId);
    let messages = []

    messagesList.body.data.forEach(message => {
      messages.push(message.content);
    });

    res.json({messages});
  }
}



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*', // You can restrict this to specific origins if needed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/thread', (req, res) => {
  createThread().then(thread => {
    res.json({ threadId: thread.id });
  });
})

app.post('/api/message', (req, res) => {
  const { message, threadId } = req.body;
  addMessage(threadId, message).then(message => {
    runAssistant(threadId).then(run => {
      const runId = run.id;

      pollingInterval = setInterval(() => {
        checkingStatus(res, threadId, runId);
      }, 5000);
    });
  });
});

// Endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    // Replace with your custom assistant ID
    const assistantId = 'asst_5HQ5ZlbHH7EAieBqPLykbU9x'; 

    const response = await openai.chat.completions.create({
      model: assistantId, // Use your custom assistant ID here
      messages: [{ role: 'user', content: prompt }],
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error during OpenAI request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const planRoutes = require('./routes/planRoutes');
const companyRoutes = require('./routes/companyRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userChatsRoutes = require('./routes/userChatsRoutes');
const assistantRoutes = require('./routes/assistantRoutes');


app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/assistant', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/userchats', userChatsRoutes);
// app.use('/api/assistant', assistantRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
