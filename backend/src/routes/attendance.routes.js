const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const QRCode = require('qrcode');

router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { date, studentId } = req.query;
  let query = {};
  if (date) { const d = new Date(date); query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) }; }
  if (studentId) query.studentId = studentId;
  const records = await Attendance.find(query)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' } })
    .sort({ date: -1 });
  res.json({ success: true, data: records });
}));

router.get('/my', protect, asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  let query = { studentId: student._id };
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    query.date = { $gte: start, $lt: end };
  }
  const records = await Attendance.find(query).sort({ date: 1 });
  const total = records.length;
  const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
  res.json({ success: true, data: { records, stats: { total, present, absent: total - present, percentage: total ? Math.round((present / total) * 100) : 0 } } });
}));

router.post('/mark', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { studentId, date, status, method } = req.body;
  const attendance = await Attendance.findOneAndUpdate(
    { studentId, date: new Date(date) },
    { studentId, date: new Date(date), status, method, markedBy: req.user._id, userId: req.user._id },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Attendance marked.', data: attendance });
}));

router.get('/generate-qr', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const token = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const qrCode = await QRCode.toDataURL(JSON.stringify({ token, date: new Date().toISOString(), type: 'attendance' }));
  res.json({ success: true, data: { qrCode, token } });
}));

router.post('/scan-qr', protect, asyncHandler(async (req, res) => {
  const { token } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOneAndUpdate(
    { studentId: student._id, date: today },
    { studentId: student._id, date: today, status: 'present', method: 'qr', checkIn: new Date(), qrToken: token, userId: req.user._id },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Attendance marked via QR.', data: attendance });
}));

router.get('/stats', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const total = await Attendance.countDocuments({ date: { $gte: today } });
  const present = await Attendance.countDocuments({ date: { $gte: today }, status: { $in: ['present', 'late'] } });
  const students = await Student.countDocuments({ status: 'active' });
  res.json({ success: true, data: { total: students, present, absent: students - present, percentage: students ? Math.round((present / students) * 100) : 0 } });
}));

module.exports = router;
