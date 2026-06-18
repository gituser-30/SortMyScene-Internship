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

const getActiveReservation = async (req, res) => {
  const { eventId } = req.params;
  try {
    const reservation = await Reservation.findOne({ 
      userId: req.user.id, 
      eventId,
      expiresAt: { $gt: new Date() }
    });
    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const reservation = await Reservation.findOne({ _id: id, userId: req.user.id });
    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    await Seat.updateMany(
      { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, status: 'reserved' },
      { $set: { status: 'available' } },
      { session }
    );
    await Reservation.deleteOne({ _id: id }, { session });
    
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: 'Reservation cancelled' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Fallback for standalone mongo instances
    try {
      const reservation = await Reservation.findOne({ _id: id, userId: req.user.id });
      if (reservation) {
        await Seat.updateMany(
          { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, status: 'reserved' },
          { $set: { status: 'available' } }
        );
        await Reservation.deleteOne({ _id: id });
      }
      return res.status(200).json({ message: 'Reservation cancelled' });
    } catch (fallbackError) {
      return res.status(500).json({ message: fallbackError.message });
    }
  }
};

module.exports = { reserveSeats, getActiveReservation, cancelReservation };
