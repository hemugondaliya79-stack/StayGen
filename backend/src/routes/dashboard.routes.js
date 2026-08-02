const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Admin Dashboard Stats
router.get('/admin', protect, authorize('super_admin', 'hostel_admin'), asyncHandler(async (req, res) => {
  const [totalStudents, totalRooms, totalUsers, pendingComplaints, pendingBookings] = await Promise.all([
    Student.countDocuments({ status: 'active' }),
    Room.countDocuments(),
    User.countDocuments(),
    Complaint.countDocuments({ status: 'open' }),
    Booking.countDocuments({ status: 'pending' }),
  ]);

  const rooms = await Room.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const roomStats = rooms.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayVisitors, todayAttendance] = await Promise.all([
    Visitor.countDocuments({ checkIn: { $gte: today } }),
    Attendance.countDocuments({ date: { $gte: today }, status: { $in: ['present', 'late'] } }),
  ]);

  // Monthly revenue (paid fees this month)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const revenueData = await Fee.aggregate([
    { $match: { status: 'paid', paidDate: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } },
  ]);
  const monthlyRevenue = revenueData[0]?.total || 0;

  // Revenue chart (last 6 months)
  const revenueChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const rev = await Fee.aggregate([
      { $match: { status: 'paid', paidDate: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    revenueChart.push({
      month: start.toLocaleString('default', { month: 'short' }),
      revenue: rev[0]?.total || 0,
    });
  }

  // Recent activities
  const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(3)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
    .populate('roomId', 'roomNumber');
  const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(3)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } });

  res.json({
    success: true,
    data: {
      stats: {
        totalStudents, totalRooms, totalUsers,
        availableRooms: roomStats.available || 0,
        occupiedRooms: roomStats.occupied || 0,
        maintenanceRooms: roomStats.maintenance || 0,
        pendingComplaints, pendingBookings, todayVisitors,
        attendancePercentage: totalStudents ? Math.round((todayAttendance / totalStudents) * 100) : 0,
        monthlyRevenue,
      },
      charts: { revenueChart },
      recent: { bookings: recentBookings, complaints: recentComplaints },
    },
  });
}));

// Student Dashboard
router.get('/student', protect, asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .populate('userId', 'name email avatar phone')
    .populate('roomId', 'roomNumber floor block type price isAC');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [attendance, pendingFees, activeComplaints, recentNotices, pendingVisitors] = await Promise.all([
    student ? Attendance.findOne({ studentId: student._id, date: { $gte: today } }) : null,
    student ? Fee.find({ studentId: student._id, status: { $in: ['pending', 'overdue'] } }).limit(3) : [],
    student ? Complaint.find({ studentId: student._id, status: { $in: ['open', 'in_progress'] } }).limit(3) : [],
    null,
    student ? Visitor.find({ studentId: student._id, status: { $in: ['pending', 'approved'] } }).limit(3) : [],
  ]);

  // Attendance this month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthAttendance = student ? await Attendance.find({ studentId: student._id, date: { $gte: monthStart } }) : [];
  const presentCount = monthAttendance.filter(a => a.status === 'present' || a.status === 'late').length;

  res.json({
    success: true,
    data: {
      student,
      todayAttendance: attendance?.status || 'absent',
      monthlyAttendance: { total: monthAttendance.length, present: presentCount, percentage: monthAttendance.length ? Math.round((presentCount / monthAttendance.length) * 100) : 0 },
      pendingFees,
      activeComplaints,
      pendingVisitors,
    },
  });
}));

module.exports = router;
