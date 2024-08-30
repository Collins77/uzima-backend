const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Plan routes
router.post('/create-event', eventController.createEvent);
router.get('/get-events', eventController.getEvents);
router.get('/get-event/:id', eventController.getEventbyId);
router.put('/edit/:id', eventController.editEvent);
router.delete('/delete/:id', eventController.deleteEvent);

module.exports = router;
