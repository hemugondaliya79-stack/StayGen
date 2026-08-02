const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  name: { type: String, required: true },
  category: { type: String, enum: ['furniture', 'electronics', 'cleaning', 'kitchen', 'sports', 'stationery', 'other'], default: 'other' },
  quantity: { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, default: 5 }, // alert threshold
  unit: { type: String, default: 'units' },
  condition: { type: String, enum: ['good', 'fair', 'poor', 'damaged'], default: 'good' },
  location: { type: String },
  purchaseDate: { type: Date },
  purchasePrice: { type: Number },
  vendor: { type: String },
  notes: { type: String },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
