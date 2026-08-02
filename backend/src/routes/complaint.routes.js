const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImageBuffer } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

// GET all complaints (admin)
router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category, priority } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' } })
    .populate('assignedTo', 'name email')
    .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });

  res.json({ success: true, ...paginateResponse(complaints, total, page, limit) });
}));

// GET my complaints (student)
router.get('/my', protect, asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ userId: req.user._id })
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: complaints });
}));

// GET single complaint
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' } })
    .populate('assignedTo', 'name email')
    .populate('timeline.updatedBy', 'name');
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
  res.json({ success: true, data: complaint });
}));

// POST create complaint (student)
router.post('/', protect, upload.array('images', 3), asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

  let images = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(f => uploadImageBuffer(f.buffer, 'staygen/complaints'));
    images = (await Promise.all(uploadPromises)).map(({ url, publicId }) => ({ url, publicId }));
  }

  const complaint = await Complaint.create({
    studentId: student._id, userId: req.user._id, title, description, category, priority, images,
    timeline: [{ status: 'open', message: 'Complaint raised.', updatedBy: req.user._id }],
  });

  res.status(201).json({ success: true, message: 'Complaint raised successfully.', data: complaint });
}));

// PUT update complaint status (admin)
router.put('/:id/status', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { status, message, assignedTo } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

  complaint.status = status;
  if (assignedTo) complaint.assignedTo = assignedTo;
  if (status === 'resolved') complaint.resolvedAt = new Date();
  complaint.timeline.push({ status, message: message || `Status updated to ${status}`, updatedBy: req.user._id });
  await complaint.save();

  // Socket notification
  const io = req.app.get('io');
  const notification = await Notification.create({
    userId: complaint.userId,
    title: 'Complaint Update',
    message: `Your complaint "${complaint.title}" status updated to ${status}.`,
    type: 'complaint',
    link: `/complaints/${complaint._id}`,
  });
  if (io) io.to(complaint.userId.toString()).emit('notification', notification);

  res.json({ success: true, message: 'Complaint updated.', data: complaint });
}));

// POST rate resolved complaint (student)
router.post('/:id/rate', protect, asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
  if (complaint.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized.' });

  complaint.rating = rating;
  complaint.feedback = feedback;
  await complaint.save();
  res.json({ success: true, message: 'Rating submitted.', data: complaint });
}));

module.exports = router;
