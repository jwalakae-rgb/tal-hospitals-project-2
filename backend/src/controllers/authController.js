const User = require('../models/User');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: (Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000,
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();
  res.cookie('token', token, cookieOptions());
  res.status(statusCode).json({
    success: true,
    token,
    data: { user: user.toSafeObject() },
  });
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new patient (public) — doctors/admins are created by admin
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  // Public self-registration is always a patient account
  const user = await User.create({ name, email, password, phone, role: 'patient' });
  await Patient.create({ user: user._id });

  sendTokenResponse(user, 201, res);
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login and receive JWT
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(
      new AppError(
        'This account has been deactivated. Contact admin.',
        403
      )
    );
  }

  if (role && user.role !== role) {
    return next(
      new AppError(
        `This account is registered as a ${user.role}, not a ${role}. Please use the correct login tab.`,
        403
      )
    );
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});
 

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { ...cookieOptions(), maxAge: 1000 });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } });
});

/**
 * @route   PATCH /api/v1/auth/update-password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
