const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'waitlisted', 'checked_out'],
    default: 'pending',
  },
  reason: { type: String }, // reason for booking
  rejectionReason: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  waitlistPosition: { type: Number },
  priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
