const express = require('express');
const router = express.Router();
const { MessMenu, MessRating } = require('../models/Mess');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/current', protect, asyncHandler(async (req, res) => {
  const today = new Date();
  const menu = await MessMenu.findOne({ weekStartDate: { $lte: today }, isActive: true }).sort({ weekStartDate: -1 });
  res.json({ success: true, data: menu });
}));

router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const menus = await MessMenu.find().sort({ weekStartDate: -1 }).limit(10);
  res.json({ success: true, data: menus });
}));

router.post('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  await MessMenu.updateMany({}, { isActive: false });
  const menu = await MessMenu.create({ ...req.body, createdBy: req.user._id, isActive: true });
  res.status(201).json({ success: true, message: 'Menu created.', data: menu });
}));

router.put('/:id', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const menu = await MessMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: menu });
}));

router.post('/rate', protect, asyncHandler(async (req, res) => {
  const { menuId, mealType, rating, feedback, date } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  const messRating = await MessRating.findOneAndUpdate(
    { studentId: student._id, menuId, mealType, date: new Date(date) },
    { studentId: student._id, userId: req.user._id, menuId, mealType, rating, feedback, date: new Date(date) },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Rating submitted.', data: messRating });
}));

router.get('/ratings', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const ratings = await MessRating.aggregate([
    { $group: { _id: '$mealType', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  res.json({ success: true, data: ratings });
}));

module.exports = router;
