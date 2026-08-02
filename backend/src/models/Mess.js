const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  weekStartDate: { type: Date, required: true },
  menu: {
    monday: { breakfast: String, lunch: String, snacks: String, dinner: String },
    tuesday: { breakfast: String, lunch: String, snacks: String, dinner: String },
    wednesday: { breakfast: String, lunch: String, snacks: String, dinner: String },
    thursday: { breakfast: String, lunch: String, snacks: String, dinner: String },
    friday: { breakfast: String, lunch: String, snacks: String, dinner: String },
    saturday: { breakfast: String, lunch: String, snacks: String, dinner: String },
    sunday: { breakfast: String, lunch: String, snacks: String, dinner: String },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const messRatingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessMenu' },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'snacks', 'dinner'] },
  date: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
}, { timestamps: true });

const MessMenu = mongoose.model('MessMenu', messSchema);
const MessRating = mongoose.model('MessRating', messRatingSchema);

module.exports = { MessMenu, MessRating };
