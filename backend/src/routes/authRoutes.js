const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
} = require('../validators/authValidators');

const router = express.Router();

// Stricter limiter on auth endpoints to slow brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerValidator, validateRequest, authController.register);
router.post('/login', authLimiter, loginValidator, validateRequest, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch(
  '/update-password',
  protect,
  updatePasswordValidator,
  validateRequest,
  authController.updatePassword
);

module.exports = router;
