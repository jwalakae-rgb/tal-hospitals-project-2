const express = require('express');
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { departmentValidator } = require('../validators/doctorValidators');

const router = express.Router();

router.get('/', departmentController.getDepartments);
router.post('/', protect, authorize('admin'), departmentValidator, validateRequest, departmentController.createDepartment);
router.patch('/:id', protect, authorize('admin'), departmentController.updateDepartment);
router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

module.exports = router;
