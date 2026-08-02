const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Staff management stub - reuses User model with role=staff
const User = require('../models/User');

router.get('/', protect, asyncHandler(async (req, res) => {
  const staff = await User.find({ role: { $in: ['hostel_admin', 'security'] } });
  res.json({ success: true, data: staff });
}));

module.exports = router;
