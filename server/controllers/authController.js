const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository, ProfileRepository } = require('../models/dbStore');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'nexoffer_super_secret_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user & trigger email OTP
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await UserRepository.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in.',
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        existingUser.name = name.trim();
        existingUser.passwordHash = await bcrypt.hash(password, salt);
        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await existingUser.save();

        const emailResult = await sendOTPEmail(existingUser.email, otp, 'verification');

        return res.status(200).json({
          success: true,
          message: 'Account was pending verification. A fresh OTP has been sent to your email.',
          email: existingUser.email,
          devOtp: emailResult.mode === 'dev_console' ? otp : undefined,
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await UserRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      isVerified: false,
      otp,
      otpExpiresAt,
    });

    // Create linked blank Profile
    await ProfileRepository.create({
      userId: user._id,
      company: '',
      role: '',
      jobDescription: '',
      resumeText: '',
      skills: [],
    });

    const emailResult = await sendOTPEmail(user.email, otp, 'verification');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify the OTP sent to your email.',
      email: user.email,
      devOtp: emailResult.mode === 'dev_console' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and OTP code.',
      });
    }

    const user = await UserRepository.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address.',
      });
    }

    if (user.isVerified) {
      const token = signToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. Logging you in.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: true,
        },
      });
    }

    if (!user.otp || user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.',
      });
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await UserRepository.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailResult = await sendOTPEmail(user.email, otp, 'verification');

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email address.',
      devOtp: emailResult.mode === 'dev_console' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await UserRepository.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const emailResult = await sendOTPEmail(user.email, otp, 'verification');

      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Account not verified. An OTP has been sent to your email.',
        devOtp: emailResult.mode === 'dev_console' ? otp : undefined,
      });
    }

    const token = signToken(user._id);

    // Get linked profile summary
    const profile = await ProfileRepository.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      profile: profile ? {
        company: profile.company,
        role: profile.role,
        hasResume: !!profile.resumeText,
        hasJd: !!profile.jobDescription,
      } : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email address.',
      });
    }

    const user = await UserRepository.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset OTP has been sent.',
      });
    }

    const otp = generateOTP();
    user.resetPasswordToken = otp;
    user.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailResult = await sendOTPEmail(user.email, otp, 'password_reset');

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.',
      email: user.email,
      devOtp: emailResult.mode === 'dev_console' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const user = await UserRepository.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid request or user not found.',
      });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or incorrect reset OTP.',
      });
    }

    if (user.resetPasswordExpiresAt && new Date() > user.resetPasswordExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Reset OTP has expired. Please request a new one.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    user.isVerified = true;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
