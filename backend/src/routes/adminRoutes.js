const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics/overview', adminController.getOverview);
router.get('/analytics/department-performance', adminController.getDepartmentPerformance);
router.get('/analytics/doctor-utilization', adminController.getDoctorUtilization);
router.get('/analytics/patient-demographics', adminController.getPatientDemographics);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.setUserActiveStatus);

module.exports = router;
