const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImageBuffer } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', role, isActive } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const total = await User.countDocuments(query);
  const users = await User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json({ success: true, ...paginateResponse(users, total, page, limit) });
}));

router.get('/:id', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, data: user });
}));

router.put('/:id', protect, asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { name, phone }, { new: true });
  res.json({ success: true, data: user });
}));

router.put('/:id/avatar', protect, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const { url } = await uploadImageBuffer(req.file.buffer, 'staygen/avatars');
  const user = await User.findByIdAndUpdate(req.params.id, { avatar: url }, { new: true });
  res.json({ success: true, data: { avatar: user.avatar } });
}));

router.patch('/:id/toggle-active', protect, authorize('super_admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: { isActive: user.isActive } });
}));

module.exports = router;
