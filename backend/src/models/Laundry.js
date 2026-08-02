const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  items: [{
    name: String,
    quantity: Number,
  }],
  totalItems: { type: Number },
  pickupDate: { type: Date, required: true },
  deliveryDate: { type: Date },
  status: { type: String, enum: ['requested', 'picked_up', 'in_progress', 'ready', 'delivered'], default: 'requested' },
  notes: { type: String },
  charges: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Laundry', laundrySchema);
