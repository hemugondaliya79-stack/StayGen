const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', protect, asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 }).limit(parseInt(limit));
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, data: { notifications, unreadCount } });
}));

router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true, message: 'Notification marked as read.' });
}));

router.put('/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read.' });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification deleted.' });
}));

module.exports = router;
