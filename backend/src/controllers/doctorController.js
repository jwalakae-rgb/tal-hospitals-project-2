const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { paginate, buildMeta } = require('../utils/paginate');

/**
 * @route   GET /api/v1/doctors
 * @desc    List doctors with search/filter/pagination
 * @access  Public
 * Query params: department, specialization, search, page, limit
 */
exports.getDoctors = asyncHandler(async (req, res) => {
  const { department, specialization, search } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (department) filter.department = department;
  if (specialization) filter.specialization = new RegExp(specialization, 'i');

  let query = Doctor.find(filter).populate('user', 'name email phone').populate('department', 'name');

  if (search) {
    const regex = new RegExp(search, 'i');
    const matchingUsers = await User.find({ name: regex, role: 'doctor' }).select('_id');
    query = query.or([
      { specialization: regex },
      { user: { $in: matchingUsers.map((u) => u._id) } },
    ]);
  }

  const total = await Doctor.countDocuments(filter);
  const doctors = await query.skip(skip).limit(limit).sort('-experience');

  res.status(200).json({
    success: true,
    data: { doctors },
    meta: buildMeta({ page, limit, total }),
  });
});

/**
 * @route   GET /api/v1/doctors/:id
 * @access  Public
 */
exports.getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('department', 'name');
  if (!doctor) return next(new AppError('Doctor not found.', 404));
  res.status(200).json({ success: true, data: { doctor } });
});

/**
 * @route   POST /api/v1/doctors
 * @desc    Admin creates a doctor account + profile
 * @access  Private (admin)
 */
exports.createDoctor = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    department,
    specialization,
    experience,
    consultationFee,
    qualifications,
    bio,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('A user with this email already exists.', 409));

  const dept = await Department.findById(department);
  if (!dept) return next(new AppError('Department not found.', 404));

  const user = await User.create({ name, email, password, phone, role: 'doctor' });
  const doctor = await Doctor.create({
    user: user._id,
    department,
    specialization,
    experience,
    consultationFee,
    qualifications,
    bio,
  });

  res.status(201).json({ success: true, data: { doctor } });
});

/**
 * @route   PATCH /api/v1/doctors/:id
 * @access  Private (admin, or the doctor themself)
 */
exports.updateDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return next(new AppError('Doctor not found.', 404));

  if (req.user.role === 'doctor' && String(doctor.user) !== String(req.user.id)) {
    return next(new AppError('You can only update your own profile.', 403));
  }

  const allowedFields = ['specialization', 'experience', 'consultationFee', 'qualifications', 'bio', 'isAvailableForBooking'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) doctor[field] = req.body[field];
  });

  await doctor.save();
  res.status(200).json({ success: true, data: { doctor } });
});

/**
 * @route   PATCH /api/v1/doctors/:id/availability
 * @desc    Doctor updates their own availability slots
 * @access  Private (doctor - own profile only)
 */
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return next(new AppError('Doctor not found.', 404));

  if (req.user.role === 'doctor' && String(doctor.user) !== String(req.user.id)) {
    return next(new AppError('You can only update your own availability.', 403));
  }

  doctor.availability = req.body.availability;
  await doctor.save();

  res.status(200).json({ success: true, data: { doctor } });
});

/**
 * @route   DELETE /api/v1/doctors/:id
 * @access  Private (admin)
 */
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return next(new AppError('Doctor not found.', 404));

  await User.findByIdAndUpdate(doctor.user, { isActive: false });
  res.status(200).json({ success: true, message: 'Doctor account deactivated.' });
});
