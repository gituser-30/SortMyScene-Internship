// backend/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const { reserveSeats, getActiveReservation } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reserveSeats);
router.get('/active/:eventId', protect, getActiveReservation);

module.exports = router;
