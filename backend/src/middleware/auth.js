const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * Verifies JWT (from Authorization header or cookie) and attaches `req.user`.
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized. Please log in to access this resource.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }
  if (!user.isActive) {
    return next(new AppError('This account has been deactivated.', 403));
  }

  req.user = user;
  next();
});

/**
 * Restricts route access to specific roles.
 * Usage: authorize('admin', 'doctor')
 */
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(`Role '${req.user ? req.user.role : 'unknown'}' is not permitted to perform this action.`, 403));
  }
  next();
};
