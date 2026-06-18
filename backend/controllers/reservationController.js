// backend/controllers/reservationController.js
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

const reserveSeats = async (req, res) => {
  const { eventId, seatNumbers } = req.body;
  if (!eventId || !seatNumbers || seatNumbers.length === 0) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    for (const seatNumber of seatNumbers) {
      const result = await Seat.findOneAndUpdate(
        { eventId, seatNumber, status: 'available' },
        { $set: { status: 'reserved' } },
        { new: true, session }
      );
      if (!result) {
        throw new Error(`Seat ${seatNumber} already taken`);
      }
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const reservation = await Reservation.create(
      [{ userId: req.user.id, eventId, seatNumbers, expiresAt }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(reservation[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Fallback for standalone mongo instances
    if (error.message.includes('Transaction') || error.message.includes('not supported') || error.message.includes('replica')) {
      try {
        const updateResult = await Seat.updateMany(
          { eventId, seatNumber: { $in: seatNumbers }, status: 'available' },
          { $set: { status: 'reserved' } }
        );
        if (updateResult.modifiedCount !== seatNumbers.length) {
          await Seat.updateMany(
            { eventId, seatNumber: { $in: seatNumbers }, status: 'reserved' },
            { $set: { status: 'available' } }
          );
          return res.status(409).json({ message: 'One or more seats are no longer available' });
        }
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const reservation = await Reservation.create({ userId: req.user.id, eventId, seatNumbers, expiresAt });
        return res.status(201).json(reservation);
      } catch (fallbackError) {
        return res.status(500).json({ message: fallbackError.message });
      }
    }
    
    return res.status(409).json({ message: 'One or more seats are no longer available' });
  }
};

module.exports = { reserveSeats };
