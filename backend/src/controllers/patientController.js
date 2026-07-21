const Patient = require('../models/Patient');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { paginate, buildMeta } = require('../utils/paginate');

/**
 * @route   GET /api/v1/patients/me
 * @access  Private (patient)
 */
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email phone');
  if (!patient) return next(new AppError('Patient profile not found.', 404));
  res.status(200).json({ success: true, data: { patient } });
});

/**
 * @route   PATCH /api/v1/patients/me
 * @access  Private (patient)
 */
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ['age', 'gender', 'city', 'address', 'bloodGroup', 'emergencyContact'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const patient = await Patient.findOneAndUpdate({ user: req.user.id }, updates, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email phone');

  if (!patient) return next(new AppError('Patient profile not found.', 404));
  res.status(200).json({ success: true, data: { patient } });
});

/**
 * @route   POST /api/v1/patients/me/reports
 * @desc    Upload a medical report file
 * @access  Private (patient)
 */
exports.uploadReport = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('No file uploaded.', 400));

  const patient = await Patient.findOne({ user: req.user.id });
  if (!patient) return next(new AppError('Patient profile not found.', 404));

  patient.medicalReports.push({
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
    fileType: req.file.mimetype,
    description: req.body.description || '',
  });
  await patient.save();

  res.status(201).json({ success: true, data: { medicalReports: patient.medicalReports } });
});

/**
 * @route   GET /api/v1/patients/me/reports
 * @access  Private (patient)
 */
exports.getMyReports = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user.id });
  if (!patient) return next(new AppError('Patient profile not found.', 404));
  res.status(200).json({ success: true, data: { medicalReports: patient.medicalReports } });
});

/**
 * @route   GET /api/v1/patients
 * @desc    Admin/doctor: list all patients with search/filter/pagination
 * @access  Private (admin, doctor)
 */
exports.getPatients = asyncHandler(async (req, res) => {
  const { city, search } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (city) filter.city = new RegExp(city, 'i');

  let userFilter = { role: 'patient' };
  if (search) userFilter.name = new RegExp(search, 'i');

  const matchingUsers = await User.find(userFilter).select('_id');
  filter.user = { $in: matchingUsers.map((u) => u._id) };

  const total = await Patient.countDocuments(filter);
  const patients = await Patient.find(filter)
    .populate('user', 'name email phone')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: { patients },
    meta: buildMeta({ page, limit, total }),
  });
});

/**
 * @route   GET /api/v1/patients/:id
 * @access  Private (admin, doctor)
 */
exports.getPatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id).populate('user', 'name email phone');
  if (!patient) return next(new AppError('Patient not found.', 404));
  res.status(200).json({ success: true, data: { patient } });
});
