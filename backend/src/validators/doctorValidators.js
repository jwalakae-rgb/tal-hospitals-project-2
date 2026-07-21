const { body, param } = require('express-validator');

exports.createDoctorValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('department').isMongoId().withMessage('Valid department ID is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('experience').isFloat({ min: 0 }).withMessage('Experience must be a non-negative number'),
  body('consultationFee').isFloat({ min: 0 }).withMessage('Consultation fee must be a non-negative number'),
];

exports.updateAvailabilityValidator = [
  param('id').isMongoId().withMessage('Valid doctor ID is required'),
  body('availability').isArray().withMessage('Availability must be an array of slots'),
  body('availability.*.day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day'),
  body('availability.*.startTime').notEmpty().withMessage('Start time is required'),
  body('availability.*.endTime').notEmpty().withMessage('End time is required'),
];

exports.departmentValidator = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('description').optional().trim().isLength({ max: 500 }),
];
