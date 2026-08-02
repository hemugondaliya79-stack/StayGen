const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImageBuffer } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, priority } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = { isActive: true };
  if (category) query.category = category;
  if (priority) query.priority = priority;
  const total = await Notice.countDocuments(query);
  const notices = await Notice.find(query)
    .populate('publishedBy', 'name avatar')
    .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json({ success: true, ...paginateResponse(notices, total, page, limit) });
}));

router.post('/', protect, authorize('super_admin', 'hostel_admin'), upload.array('attachments', 3), asyncHandler(async (req, res) => {
  let attachments = [];
  if (req.files?.length) {
    const uploads = req.files.map(f => uploadImageBuffer(f.buffer, 'staygen/notices'));
    const results = await Promise.all(uploads);
    attachments = results.map(({ url, publicId }, i) => ({ name: req.files[i].originalname, url, publicId }));
  }
  const notice = await Notice.create({ ...req.body, publishedBy: req.user._id, attachments });
  res.status(201).json({ success: true, message: 'Notice published.', data: notice });
}));

router.put('/:id', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: notice });
}));

router.delete('/:id', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notice deleted.' });
}));

module.exports = router;
