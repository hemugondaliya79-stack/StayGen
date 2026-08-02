const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  const total = await Fee.countDocuments(query);
  const fees = await Fee.find(query)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' } })
    .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json({ success: true, ...paginateResponse(fees, total, page, limit) });
}));

router.get('/my', protect, asyncHandler(async (req, res) => {
  const fees = await Fee.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: fees });
}));

router.post('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const fee = await Fee.create(req.body);
  res.status(201).json({ success: true, message: 'Fee record created.', data: fee });
}));

router.put('/:id/pay', protect, asyncHandler(async (req, res) => {
  const { paymentMethod, transactionId } = req.body;
  const fee = await Fee.findById(req.params.id);
  if (!fee) return res.status(404).json({ success: false, message: 'Fee not found.' });
  fee.status = 'paid';
  fee.paidDate = new Date();
  fee.paymentMethod = paymentMethod;
  fee.transactionId = transactionId;
  await fee.save();
  res.json({ success: true, message: 'Payment recorded.', data: fee });
}));

router.delete('/:id', protect, authorize('super_admin'), asyncHandler(async (req, res) => {
  await Fee.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Fee record deleted.' });
}));

module.exports = router;
