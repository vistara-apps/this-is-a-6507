import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token middleware
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Check subscription tier middleware
export function requireSubscription(requiredTier) {
  const tierLevels = {
    'free': 0,
    'basic': 1,
    'premium': 2
  };

  return (req, res, next) => {
    const userTierLevel = tierLevels[req.user.subscriptionTier] || 0;
    const requiredTierLevel = tierLevels[requiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        error: 'Subscription upgrade required',
        required: requiredTier,
        current: req.user.subscriptionTier
      });
    }

    next();
  };
}

// Check usage limits middleware
export function checkUsageLimit(action) {
  return async (req, res, next) => {
    try {
      const canPerform = await req.user.canPerformAction(action);
      
      if (!canPerform) {
        const limits = req.user.getSubscriptionLimits();
        return res.status(429).json({
          error: 'Usage limit exceeded',
          action,
          limits,
          subscriptionTier: req.user.subscriptionTier
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user;
  } catch (error) {
    req.user = null;
  }

  next();
}
