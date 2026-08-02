const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  visitorName: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  visitorIdType: { type: String, enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id'] },
  visitorIdNumber: { type: String },
  relation: { type: String },
  purpose: { type: String },
  expectedDate: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ['pending', 'approved', 'checked_in', 'checked_out', 'rejected', 'expired'], default: 'pending' },
  qrCode: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  photo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
