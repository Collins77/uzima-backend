const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Registration route
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/create-counsellor', adminController.createCounsellor);
router.get('/get-counsellors', adminController.getCounsellors);
router.get('/get-users', adminController.getUsers);
router.get('/get-companies', adminController.getCompanies);
router.post('/create-user', adminController.createUser);
router.get('/get-plans', adminController.getPlans);
router.get('/create-plan', adminController.createPlan);
router.get('/create-company', adminController.createPlan);

module.exports = router;
