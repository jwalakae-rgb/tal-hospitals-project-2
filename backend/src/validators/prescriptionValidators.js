const { body, param } = require('express-validator');

exports.createPrescriptionValidator = [
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('medicines').optional().isArray().withMessage('Medicines must be an array'),
  body('medicines.*.name').optional().trim().notEmpty().withMessage('Medicine name is required'),
  body('followUpDate').optional().isISO8601().toDate(),
  body('treatmentCost').optional().isFloat({ min: 0 }),
];

exports.updatePrescriptionValidator = [
  param('id').isMongoId().withMessage('Valid prescription ID is required'),
  body('diagnosis').optional().trim().notEmpty(),
  body('medicines').optional().isArray(),
  body('treatmentCost').optional().isFloat({ min: 0 }),
];
