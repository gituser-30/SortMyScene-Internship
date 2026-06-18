// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { confirmBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, confirmBooking);

module.exports = router;
