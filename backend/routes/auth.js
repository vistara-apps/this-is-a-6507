import express from 'express';
import Joi from 'joi';
import { User } from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  subscriptionTier: Joi.string().valid('free', 'basic', 'premium').default('free')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const { email, password, subscriptionTier } = value;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      subscriptionTier
    });

    // Generate token
    const token = generateToken(user.userId);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.userId);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const updateSchema = Joi.object({
      subscriptionTier: Joi.string().valid('free', 'basic', 'premium')
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const updatedUser = await req.user.update(value);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get user subscription limits
router.get('/limits', authenticateToken, async (req, res, next) => {
  try {
    const limits = req.user.getSubscriptionLimits();
    
    // Get current usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // This would typically be done with proper database queries
    // For now, we'll return the limits with placeholder usage data
    res.json({
      subscriptionTier: req.user.subscriptionTier,
      limits,
      currentUsage: {
        projectsThisMonth: 0, // TODO: Calculate actual usage
        negotiationsThisMonth: 0,
        dmcaResponsesThisMonth: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    const token = generateToken(req.user.userId);
    
    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    next(error);
  }
});

export default router;
