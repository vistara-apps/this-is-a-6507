import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import database from '../config/database.js';

export class User {
  constructor(data) {
    this.userId = data.userId || uuidv4();
    this.email = data.email;
    this.password = data.password;
    this.subscriptionTier = data.subscriptionTier || 'free';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new user
  static async create(userData) {
    const { email, password, subscriptionTier = 'free' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    await database.run(
      `INSERT INTO users (userId, email, password, subscriptionTier, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, subscriptionTier, now, now]
    );
    
    return new User({
      userId,
      email,
      password: hashedPassword,
      subscriptionTier,
      createdAt: now,
      updatedAt: now
    });
  }

  // Find user by email
  static async findByEmail(email) {
    const row = await database.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return row ? new User(row) : null;
  }

  // Find user by ID
  static async findById(userId) {
    const row = await database.get(
      'SELECT * FROM users WHERE userId = ?',
      [userId]
    );
    
    return row ? new User(row) : null;
  }

  // Update user
  async update(updates) {
    const allowedUpdates = ['subscriptionTier'];
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
        this[key] = value;
      }
    }
    
    if (updateFields.length === 0) {
      return this;
    }
    
    const now = new Date().toISOString();
    updateFields.push('updatedAt = ?');
    updateValues.push(now);
    updateValues.push(this.userId);
    
    await database.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE userId = ?`,
      updateValues
    );
    
    this.updatedAt = now;
    return this;
  }

  // Verify password
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  // Get user's subscription limits
  getSubscriptionLimits() {
    const limits = {
      free: {
        projectsPerMonth: 5,
        samplesPerProject: 10,
        negotiationsPerMonth: 2,
        dmcaResponsesPerMonth: 1
      },
      basic: {
        projectsPerMonth: 25,
        samplesPerProject: 50,
        negotiationsPerMonth: 10,
        dmcaResponsesPerMonth: 5
      },
      premium: {
        projectsPerMonth: -1, // unlimited
        samplesPerProject: -1, // unlimited
        negotiationsPerMonth: -1, // unlimited
        dmcaResponsesPerMonth: -1 // unlimited
      }
    };
    
    return limits[this.subscriptionTier] || limits.free;
  }

  // Check if user can perform action based on subscription
  async canPerformAction(action) {
    const limits = this.getSubscriptionLimits();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    switch (action) {
      case 'create_project':
        if (limits.projectsPerMonth === -1) return true;
        const projectCount = await database.get(
          'SELECT COUNT(*) as count FROM projects WHERE userId = ? AND createdAt >= ?',
          [this.userId, startOfMonth.toISOString()]
        );
        return projectCount.count < limits.projectsPerMonth;
        
      case 'start_negotiation':
        if (limits.negotiationsPerMonth === -1) return true;
        const negotiationCount = await database.get(
          'SELECT COUNT(*) as count FROM negotiations WHERE userId = ? AND createdAt >= ?',
          [this.userId, startOfMonth.toISOString()]
        );
        return negotiationCount.count < limits.negotiationsPerMonth;
        
      default:
        return true;
    }
  }

  // Convert to JSON (excluding password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
