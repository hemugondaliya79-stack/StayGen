const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['general', 'academic', 'maintenance', 'emergency', 'event', 'hostel'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  targetRoles: [{ type: String, enum: ['all', 'student', 'staff', 'security'] }],
  attachments: [{ name: String, url: String, publicId: String }],
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
