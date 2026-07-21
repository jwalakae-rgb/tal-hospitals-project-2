const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @route   GET /api/v1/departments
 * @access  Public
 */
exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort('name');
  res.status(200).json({ success: true, count: departments.length, data: { departments } });
});

/**
 * @route   POST /api/v1/departments
 * @access  Private (admin)
 */
exports.createDepartment = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const existing = await Department.findOne({ name });
  if (existing) return next(new AppError('Department already exists.', 409));

  const department = await Department.create({ name, description });
  res.status(201).json({ success: true, data: { department } });
});

/**
 * @route   PATCH /api/v1/departments/:id
 * @access  Private (admin)
 */
exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) return next(new AppError('Department not found.', 404));
  res.status(200).json({ success: true, data: { department } });
});

/**
 * @route   DELETE /api/v1/departments/:id
 * @access  Private (admin)
 */
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const activeDoctorCount = await Doctor.countDocuments({ department: req.params.id });
  if (activeDoctorCount > 0) {
    return next(new AppError('Cannot delete a department that has doctors assigned to it.', 400));
  }
  const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!department) return next(new AppError('Department not found.', 404));
  res.status(200).json({ success: true, message: 'Department deactivated.', data: { department } });
});
