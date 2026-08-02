const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  block: { type: String, default: 'A' },
  type: { type: String, enum: ['single', 'double', 'triple', 'dormitory'], default: 'double' },
  capacity: { type: Number, required: true, default: 2 },
  occupied: { type: Number, default: 0 },
  isAC: { type: Boolean, default: false },
  isAttached: { type: Boolean, default: false }, // attached bathroom
  amenities: [{ type: String }],
  price: { type: Number, required: true },
  images: [{ url: String, publicId: String }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available' },
  description: { type: String },
}, { timestamps: true });

roomSchema.virtual('available').get(function () {
  return this.capacity - this.occupied;
});

roomSchema.virtual('occupancyRate').get(function () {
  return this.capacity > 0 ? ((this.occupied / this.capacity) * 100).toFixed(1) : 0;
});

roomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);
