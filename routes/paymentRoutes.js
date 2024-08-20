const express = require('express');
const router = express.Router();
const { requestPayment } = require('../controllers/paymentController');

// Plan routes
router.post('/requestpayment', requestPayment);

module.exports = router;
