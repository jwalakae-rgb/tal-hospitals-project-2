const express = require('express');
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  createDoctorValidator,
  updateAvailabilityValidator,
} = require('../validators/doctorValidators');

const router = express.Router();

router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctor);

router.post('/', protect, authorize('admin'), createDoctorValidator, validateRequest, doctorController.createDoctor);
router.patch('/:id', protect, authorize('admin', 'doctor'), doctorController.updateDoctor);
router.patch(
  '/:id/availability',
  protect,
  authorize('admin', 'doctor'),
  updateAvailabilityValidator,
  validateRequest,
  doctorController.updateAvailability
);
router.delete('/:id', protect, authorize('admin'), doctorController.deleteDoctor);

module.exports = router;
