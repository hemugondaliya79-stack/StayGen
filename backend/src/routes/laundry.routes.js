const express = require('express');
const router = express.Router();
const Laundry = require('../models/Laundry');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (status) query.status = status;
  const total = await Laundry.countDocuments(query);
  const requests = await Laundry.find(query)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' } })
    .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json({ success: true, ...paginateResponse(requests, total, page, limit) });
}));

router.get('/my', protect, asyncHandler(async (req, res) => {
  const requests = await Laundry.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: requests });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  const { items, pickupDate, notes } = req.body;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const request = await Laundry.create({ studentId: student._id, userId: req.user._id, items, totalItems, pickupDate, notes });
  res.status(201).json({ success: true, message: 'Laundry request submitted.', data: request });
}));

router.put('/:id/status', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { status, deliveryDate } = req.body;
  const request = await Laundry.findByIdAndUpdate(req.params.id, { status, ...(deliveryDate && { deliveryDate }) }, { new: true });
  res.json({ success: true, message: 'Status updated.', data: request });
}));

module.exports = router;
