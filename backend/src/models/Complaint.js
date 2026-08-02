const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['maintenance', 'electrical', 'plumbing', 'cleanliness', 'food', 'security', 'staff', 'other'],
    required: true,
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'open',
  },
  images: [{ url: String, publicId: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  timeline: [{
    status: String,
    message: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  }],
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
