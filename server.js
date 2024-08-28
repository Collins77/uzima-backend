const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const allowedOrigins = [
  'https://uzima.ai',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://uzima-backe.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }, // You can restrict this to specific origins if needed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.set('view engine', 'ejs');

app.use('/', express.static(path.join(__dirname, 'public')))

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const planRoutes = require('./routes/planRoutes');
const companyRoutes = require('./routes/companyRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userChatsRoutes = require('./routes/userChatsRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rapidRoutes = require('./routes/rapidRoutes');


app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/assistant', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/userchats', userChatsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/personality', rapidRoutes);
// app.use('/api/assistant', assistantRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
