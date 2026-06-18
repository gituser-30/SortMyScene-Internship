// backend/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const { reserveSeats, getActiveReservation, cancelReservation } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reserveSeats);
router.get('/active/:eventId', protect, getActiveReservation);
router.delete('/:id', protect, cancelReservation);

module.exports = router;
