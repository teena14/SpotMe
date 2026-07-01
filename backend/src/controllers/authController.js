import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { verifyRefreshToken, generateAccessToken } from '../config/jwt.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Register new user
export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400, 'EMAIL_EXISTS');
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = user.generateAuthToken();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          employeeId: user.employeeId,
          qrToken: user.qrToken,
          settings: user.settings
        },
        accessToken
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new AppError('User account is blocked', 403, 'USER_BLOCKED');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const { accessToken, refreshToken } = user.generateAuthToken();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          employeeId: user.employeeId,
          qrToken: user.qrToken,
          settings: user.settings
        },
        accessToken
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth Login / Register
export const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new AppError('Google token is required', 400, 'TOKEN_MISSING');
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    if (!email) {
      throw new AppError('Email not found in Google payload', 400, 'INVALID_PAYLOAD');
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user automatically
      user = new User({
        email,
        // Set a random secure password for OAuth users since they don't use it
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
        firstName: given_name || '',
        lastName: family_name || '',
        avatarUrl: picture || ''
      });
      await user.save();
    } else if (user.isBlocked) {
      throw new AppError('User account is blocked', 403, 'USER_BLOCKED');
    }

    // Generate tokens
    const { accessToken, refreshToken } = user.generateAuthToken();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          employeeId: user.employeeId,
          qrToken: user.qrToken,
          settings: user.settings
        },
        accessToken
      },
      message: 'Google authentication successful'
    });
  } catch (error) {
    next(error);
  }
};


// Logout user
export const logout = async (req, res, next) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401, 'TOKEN_MISSING');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.isBlocked) {
      throw new AppError('User account is blocked', 403, 'USER_BLOCKED');
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.role);

    res.json({
      success: true,
      data: {
        accessToken
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      throw new AppError('Old and new passwords are required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new AppError('Incorrect current password', 401, 'INVALID_CREDENTIALS');
    }

    // Hash and save new password (handled by pre-save hook in User model)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('There is no user with that email', 404, 'USER_NOT_FOUND');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Please click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;margin:20px 0;background:#6d28d9;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'SpotMe Password Reset Token',
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      throw new AppError('Email could not be sent', 500, 'EMAIL_FAILED');
    }
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      throw new AppError('Password is required', 400, 'VALIDATION_ERROR');
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired token', 400, 'INVALID_TOKEN');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

