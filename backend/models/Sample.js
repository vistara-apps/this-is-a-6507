import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

export class Sample {
  constructor(data) {
    this.sampleId = data.sampleId || uuidv4();
    this.projectId = data.projectId;
    this.identifiedSampleName = data.identifiedSampleName;
    this.copyrightHolder = data.copyrightHolder;
    this.licensingStatus = data.licensingStatus || 'uncleared';
    this.negotiationDetails = data.negotiationDetails ? JSON.parse(data.negotiationDetails) : null;
    this.confidence = data.confidence;
    this.startTime = data.startTime;
    this.duration = data.duration;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new sample
  static async create(sampleData) {
    const {
      projectId,
      identifiedSampleName,
      copyrightHolder,
      licensingStatus = 'uncleared',
      negotiationDetails,
      confidence,
      startTime,
      duration
    } = sampleData;
    
    const sampleId = uuidv4();
    const now = new Date().toISOString();
    
    await database.run(
      `INSERT INTO samples (
        sampleId, projectId, identifiedSampleName, copyrightHolder, 
        licensingStatus, negotiationDetails, confidence, startTime, 
        duration, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sampleId,
        projectId,
        identifiedSampleName,
        copyrightHolder,
        licensingStatus,
        negotiationDetails ? JSON.stringify(negotiationDetails) : null,
        confidence,
        startTime,
        duration,
        now,
        now
      ]
    );
    
    return new Sample({
      sampleId,
      projectId,
      identifiedSampleName,
      copyrightHolder,
      licensingStatus,
      negotiationDetails: negotiationDetails ? JSON.stringify(negotiationDetails) : null,
      confidence,
      startTime,
      duration,
      createdAt: now,
      updatedAt: now
    });
  }

  // Find sample by ID
  static async findById(sampleId) {
    const row = await database.get(
      'SELECT * FROM samples WHERE sampleId = ?',
      [sampleId]
    );
    
    return row ? new Sample(row) : null;
  }

  // Find samples by project ID
  static async findByProjectId(projectId) {
    const rows = await database.all(
      'SELECT * FROM samples WHERE projectId = ? ORDER BY createdAt DESC',
      [projectId]
    );
    
    return rows.map(row => new Sample(row));
  }

  // Find samples by user ID (through projects)
  static async findByUserId(userId) {
    const rows = await database.all(
      `SELECT s.* FROM samples s 
       JOIN projects p ON s.projectId = p.projectId 
       WHERE p.userId = ? 
       ORDER BY s.createdAt DESC`,
      [userId]
    );
    
    return rows.map(row => new Sample(row));
  }

  // Find samples by licensing status
  static async findByStatus(status, userId = null) {
    let query = 'SELECT s.* FROM samples s';
    let params = [status];
    
    if (userId) {
      query += ' JOIN projects p ON s.projectId = p.projectId WHERE s.licensingStatus = ? AND p.userId = ?';
      params.push(userId);
    } else {
      query += ' WHERE s.licensingStatus = ?';
    }
    
    query += ' ORDER BY s.createdAt DESC';
    
    const rows = await database.all(query, params);
    return rows.map(row => new Sample(row));
  }

  // Update sample
  async update(updates) {
    const allowedUpdates = [
      'identifiedSampleName',
      'copyrightHolder',
      'licensingStatus',
      'negotiationDetails',
      'confidence'
    ];
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        if (key === 'negotiationDetails') {
          updateFields.push(`${key} = ?`);
          updateValues.push(JSON.stringify(value));
          this[key] = value;
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
          this[key] = value;
        }
      }
    }
    
    if (updateFields.length === 0) {
      return this;
    }
    
    const now = new Date().toISOString();
    updateFields.push('updatedAt = ?');
    updateValues.push(now);
    updateValues.push(this.sampleId);
    
    await database.run(
      `UPDATE samples SET ${updateFields.join(', ')} WHERE sampleId = ?`,
      updateValues
    );
    
    this.updatedAt = now;
    return this;
  }

  // Delete sample
  async delete() {
    // Delete any license agreements first
    await database.run(
      'DELETE FROM license_agreements WHERE sampleId = ?',
      [this.sampleId]
    );
    
    // Delete any negotiations
    await database.run(
      'DELETE FROM negotiations WHERE sampleId = ?',
      [this.sampleId]
    );
    
    // Delete the sample
    await database.run(
      'DELETE FROM samples WHERE sampleId = ?',
      [this.sampleId]
    );
  }

  // Get license agreements for this sample
  async getLicenseAgreements() {
    const { LicenseAgreement } = await import('./LicenseAgreement.js');
    return LicenseAgreement.findBySampleId(this.sampleId);
  }

  // Get active negotiations for this sample
  async getNegotiations() {
    const rows = await database.all(
      'SELECT * FROM negotiations WHERE sampleId = ? ORDER BY createdAt DESC',
      [this.sampleId]
    );
    
    return rows;
  }

  // Calculate risk score based on various factors
  calculateRiskScore() {
    let riskScore = 0;
    
    // Base risk on licensing status
    switch (this.licensingStatus) {
      case 'cleared':
        riskScore = 10; // Low risk
        break;
      case 'pending':
        riskScore = 50; // Medium risk
        break;
      case 'uncleared':
        riskScore = 90; // High risk
        break;
      default:
        riskScore = 100; // Unknown status = highest risk
    }
    
    // Adjust based on confidence level
    if (this.confidence) {
      if (this.confidence > 90) {
        riskScore += 10; // High confidence = higher risk if uncleared
      } else if (this.confidence < 70) {
        riskScore -= 20; // Low confidence = lower risk
      }
    }
    
    // Adjust based on copyright holder
    if (this.copyrightHolder) {
      const majorLabels = ['Universal Music Group', 'Sony Music', 'Warner Music Group'];
      if (majorLabels.some(label => this.copyrightHolder.includes(label))) {
        riskScore += 15; // Major labels = higher risk
      }
    }
    
    return Math.min(100, Math.max(0, riskScore));
  }

  // Get risk level description
  getRiskLevel() {
    const score = this.calculateRiskScore();
    
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    if (score <= 80) return 'High';
    return 'Critical';
  }

  // Convert to JSON with parsed negotiation details
  toJSON() {
    return {
      sampleId: this.sampleId,
      projectId: this.projectId,
      identifiedSampleName: this.identifiedSampleName,
      copyrightHolder: this.copyrightHolder,
      licensingStatus: this.licensingStatus,
      negotiationDetails: this.negotiationDetails,
      confidence: this.confidence,
      startTime: this.startTime,
      duration: this.duration,
      riskScore: this.calculateRiskScore(),
      riskLevel: this.getRiskLevel(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
