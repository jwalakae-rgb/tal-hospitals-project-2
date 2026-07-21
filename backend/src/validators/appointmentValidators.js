const { body, param, query } = require('express-validator');

exports.createAppointmentValidator = [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('appointmentDate').isISO8601().toDate().withMessage('Valid appointment date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
  body('consultationType').optional().isIn(['in-person', 'video', 'phone']),
  body('reasonForVisit').optional().trim().isLength({ max: 500 }),
];

exports.rescheduleValidator = [
  param('id').isMongoId().withMessage('Valid appointment ID is required'),
  body('appointmentDate').isISO8601().toDate().withMessage('Valid new date is required'),
  body('timeSlot').notEmpty().withMessage('New time slot is required'),
];

exports.statusUpdateValidator = [
  param('id').isMongoId().withMessage('Valid appointment ID is required'),
  body('status')
    .isIn(['approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  body('cancellationReason').optional().trim().isLength({ max: 300 }),
];

exports.listQueryValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'completed', 'cancelled', 'rescheduled']),
];
