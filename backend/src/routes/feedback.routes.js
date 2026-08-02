const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Stub feedback
const feedbackData = [];

router.post('/', protect, asyncHandler(async (req, res) => {
  feedbackData.push({ ...req.body, userId: req.user._id, createdAt: new Date() });
  res.status(201).json({ success: true, message: 'Feedback submitted. Thank you!' });
}));

router.get('/', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, data: feedbackData });
}));

module.exports = router;
