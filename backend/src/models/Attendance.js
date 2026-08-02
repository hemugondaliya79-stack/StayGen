const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ['present', 'absent', 'late', 'leave'], default: 'absent' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  method: { type: String, enum: ['qr', 'manual', 'biometric'], default: 'manual' },
  qrToken: { type: String },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
