// personalityTestRoutes.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint to fetch personality test questions
router.get('/questions', async (req, res) => {
    try {
      const response = await axios.get('https://api.openpsychometrics.org/questions');
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error.message);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });
  
  // Endpoint to submit answers and get results
  router.post('/results', async (req, res) => {
    const { answers } = req.body; // Array of answers
  
    try {
      const response = await axios.post('https://api.openpsychometrics.org/results', { answers });
      res.json(response.data);
    } catch (error) {
      console.error('Error submitting answers:', error.message);
      res.status(500).json({ error: 'Failed to submit answers' });
    }
  });

// // Replace with your RapidAPI key
// const RAPIDAPI_KEY = '2b793e5a00msh2e2cece00059c79p12009bjsn32c1ff2b90bd';
// const RAPIDAPI_HOST = 'big-five-personality-test.p.rapidapi.com';

// const getHeaders = () => ({
//     'x-rapidapi-key': RAPIDAPI_KEY,
//     'x-rapidapi-host': RAPIDAPI_HOST,
//   });
  
//   // Fetch questions for the Big Five Personality Test
//   router.get('/questions', async (req, res) => {
//     const options = {
//       method: 'GET',
//       url: 'https://big-five-personality-test.p.rapidapi.com/get',
//       headers: getHeaders(),
//     };
  
//     try {
//       const response = await axios.request(options);
//       res.json(response.data);
//     } catch (error) {
//       console.error('Error fetching questions:', error.message);
//       res.status(500).json({ error: 'Failed to fetch questions' });
//     }
//   });

// // Submit answers and get results
// router.post('/submit', async (req, res) => {
//   try {
//     const { answers } = req.body; // Assuming answers are passed in the request body
//     const response = await axios.post(
//       'https://big-five-personality-test.p.rapidapi.com/submit',
//       { answers },
//       { headers: getHeaders() }
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error submitting answers:', error.message);
//     res.status(500).json({ error: 'Failed to submit answers' });
//   }
// });

module.exports = router;
