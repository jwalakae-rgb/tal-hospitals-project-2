const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/v1/admin/analytics/overview
 * @desc    High-level dashboard KPIs
 * @access  Private (admin)
 */
exports.getOverview = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, totalAppointments, statusCounts, revenueAgg] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Prescription.aggregate([{ $group: { _id: null, total: { $sum: '$treatmentCost' } } }]),
  ]);

  const statusMap = statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
  const cancelled = statusMap.cancelled || 0;
  const cancellationRate = totalAppointments ? ((cancelled / totalAppointments) * 100).toFixed(2) : '0.00';

  res.status(200).json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsByStatus: statusMap,
      cancellationRate: `${cancellationRate}%`,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

/**
 * @route   GET /api/v1/admin/analytics/department-performance
 * @access  Private (admin)
 */
exports.getDepartmentPerformance = asyncHandler(async (req, res) => {
  const results = await Appointment.aggregate([
    {
      $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' },
    },
    { $unwind: '$dept' },
    {
      $group: {
        _id: '$dept.name',
        totalAppointments: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      },
    },
    { $sort: { totalAppointments: -1 } },
  ]);

  res.status(200).json({ success: true, data: { departmentPerformance: results } });
});

/**
 * @route   GET /api/v1/admin/analytics/doctor-utilization
 * @access  Private (admin)
 */
exports.getDoctorUtilization = asyncHandler(async (req, res) => {
  const results = await Appointment.aggregate([
    {
      $group: {
        _id: '$doctor',
        totalAppointments: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    {
      $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctorInfo' },
    },
    { $unwind: '$doctorInfo' },
    {
      $lookup: { from: 'users', localField: 'doctorInfo.user', foreignField: '_id', as: 'userInfo' },
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        _id: 0,
        doctorId: '$_id',
        name: '$userInfo.name',
        specialization: '$doctorInfo.specialization',
        totalAppointments: 1,
        completed: 1,
      },
    },
    { $sort: { totalAppointments: -1 } },
  ]);

  res.status(200).json({ success: true, data: { doctorUtilization: results } });
});

/**
 * @route   GET /api/v1/admin/analytics/patient-demographics
 * @access  Private (admin)
 */
exports.getPatientDemographics = asyncHandler(async (req, res) => {
  const [byCity, byGender, byAgeGroup] = await Promise.all([
    Patient.aggregate([
      { $match: { city: { $ne: null } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Patient.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]),
    Patient.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 45, 60, 130],
          default: 'unknown',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: { byCity, byGender, byAgeGroup },
  });
});

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users (for admin management)
 * @access  Private (admin)
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort('-createdAt');
  res.status(200).json({ success: true, count: users.length, data: { users } });
});

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @desc    Activate/deactivate a user account
 * @access  Private (admin)
 */
exports.setUserActiveStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  res.status(200).json({ success: true, data: { user } });
});
