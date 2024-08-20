const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

// Plan routes
router.post('/create', planController.createPlan);
router.get('/getplans', planController.getPlans);
router.get('/getplan/:id', planController.getPlanbyId);
router.put('/edit/:id', planController.editPlan);
router.delete('/delete/:id', planController.deletePlan);

module.exports = router;
