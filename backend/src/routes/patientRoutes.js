const express = require('express');
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Self-service routes (patient)
router.get('/me', protect, authorize('patient'), patientController.getMyProfile);
router.patch('/me', protect, authorize('patient'), patientController.updateMyProfile);
router.get('/me/reports', protect, authorize('patient'), patientController.getMyReports);
router.post(
  '/me/reports',
  protect,
  authorize('patient'),
  upload.single('report'),
  patientController.uploadReport
);

// Admin/doctor routes
router.get('/', protect, authorize('admin', 'doctor'), patientController.getPatients);
router.get('/:id', protect, authorize('admin', 'doctor'), patientController.getPatient);

module.exports = router;
