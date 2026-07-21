const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  createPrescriptionValidator,
  updatePrescriptionValidator,
} = require('../validators/prescriptionValidators');

const router = express.Router();

router.use(protect);

router.post('/', authorize('doctor'), createPrescriptionValidator, validateRequest, prescriptionController.createPrescription);
router.get('/me', authorize('patient'), prescriptionController.getMyPrescriptions);
router.get('/:id', prescriptionController.getPrescription);
router.patch(
  '/:id',
  authorize('doctor'),
  updatePrescriptionValidator,
  validateRequest,
  prescriptionController.updatePrescription
);

module.exports = router;
