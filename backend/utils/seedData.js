// backend/utils/seedData.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const Seat = require('../models/Seat');

dotenv.config({ path: __dirname + '/../.env' }); // Load env variables if run directly or from parent

const events = [
  {
    name: 'Tech Conference 2026',
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    venue: 'Convention Center A',
    totalSeats: 40
  },
  {
    name: 'Music Festival',
    dateTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    venue: 'Open Air Arena',
    totalSeats: 40
  },
  {
    name: 'Standup Comedy Night',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    venue: 'Comedy Club',
    totalSeats: 40
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sortmyscene';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding');

    await Event.deleteMany();
    await Seat.deleteMany();
    console.log('Cleared existing events and seats');

    for (const eventData of events) {
      const event = await Event.create(eventData);
      const seatsToInsert = [];
      const rows = ['A', 'B', 'C', 'D'];
      for (const row of rows) {
        for (let i = 1; i <= 10; i++) {
          seatsToInsert.push({
            eventId: event._id,
            seatNumber: `${row}${i}`,
            status: 'available'
          });
        }
      }
      await Seat.insertMany(seatsToInsert);
      console.log(`Created event: ${event.name} with 40 seats`);
    }

    console.log('Seeding complete');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
