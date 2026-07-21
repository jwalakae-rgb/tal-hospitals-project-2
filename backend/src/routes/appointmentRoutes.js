const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  createAppointmentValidator,
  rescheduleValidator,
  statusUpdateValidator,
  listQueryValidator,
} = require('../validators/appointmentValidators');

const router = express.Router();

router.use(protect);

router.post('/', authorize('patient'), createAppointmentValidator, validateRequest, appointmentController.createAppointment);
router.get('/me', authorize('patient', 'doctor'), listQueryValidator, validateRequest, appointmentController.getMyAppointments);
router.get('/', authorize('admin'), listQueryValidator, validateRequest, appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointment);

router.patch(
  '/:id/status',
  authorize('doctor', 'admin'),
  statusUpdateValidator,
  validateRequest,
  appointmentController.updateStatus
);
router.patch(
  '/:id/reschedule',
  authorize('patient', 'admin'),
  rescheduleValidator,
  validateRequest,
  appointmentController.rescheduleAppointment
);
router.delete('/:id', authorize('patient', 'admin'), appointmentController.cancelAppointment);

module.exports = router;
