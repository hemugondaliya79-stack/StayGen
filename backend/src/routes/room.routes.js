const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImageBuffer, deleteImage } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

// GET all rooms
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type, isAC, floor, featured, search } = req.query;
  const { skip } = paginate(null, page, limit);

  let query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (isAC !== undefined) query.isAC = isAC === 'true';
  if (floor) query.floor = parseInt(floor);
  if (featured !== undefined) query.featured = featured === 'true';
  if (search) query.roomNumber = { $regex: search, $options: 'i' };

  const total = await Room.countDocuments(query);
  const rooms = await Room.find(query)
    .populate('students', 'studentId userId')
    .skip(skip).limit(parseInt(limit)).sort({ roomNumber: 1 });

  res.json({ success: true, ...paginateResponse(rooms, total, page, limit) });
}));

// GET available rooms
router.get('/available', protect, asyncHandler(async (req, res) => {
  const rooms = await Room.find({ status: 'available' }).select('roomNumber floor block type capacity occupied price isAC isAttached amenities images');
  res.json({ success: true, data: rooms });
}));

// GET single room
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('students');
  if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
  res.json({ success: true, data: room });
}));

// POST create room (admin)
router.post('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json({ success: true, message: 'Room created.', data: room });
}));

// PUT update room (admin)
router.put('/:id', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
  res.json({ success: true, message: 'Room updated.', data: room });
}));

// DELETE room (admin)
router.delete('/:id', protect, authorize('super_admin'), asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
  if (room.occupied > 0) return res.status(400).json({ success: false, message: 'Cannot delete an occupied room.' });

  // delete images from cloudinary
  for (const img of room.images) {
    try { await deleteImage(img.publicId); } catch (e) { }
  }
  await room.deleteOne();
  res.json({ success: true, message: 'Room deleted.' });
}));

// POST upload room images
router.post('/:id/images', protect, authorize('super_admin', 'hostel_admin'), upload.array('images', 5), asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

  const remainingSlots = 5 - room.images.length;
  if (remainingSlots <= 0) return res.status(400).json({ success: false, message: 'A room can have at most 5 images.' });
  const files = (req.files || []).slice(0, remainingSlots);
  if (!files.length) return res.status(400).json({ success: false, message: 'Select at least one image to upload.' });
  const uploadPromises = files.map(f => uploadImageBuffer(f.buffer, 'staygen/rooms', f.mimetype));
  const uploaded = await Promise.all(uploadPromises);
  room.images.push(...uploaded.map(({ url, publicId }) => ({ url, publicId })));
  await room.save();

  res.json({ success: true, message: 'Images uploaded.', data: room.images });
}));

// DELETE one room image (Cloudinary assets are removed when a public ID exists)
router.delete('/:id/images/:imageId', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

  const image = room.images.id(req.params.imageId);
  if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });
  if (image.publicId) {
    try { await deleteImage(image.publicId); } catch (error) { /* Keep DB state consistent even if Cloudinary already removed it. */ }
  }
  image.deleteOne();
  await room.save();
  res.json({ success: true, message: 'Room image deleted.', data: room.images });
}));

module.exports = router;
