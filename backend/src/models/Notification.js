const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'booking', 'complaint', 'fee', 'visitor', 'notice', 'attendance'],
    default: 'info',
  },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
