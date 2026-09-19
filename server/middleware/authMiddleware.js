const jwt = require('jsonwebtoken');
const { UserRepository } = require('../models/dbStore');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'nexoffer_super_secret_jwt_key_2026_secure'
      );
      
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account not found or deactivated.',
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
