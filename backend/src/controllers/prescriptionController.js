const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @route   POST /api/v1/prescriptions
 * @desc    Doctor adds a prescription for a completed/approved appointment
 * @access  Private (doctor)
 */
exports.createPrescription = asyncHandler(async (req, res, next) => {
  const { appointmentId, diagnosis, medicines, notes, followUpDate, treatmentCost } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return next(new AppError('Appointment not found.', 404));

  const doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
    return next(new AppError('You can only add prescriptions for your own appointments.', 403));
  }

  if (!['approved', 'completed'].includes(appointment.status)) {
    return next(new AppError('Prescriptions can only be added to approved or completed appointments.', 400));
  }

  const existing = await Prescription.findOne({ appointment: appointmentId });
  if (existing) return next(new AppError('A prescription already exists for this appointment.', 409));

  const prescription = await Prescription.create({
    appointment: appointmentId,
    patient: appointment.patient,
    doctor: doctor._id,
    diagnosis,
    medicines,
    notes,
    followUpDate,
    treatmentCost,
  });

  if (appointment.status === 'approved') {
    appointment.status = 'completed';
    await appointment.save();
  }

  res.status(201).json({ success: true, data: { prescription } });
});

/**
 * @route   GET /api/v1/prescriptions/me
 * @desc    Patient views their own prescriptions
 * @access  Private (patient)
 */
exports.getMyPrescriptions = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user.id });
  if (!patient) return next(new AppError('Patient profile not found.', 404));

  const prescriptions = await Prescription.find({ patient: patient._id })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .populate('appointment', 'appointmentDate timeSlot')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: prescriptions.length, data: { prescriptions } });
});

/**
 * @route   GET /api/v1/prescriptions/:id
 * @access  Private (owner patient, owner doctor, admin)
 */
exports.getPrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .populate('appointment', 'appointmentDate timeSlot');

  if (!prescription) return next(new AppError('Prescription not found.', 404));
  res.status(200).json({ success: true, data: { prescription } });
});

/**
 * @route   PATCH /api/v1/prescriptions/:id
 * @access  Private (doctor - owner only)
 */
exports.updatePrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) return next(new AppError('Prescription not found.', 404));

  const doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor || String(prescription.doctor) !== String(doctor._id)) {
    return next(new AppError('You can only update your own prescriptions.', 403));
  }

  const allowedFields = ['diagnosis', 'medicines', 'notes', 'followUpDate', 'treatmentCost'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) prescription[field] = req.body[field];
  });
  await prescription.save();

  res.status(200).json({ success: true, data: { prescription } });
});
