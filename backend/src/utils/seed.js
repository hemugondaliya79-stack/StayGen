require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Room = require('../models/Room');
const { MessMenu } = require('../models/Mess');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing
  await User.deleteMany({});
  await Student.deleteMany({});
  await Room.deleteMany({});
  await MessMenu.deleteMany({});
  await Fee.deleteMany({});
  await Notice.deleteMany({});

  // Create Super Admin
  const admin = await User.create({
    name: 'StayGen Admin',
    email: 'admin@staygen.com',
    password: 'Admin@123',
    role: 'super_admin',
    phone: '9876543210',
    isActive: true,
    isEmailVerified: true,
  });

  // Create Hostel Admin
  const hostelAdmin = await User.create({
    name: 'Hostel Manager',
    email: 'manager@staygen.com',
    password: 'Admin@123',
    role: 'hostel_admin',
    phone: '9876543211',
    isActive: true,
  });

  // Create Security Guard
  await User.create({
    name: 'Security Guard',
    email: 'security@staygen.com',
    password: 'Admin@123',
    role: 'security',
    phone: '9876543212',
    isActive: true,
  });

  // Create demo students
  const studentUsers = [];
  const names = ['Arjun Sharma', 'Priya Patel', 'Rahul Verma', 'Sneha Gupta', 'Amit Singh'];
  for (let i = 0; i < 5; i++) {
    const user = await User.create({
      name: names[i],
      email: `student${i + 1}@staygen.com`,
      password: 'Student@123',
      role: 'student',
      phone: `987654321${i}`,
      isActive: true,
    });
    studentUsers.push(user);
  }

  // Create rooms
  const roomData = [
    { roomNumber: '101', floor: 1, block: 'A', type: 'single', capacity: 1, isAC: false, price: 5000 },
    { roomNumber: '102', floor: 1, block: 'A', type: 'double', capacity: 2, isAC: false, price: 3500 },
    { roomNumber: '103', floor: 1, block: 'A', type: 'double', capacity: 2, isAC: true, price: 4500 },
    { roomNumber: '201', floor: 2, block: 'B', type: 'triple', capacity: 3, isAC: false, price: 3000 },
    { roomNumber: '202', floor: 2, block: 'B', type: 'double', capacity: 2, isAC: true, price: 4500, amenities: ['WiFi', 'Study Table', 'Wardrobe'] },
    { roomNumber: '301', floor: 3, block: 'C', type: 'single', capacity: 1, isAC: true, price: 6000, isAttached: true },
  ];
  const rooms = await Room.insertMany(roomData);

  // Create students
  for (let i = 0; i < 5; i++) {
    const student = await Student.create({
      userId: studentUsers[i]._id,
      rollNumber: `CS${2024 + i}001`,
      course: 'B.Tech Computer Science',
      year: (i % 4) + 1,
      college: 'National Engineering College',
      dateOfBirth: new Date(`200${i}-0${i + 1}-15`),
      gender: i % 2 === 0 ? 'male' : 'female',
      bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-'][i],
      address: { street: `${i + 1} Main Street`, city: 'Surat', state: 'Gujarat', pincode: '395001' },
      parentDetails: { fatherName: `Father ${i + 1}`, motherName: `Mother ${i + 1}`, fatherPhone: `98765432${i + 2}` },
      emergencyContact: { name: `Emergency ${i + 1}`, relation: 'Father', phone: `98765432${i + 3}` },
      roomId: i < rooms.length ? rooms[i]._id : null,
      status: 'active',
    });
    if (i < rooms.length) {
      await Room.findByIdAndUpdate(rooms[i]._id, { $inc: { occupied: 1 }, $push: { students: student._id }, status: 'occupied' });
    }
  }

  // Create mess menu
  await MessMenu.create({
    weekStartDate: new Date(),
    isActive: true,
    createdBy: admin._id,
    menu: {
      monday: { breakfast: 'Poha, Tea', lunch: 'Dal Rice, Sabzi, Roti', snacks: 'Samosa, Chai', dinner: 'Paneer Curry, Rice, Roti' },
      tuesday: { breakfast: 'Upma, Coffee', lunch: 'Rajma Rice, Salad', snacks: 'Bread Pakora, Tea', dinner: 'Chicken Curry, Dal, Rice' },
      wednesday: { breakfast: 'Paratha, Curd', lunch: 'Chole Bhature', snacks: 'Veg Cutlet', dinner: 'Mix Veg, Roti, Rice' },
      thursday: { breakfast: 'Idli, Sambar', lunch: 'Dal Makhani, Jeera Rice', snacks: 'Popcorn, Tea', dinner: 'Egg Curry, Roti' },
      friday: { breakfast: 'Bread Omelette', lunch: 'Biryani, Raita', snacks: 'Chai, Biscuits', dinner: 'Paneer Butter Masala, Naan' },
      saturday: { breakfast: 'Puri, Aloo', lunch: 'Kadhi Rice, Pakora', snacks: 'Vada Pav', dinner: 'Special Thali' },
      sunday: { breakfast: 'Chole Bhature', lunch: 'Special Pulao, Dal, Raita', snacks: 'Ice Cream', dinner: 'Special Biryani, Raita' },
    },
  });

  // Create fees for students
  const feeStudents = await Student.find().limit(3);
  const feeUser = await User.find({ role: 'student' }).limit(3);
  for (let i = 0; i < feeStudents.length; i++) {
    await Fee.create({
      studentId: feeStudents[i]._id,
      userId: feeUser[i]._id,
      type: 'hostel',
      amount: 5000,
      month: 'August 2026',
      dueDate: new Date('2026-08-31'),
      status: i === 0 ? 'paid' : 'pending',
      ...(i === 0 && { paidDate: new Date(), paymentMethod: 'online', transactionId: 'TXN123456' }),
    });
  }

  // Create notice
  await Notice.create({
    title: 'Welcome to StayGen!',
    content: 'We are excited to launch StayGen — your next-gen hostel management platform. All services are now available online.',
    category: 'general',
    priority: 'high',
    targetRoles: ['all'],
    publishedBy: admin._id,
    isActive: true,
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Super Admin:    admin@staygen.com    / Admin@123');
  console.log('🔑 Hostel Admin:   manager@staygen.com  / Admin@123');
  console.log('🔑 Security:       security@staygen.com / Admin@123');
  console.log('🔑 Student 1:      student1@staygen.com / Student@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
