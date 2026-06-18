// backend/controllers/eventController.js
const Event = require('../models/Event');
const Seat = require('../models/Seat');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ dateTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const seats = await Seat.find({ eventId: event._id });
    const seatSummary = {
      available: seats.filter(s => s.status === 'available').length,
      reserved: seats.filter(s => s.status === 'reserved').length,
      booked: seats.filter(s => s.status === 'booked').length
    };
    
    res.json({ event, seatSummary, seats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, getEventById };
