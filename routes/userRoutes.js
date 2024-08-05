const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Registration route
router.post('/register', userController.register);
router.get('/verify-email', userController.verifyEmail);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);
router.post('/disable-otp', userController.disableOtp);

module.exports = router;
