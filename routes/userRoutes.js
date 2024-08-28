const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { userAuth } = require('../middleware/authMiddleware');

// Registration route
router.post('/register', userController.register);
router.get('/verify-email', userController.verifyEmail);
router.post('/login', userController.login);
router.post('/verify-otp' ,userController.verifyOtp);
router.post('/disable-otp', userAuth ,userController.disableOtp);
router.post('/forgot-password', userController.forgotPassword);
router.get('/reset-password/:id/:token', userController.resetPassword);
router.post('/reset-password/:id/:token', userController.resetPasswordComplete);
router.put('/update/:id', userAuth, userController.updateUser);
router.get('/get-user/:id', userAuth, userController.getUserDetails);
router.post('/change-password/:id', userAuth, userController.changePassword);
router.post('/update-mood', userController.updateUserMood);


module.exports = router;
