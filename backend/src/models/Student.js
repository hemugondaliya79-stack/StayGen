const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, unique: true },
  rollNumber: { type: String },
  course: { type: String },
  year: { type: Number, min: 1, max: 5 },
  college: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  parentDetails: {
    fatherName: String,
    motherName: String,
    fatherPhone: String,
    motherPhone: String,
    occupation: String,
    email: String,
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String,
  },
  documents: [{
    name: String,
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  joinDate: { type: Date, default: Date.now },
  leaveDate: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },
  profileCompletion: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate student ID
studentSchema.pre('save', async function () {
  if (!this.studentId) {
    let unique = false;
    let newId = '';
    let attempts = 0;
    while (!unique && attempts < 10) {
      const count = await mongoose.model('Student').countDocuments();
      newId = `STU${String(count + 1 + attempts).padStart(4, '0')}`;
      const existing = await mongoose.model('Student').findOne({ studentId: newId });
      if (!existing) {
        unique = true;
      } else {
        attempts++;
      }
    }
    if (!unique) {
      newId = `STU${Date.now().toString().slice(-6)}`;
    }
    this.studentId = newId;
  }
  // Calculate profile completion
  let completed = 0;
  const fields = ['rollNumber', 'course', 'college', 'dateOfBirth', 'gender', 'bloodGroup', 'address', 'parentDetails', 'emergencyContact'];
  fields.forEach(f => { if (this[f] && JSON.stringify(this[f]) !== '{}') completed++; });
  this.profileCompletion = Math.round((completed / fields.length) * 100);
});

module.exports = mongoose.model('Student', studentSchema);
