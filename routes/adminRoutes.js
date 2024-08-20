const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/authMiddleware');

// Registration route
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/create-counsellor', adminAuth, adminController.createCounsellor);
router.get('/get-counsellors', adminAuth, adminController.getCounsellors);
router.get('/get-users', adminAuth, adminController.getUsers);
router.get('/get-companies', adminAuth, adminController.getCompanies);
router.post('/create-user', adminAuth, adminController.createUser);
router.get('/get-plans', adminAuth, adminController.getPlans);
router.get('/create-plan', adminAuth, adminController.createPlan);
router.get('/create-company', adminAuth, adminController.createPlan);

module.exports = router;
