const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { paginate, buildMeta } = require('../utils/paginate');

const populateChain = (query) =>
  query
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
    .populate('department', 'name');

/**
 * @route   POST /api/v1/appointments
 * @desc    Patient books an appointment
 * @access  Private (patient)
 */
exports.createAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, appointmentDate, timeSlot, consultationType, reasonForVisit } = req.body;

  const patient = await Patient.findOne({ user: req.user.id });
  if (!patient) return next(new AppError('Patient profile not found.', 404));

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return next(new AppError('Doctor not found.', 404));
  if (!doctor.isAvailableForBooking) {
    return next(new AppError('This doctor is not currently accepting bookings.', 400));
  }

  // Prevent double-booking the same doctor/date/slot
  const conflict = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    timeSlot,
    status: { $in: ['pending', 'approved', 'rescheduled'] },
  });
  if (conflict) {
    return next(new AppError('This time slot is already booked. Please choose another.', 409));
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctorId,
    department: doctor.department,
    appointmentDate,
    timeSlot,
    consultationType,
    reasonForVisit,
    consultationFee: doctor.consultationFee,
  });

  const populated = await populateChain(Appointment.findById(appointment._id));
  res.status(201).json({ success: true, data: { appointment: populated } });
});

/**
 * @route   GET /api/v1/appointments/me
 * @desc    Get logged-in patient's or doctor's appointments
 * @access  Private (patient, doctor)
 */
exports.getMyAppointments = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return next(new AppError('Patient profile not found.', 404));
    filter.patient = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return next(new AppError('Doctor profile not found.', 404));
    filter.doctor = doctor._id;
  }

  if (status) filter.status = status;

  const total = await Appointment.countDocuments(filter);
  const appointments = await populateChain(
    Appointment.find(filter).skip(skip).limit(limit).sort('-appointmentDate')
  );

  res.status(200).json({
    success: true,
    data: { appointments },
    meta: buildMeta({ page, limit, total }),
  });
});

/**
 * @route   GET /api/v1/appointments
 * @desc    Admin: list/search/filter all appointments
 * @access  Private (admin)
 */
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const { status, doctor, department, from, to } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (status) filter.status = status;
  if (doctor) filter.doctor = doctor;
  if (department) filter.department = department;
  if (from || to) {
    filter.appointmentDate = {};
    if (from) filter.appointmentDate.$gte = new Date(from);
    if (to) filter.appointmentDate.$lte = new Date(to);
  }

  const total = await Appointment.countDocuments(filter);
  const appointments = await populateChain(
    Appointment.find(filter).skip(skip).limit(limit).sort('-appointmentDate')
  );

  res.status(200).json({
    success: true,
    data: { appointments },
    meta: buildMeta({ page, limit, total }),
  });
});

/**
 * @route   GET /api/v1/appointments/:id
 * @access  Private (owner patient, owner doctor, admin)
 */
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await populateChain(Appointment.findById(req.params.id));
  if (!appointment) return next(new AppError('Appointment not found.', 404));
  res.status(200).json({ success: true, data: { appointment } });
});

/**
 * @route   PATCH /api/v1/appointments/:id/status
 * @desc    Doctor approves/rejects; admin or doctor marks completed/cancelled
 * @access  Private (doctor, admin)
 */
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { status, cancellationReason } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new AppError('Appointment not found.', 404));

  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
      return next(new AppError('You can only update your own appointments.', 403));
    }
  }

  const validTransitions = {
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['completed', 'cancelled'],
    rescheduled: ['approved', 'rejected', 'cancelled'],
  };
  const allowed = validTransitions[appointment.status] || [];
  if (!allowed.includes(status)) {
    return next(new AppError(`Cannot transition appointment from '${appointment.status}' to '${status}'.`, 400));
  }

  appointment.status = status;
  if (status === 'cancelled' && cancellationReason) {
    appointment.cancellationReason = cancellationReason;
  }
  await appointment.save();

  const populated = await populateChain(Appointment.findById(appointment._id));
  res.status(200).json({ success: true, data: { appointment: populated } });
});

/**
 * @route   PATCH /api/v1/appointments/:id/reschedule
 * @access  Private (patient - owner only)
 */
exports.rescheduleAppointment = asyncHandler(async (req, res, next) => {
  const { appointmentDate, timeSlot } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new AppError('Appointment not found.', 404));

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient || String(appointment.patient) !== String(patient._id)) {
      return next(new AppError('You can only reschedule your own appointments.', 403));
    }
  }

  if (!['pending', 'approved'].includes(appointment.status)) {
    return next(new AppError(`Cannot reschedule an appointment with status '${appointment.status}'.`, 400));
  }

  const conflict = await Appointment.findOne({
    doctor: appointment.doctor,
    appointmentDate,
    timeSlot,
    status: { $in: ['pending', 'approved', 'rescheduled'] },
    _id: { $ne: appointment._id },
  });
  if (conflict) return next(new AppError('This time slot is already booked. Please choose another.', 409));

  appointment.rescheduleHistory.push({
    previousDate: appointment.appointmentDate,
    previousTimeSlot: appointment.timeSlot,
  });
  appointment.appointmentDate = appointmentDate;
  appointment.timeSlot = timeSlot;
  appointment.status = 'rescheduled';
  await appointment.save();

  const populated = await populateChain(Appointment.findById(appointment._id));
  res.status(200).json({ success: true, data: { appointment: populated } });
});

/**
 * @route   DELETE /api/v1/appointments/:id
 * @desc    Cancel an appointment (soft cancel, keeps record)
 * @access  Private (patient - owner, admin)
 */
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new AppError('Appointment not found.', 404));

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient || String(appointment.patient) !== String(patient._id)) {
      return next(new AppError('You can only cancel your own appointments.', 403));
    }
  }

  if (['completed', 'cancelled'].includes(appointment.status)) {
    return next(new AppError(`Cannot cancel an appointment that is already '${appointment.status}'.`, 400));
  }

  appointment.status = 'cancelled';
  appointment.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
  await appointment.save();

  res.status(200).json({ success: true, message: 'Appointment cancelled.', data: { appointment } });
});
