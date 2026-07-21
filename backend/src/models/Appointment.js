const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'], // e.g. "10:00-10:30"
    },
    consultationType: {
      type: String,
      enum: ['in-person', 'video', 'phone'],
      default: 'in-person',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
    },
    reasonForVisit: {
      type: String,
      trim: true,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    rescheduleHistory: [
      {
        previousDate: Date,
        previousTimeSlot: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    consultationFee: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
