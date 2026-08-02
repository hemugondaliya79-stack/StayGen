const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  type: { type: String, enum: ['hostel', 'mess', 'maintenance', 'other'], default: 'hostel' },
  amount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number },
  month: { type: String, required: true }, // e.g., "January 2024"
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'waived'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'online', 'cheque', 'upi'], },
  transactionId: { type: String },
  invoiceNumber: { type: String, unique: true },
  notes: { type: String },
  receiptUrl: { type: String },
}, { timestamps: true });

feeSchema.pre('save', function () {
  this.finalAmount = this.amount - (this.discount || 0);
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
});

module.exports = mongoose.model('Fee', feeSchema);
