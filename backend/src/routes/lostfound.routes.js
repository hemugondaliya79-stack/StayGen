const express = require('express');
const router = express.Router();
const LostFound = require('../models/LostFound');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImageBuffer } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status, category } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (category) query.category = category;
  const total = await LostFound.countDocuments(query);
  const items = await LostFound.find(query)
    .populate('reportedBy', 'name email avatar')
    .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json({ success: true, ...paginateResponse(items, total, page, limit) });
}));

router.post('/', protect, upload.array('images', 3), asyncHandler(async (req, res) => {
  let images = [];
  if (req.files?.length) {
    const uploads = req.files.map(f => uploadImageBuffer(f.buffer, 'staygen/lostfound'));
    images = (await Promise.all(uploads)).map(({ url, publicId }) => ({ url, publicId }));
  }
  const item = await LostFound.create({ ...req.body, reportedBy: req.user._id, images });
  res.status(201).json({ success: true, message: 'Item reported.', data: item });
}));

router.put('/:id/claim', protect, asyncHandler(async (req, res) => {
  const item = await LostFound.findByIdAndUpdate(req.params.id, { status: 'claimed', claimedBy: req.user._id, claimedAt: new Date() }, { new: true });
  res.json({ success: true, message: 'Item claimed.', data: item });
}));

module.exports = router;
