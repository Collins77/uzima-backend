const express = require('express');
const router = express.Router();
const { requestPayment, handleCallback } = require('../controllers/paymentController');

// Plan routes
router.post('/requestpayment', requestPayment);
router.post('/c2b-callback-results', handleCallback);

module.exports = router;
