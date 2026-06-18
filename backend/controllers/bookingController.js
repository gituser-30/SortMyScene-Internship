// backend/controllers/bookingController.js
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Seat = require('../models/Seat');

const confirmBooking = async (req, res) => {
  const { reservationId } = req.body;
  
  if (!reservationId) {
    return res.status(400).json({ message: 'Reservation ID required' });
  }

  try {
    const reservation = await Reservation.findOne({ _id: reservationId, userId: req.user.id });
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    if (new Date(reservation.expiresAt) <= new Date()) {
      return res.status(410).json({ message: 'Reservation expired' });
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await Seat.updateMany(
        { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers } },
        { $set: { status: 'booked' } },
        { session }
      );
      await Reservation.deleteOne({ _id: reservation._id }, { session });
      await session.commitTransaction();
      session.endSession();
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      
      // Fallback logic
      await Seat.updateMany(
        { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers } },
        { $set: { status: 'booked' } }
      );
      await Reservation.deleteOne({ _id: reservation._id });
    }

    res.status(200).json({ 
      message: 'Booking confirmed', 
      seatNumbers: reservation.seatNumbers, 
      eventId: reservation.eventId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { confirmBooking };
