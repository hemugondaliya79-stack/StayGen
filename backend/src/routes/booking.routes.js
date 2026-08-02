const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { sendBookingApprovalEmail } = require('../config/email');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paginateResponse } = require('../utils/pagination');

// GET all bookings (admin)
router.get('/', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const { skip } = paginate(null, page, limit);
  let query = {};
  if (status) query.status = status;

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' } })
    .populate('roomId', 'roomNumber floor block type price')
    .populate('approvedBy', 'name')
    .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });

  res.json({ success: true, ...paginateResponse(bookings, total, page, limit) });
}));

// GET my bookings (student)
router.get('/my', protect, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('roomId', 'roomNumber floor block type price isAC')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
}));

// POST create booking request (student)
router.post('/', protect, asyncHandler(async (req, res) => {
  const { roomId, checkIn, reason } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

  // Check if student already has a pending/approved booking
  const existing = await Booking.findOne({ userId: req.user._id, status: { $in: ['pending', 'approved'] } });
  if (existing) return res.status(400).json({ success: false, message: 'You already have an active booking request.' });

  let status = 'pending';
  if (room.occupied >= room.capacity) {
    status = 'waitlisted';
  }

  const booking = await Booking.create({ studentId: student._id, userId: req.user._id, roomId, checkIn, reason, status });

  // Notify admin
  const io = req.app.get('io');
  const notification = await Notification.create({
    userId: req.user._id,
    title: 'Booking Request Submitted',
    message: `Your booking request for Room ${room.roomNumber} has been submitted.`,
    type: 'booking',
    link: `/bookings/${booking._id}`,
  });
  if (io) io.to(req.user._id.toString()).emit('notification', notification);

  res.status(201).json({ success: true, message: 'Booking request submitted.', data: booking });
}));

// PUT update booking status (admin)
router.put('/:id/status', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
    .populate('roomId', 'roomNumber');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

  booking.status = status;
  if (status === 'rejected') booking.rejectionReason = rejectionReason;
  if (status === 'approved') {
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    // Update room occupancy
    await Room.findByIdAndUpdate(booking.roomId._id, { $inc: { occupied: 1 } });
    // Update student room
    await Student.findByIdAndUpdate(booking.studentId._id, { roomId: booking.roomId._id });
    // Update room status
    const room = await Room.findById(booking.roomId._id);
    if (room && room.occupied >= room.capacity) {
      await Room.findByIdAndUpdate(room._id, { status: 'occupied' });
    }
  }
  await booking.save();

  // Send email notification
  try {
    const studentUser = booking.studentId.userId;
    await sendBookingApprovalEmail(studentUser, { status, roomNumber: booking.roomId.roomNumber });
  } catch (e) { }

  // Socket notification
  const io = req.app.get('io');
  const notification = await Notification.create({
    userId: booking.userId,
    title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your booking for Room ${booking.roomId.roomNumber} has been ${status}.`,
    type: 'booking',
    link: `/bookings/${booking._id}`,
  });
  if (io) io.to(booking.userId.toString()).emit('notification', notification);

  res.json({ success: true, message: `Booking ${status}.`, data: booking });
}));

// DELETE cancel booking (student)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
  if (booking.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  if (['approved', 'rejected'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking.` });
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, message: 'Booking cancelled.' });
}));

module.exports = router;
