require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const connectDB = require('../config/db');

const roomImages = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85',
];

async function seedRoomImages() {
  await connectDB();

  const rooms = await Room.find({ 'images.0': { $exists: false } }).sort({ roomNumber: 1 });
  await Promise.all(rooms.map((room, index) => (
    Room.updateOne(
      { _id: room._id, 'images.0': { $exists: false } },
      { $set: { images: [{ url: roomImages[index % roomImages.length] }] } },
    )
  )));

  console.log(`Added permanent room images to ${rooms.length} existing room(s).`);
  await mongoose.connection.close();
}

seedRoomImages().catch(async (error) => {
  console.error('Unable to seed room images:', error);
  await mongoose.connection.close();
  process.exit(1);
});
