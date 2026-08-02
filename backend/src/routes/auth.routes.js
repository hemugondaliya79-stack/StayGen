const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { sendOTPEmail, sendWelcomeEmail } = require('../config/email');
const asyncHandler = require('../utils/asyncHandler');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' });
  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// @POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered.' });

  const user = await User.create({ name, email, password, role, phone });

  if (role === 'student') {
    await Student.create({ userId: user._id });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

  try { await sendWelcomeEmail(user); } catch (e) { console.error('Welcome email failed:', e.message); }

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }, accessToken },
  });
}));

// @POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshTokens.push(refreshToken);
  user.lastLogin = new Date();
  await user.save();

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({
    success: true,
    message: 'Login successful.',
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone }, accessToken },
  });
}));

// @POST /api/auth/logout
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await User.findOneAndUpdate({ refreshTokens: refreshToken }, { $pull: { refreshTokens: refreshToken } });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully.' });
}));

// @POST /api/auth/logout-all
router.post('/logout-all', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { $set: { refreshTokens: [] } });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out from all devices.' });
}));

// @POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'Refresh token not provided.' });

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
  user.refreshTokens = user.refreshTokens.filter(t => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', newRefreshToken, cookieOptions);

  res.json({ success: true, data: { accessToken } });
}));

// @POST /api/auth/forgot-password
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

  const otp = user.generateOTP();
  await user.save();

  try {
    await sendOTPEmail(email, otp, user.name);
    res.json({ success: true, message: 'OTP sent to your email address.' });
  } catch (error) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
  }
}));

// @POST /api/auth/verify-otp
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiry');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  if (new Date() > user.otpExpiry) return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });

  res.json({ success: true, message: 'OTP verified successfully.' });
}));

// @POST /api/auth/reset-password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiry +password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
  if (new Date() > user.otpExpiry) return res.status(400).json({ success: false, message: 'OTP expired.' });

  user.password = password;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.refreshTokens = [];
  await user.save();

  res.json({ success: true, message: 'Password reset successfully. Please log in.' });
}));

// @GET /api/auth/me
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone, isActive: user.isActive } } });
}));

module.exports = router;
