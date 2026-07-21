const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience (in years) is required'],
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0,
    },
    qualifications: [{ type: String, trim: true }],
    availability: [availabilitySlotSchema],
    isAvailableForBooking: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

doctorSchema.index({ department: 1 });
doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
