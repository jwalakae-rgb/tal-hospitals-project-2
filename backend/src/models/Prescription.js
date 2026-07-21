const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true }, // e.g. "500mg"
    frequency: { type: String, trim: true }, // e.g. "twice a day"
    duration: { type: String, trim: true }, // e.g. "5 days"
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    medicines: [medicineSchema],
    notes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
    treatmentCost: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
