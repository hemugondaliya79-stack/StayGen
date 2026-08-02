const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: {
    type: String,
    enum: ['super_admin', 'hostel_admin', 'student', 'security'],
    default: 'student',
  },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  refreshTokens: [{ type: String, select: false }],
  lastLogin: { type: Date },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

module.exports = mongoose.model('User', userSchema);
