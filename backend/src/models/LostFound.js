const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['electronics', 'clothing', 'documents', 'accessories', 'books', 'other'], default: 'other' },
  location: { type: String },
  date: { type: Date, required: true },
  images: [{ url: String, publicId: String }],
  status: { type: String, enum: ['open', 'claimed', 'closed'], default: 'open' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedAt: { type: Date },
  contactInfo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LostFound', lostFoundSchema);
