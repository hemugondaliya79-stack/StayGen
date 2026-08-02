const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const QRCode = require('qrcode');
const { paginate, paginateResponse } = require('../utils/pagination');

router.get('/', protect, authorize('super_admin', 'hostel_admin', 'security'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, date } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (status) query.status = status;
  if (date) {
    const d = new Date(date);
    query.expectedDate = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }
  const total = await Visitor.countDocuments(query);
  const visitors = await Visitor.find(query)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' } })
    .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json({ success: true, ...paginateResponse(visitors, total, page, limit) });
}));

router.get('/my', protect, asyncHandler(async (req, res) => {
  const visitors = await Visitor.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: visitors });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

  const visitor = await Visitor.create({ ...req.body, studentId: student._id, userId: req.user._id, status: 'pending' });
  const qrData = JSON.stringify({ visitorId: visitor._id, token: visitor._id.toString() });
  const qrCode = await QRCode.toDataURL(qrData);
  visitor.qrCode = qrCode;
  await visitor.save();

  res.status(201).json({ success: true, message: 'Visitor request submitted.', data: visitor });
}));

router.put('/:id/approve', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found.' });

  const io = req.app.get('io');
  const notif = await Notification.create({ userId: visitor.userId, title: 'Visitor Approved', message: `Visitor ${visitor.visitorName} has been approved.`, type: 'visitor' });
  if (io) io.to(visitor.userId.toString()).emit('notification', notif);

  res.json({ success: true, message: 'Visitor approved.', data: visitor });
}));

router.put('/:id/checkin', protect, authorize('super_admin', 'hostel_admin', 'security'), asyncHandler(async (req, res) => {
  const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'checked_in', checkIn: new Date() }, { new: true });
  res.json({ success: true, message: 'Visitor checked in.', data: visitor });
}));

router.put('/:id/checkout', protect, authorize('super_admin', 'hostel_admin', 'security'), asyncHandler(async (req, res) => {
  const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: 'checked_out', checkOut: new Date() }, { new: true });
  res.json({ success: true, message: 'Visitor checked out.', data: visitor });
}));

// Verify by QR
router.post('/verify-qr', protect, authorize('security', 'hostel_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { visitorId } = req.body;
  const visitor = await Visitor.findById(visitorId)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } });
  if (!visitor) return res.status(404).json({ success: false, message: 'Invalid QR code.' });
  res.json({ success: true, data: visitor });
}));

module.exports = router;
