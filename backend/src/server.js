const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { initCloudinary } = require('./config/cloudinary');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const studentRoutes = require('./routes/student.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/booking.routes');
const complaintRoutes = require('./routes/complaint.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const messRoutes = require('./routes/mess.routes');
const feeRoutes = require('./routes/fee.routes');
const visitorRoutes = require('./routes/visitor.routes');
const noticeRoutes = require('./routes/notice.routes');
const staffRoutes = require('./routes/staff.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const laundryRoutes = require('./routes/laundry.routes');
const lostFoundRoutes = require('./routes/lostfound.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const notificationRoutes = require('./routes/notification.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://stay-gen.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions,
});

// Make io accessible to routes
app.set('io', io);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Connect DB & Cloudinary
connectDB();
initCloudinary();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StayGen API is running 🚀', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 StayGen Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
