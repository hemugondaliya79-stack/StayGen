const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  phone: String,
  email: String,
  totalRooms: { type: Number, default: 0 },
  totalCapacity: { type: Number, default: 0 },
  logo: String,
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  settings: {
    messEnabled: { type: Boolean, default: true },
    laundryEnabled: { type: Boolean, default: true },
    visitorAllowed: { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
