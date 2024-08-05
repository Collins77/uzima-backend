const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

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

// Routes
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const companyRoutes = require('./routes/companyRoutes');
const chatRoutes = require('./routes/chats');
const userChatsRoutes = require('./routes/userChatsRoutes');


app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/userchats', userChatsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
