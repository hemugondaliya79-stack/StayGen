const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, condition } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (category) query.category = category;
  if (condition) query.condition = condition;
  const total = await Inventory.countDocuments(query);
  const items = await Inventory.find(query).skip(skip).limit(parseInt(limit)).sort({ name: 1 });
  res.json({ success: true, ...paginateResponse(items, total, page, limit) });
}));

router.post('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const item = await Inventory.create({ ...req.body, managedBy: req.user._id });
  res.status(201).json({ success: true, message: 'Inventory item added.', data: item });
}));

router.put('/:id', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: item });
}));

router.delete('/:id', protect, authorize('super_admin'), asyncHandler(async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Item deleted.' });
}));

module.exports = router;
