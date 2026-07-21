const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 130,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
      default: null,
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    medicalReports: [medicalReportSchema],
  },
  { timestamps: true }
);

patientSchema.index({ city: 1 });

module.exports = mongoose.model('Patient', patientSchema);
