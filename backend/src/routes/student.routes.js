const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImageBuffer, deleteImage } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

// GET all students (admin)
router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status, gender, course } = req.query;
  const { skip } = paginate(null, page, limit);

  let query = {};
  if (status) query.status = status;
  if (gender) query.gender = gender;
  if (course) query.course = { $regex: course, $options: 'i' };

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }).select('_id');
    const userIds = users.map(u => u._id);
    query.$or = [
      { userId: { $in: userIds } },
      { studentId: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .populate('userId', 'name email phone avatar role isActive')
    .populate('roomId', 'roomNumber floor block type')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, ...paginateResponse(students, total, page, limit) });
}));

// GET my student profile (student)
router.get('/me', protect, asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .populate('userId', 'name email phone avatar')
    .populate('roomId', 'roomNumber floor block type price isAC');
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });
  res.json({ success: true, data: student });
}));

// GET single student
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('userId', 'name email phone avatar')
    .populate('roomId', 'roomNumber floor block type price');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  res.json({ success: true, data: student });
}));

// PUT update student profile
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  // Only student themselves or admin can update
  if (req.user.role === 'student' && student.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('userId', 'name email phone avatar');
  res.json({ success: true, message: 'Profile updated.', data: updated });
}));

// POST upload document
router.post('/:id/documents', protect, upload.single('document'), asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  const { url, publicId } = await uploadImageBuffer(req.file.buffer, 'staygen/documents', req.file.mimetype);
  student.documents.push({ name: req.body.name || req.file.originalname, url, publicId });
  await student.save();

  res.json({ success: true, message: 'Document uploaded.', data: student.documents });
}));

// DELETE document
router.delete('/:id/documents/:docId', protect, asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  const doc = student.documents.id(req.params.docId);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

  try { await deleteImage(doc.publicId); } catch (e) { }
  student.documents.pull(req.params.docId);
  await student.save();

  res.json({ success: true, message: 'Document deleted.' });
}));

// PUT update user info (name, phone, avatar)
router.put('/:id/user-info', protect, upload.single('avatar'), asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.phone) updateData.phone = req.body.phone;

  if (req.file) {
    const { url, publicId } = await uploadImageBuffer(req.file.buffer, 'staygen/avatars');
    updateData.avatar = url;
    updateData.avatarPublicId = publicId;
  }

  const user = await User.findByIdAndUpdate(student.userId, updateData, { new: true }).select('-password');
  res.json({ success: true, message: 'User info updated.', data: user });
}));

module.exports = router;
