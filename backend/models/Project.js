import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

export class Project {
  constructor(data) {
    this.projectId = data.projectId || uuidv4();
    this.userId = data.userId;
    this.projectName = data.projectName;
    this.audioFileUrl = data.audioFileUrl;
    this.detectionResults = data.detectionResults ? JSON.parse(data.detectionResults) : null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new project
  static async create(projectData) {
    const { userId, projectName, audioFileUrl, detectionResults } = projectData;
    
    const projectId = uuidv4();
    const now = new Date().toISOString();
    
    await database.run(
      `INSERT INTO projects (projectId, userId, projectName, audioFileUrl, detectionResults, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId, 
        userId, 
        projectName, 
        audioFileUrl, 
        detectionResults ? JSON.stringify(detectionResults) : null,
        now, 
        now
      ]
    );
    
    return new Project({
      projectId,
      userId,
      projectName,
      audioFileUrl,
      detectionResults: JSON.stringify(detectionResults),
      createdAt: now,
      updatedAt: now
    });
  }

  // Find project by ID
  static async findById(projectId) {
    const row = await database.get(
      'SELECT * FROM projects WHERE projectId = ?',
      [projectId]
    );
    
    return row ? new Project(row) : null;
  }

  // Find projects by user ID
  static async findByUserId(userId, limit = 50, offset = 0) {
    const rows = await database.all(
      'SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    
    return rows.map(row => new Project(row));
  }

  // Update project
  async update(updates) {
    const allowedUpdates = ['projectName', 'audioFileUrl', 'detectionResults'];
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        if (key === 'detectionResults') {
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
    updateValues.push(this.projectId);
    
    await database.run(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE projectId = ?`,
      updateValues
    );
    
    this.updatedAt = now;
    return this;
  }

  // Delete project and all associated samples
  async delete() {
    // First delete all samples associated with this project
    await database.run(
      'DELETE FROM samples WHERE projectId = ?',
      [this.projectId]
    );
    
    // Then delete the project
    await database.run(
      'DELETE FROM projects WHERE projectId = ?',
      [this.projectId]
    );
  }

  // Get all samples for this project
  async getSamples() {
    const { Sample } = await import('./Sample.js');
    return Sample.findByProjectId(this.projectId);
  }

  // Get project statistics
  async getStats() {
    const samples = await this.getSamples();
    
    return {
      totalSamples: samples.length,
      clearedSamples: samples.filter(s => s.licensingStatus === 'cleared').length,
      pendingSamples: samples.filter(s => s.licensingStatus === 'pending').length,
      unclearedSamples: samples.filter(s => s.licensingStatus === 'uncleared').length,
      averageConfidence: samples.length > 0 
        ? samples.reduce((sum, s) => sum + (s.confidence || 0), 0) / samples.length 
        : 0
    };
  }

  // Check if project belongs to user
  belongsToUser(userId) {
    return this.userId === userId;
  }

  // Convert to JSON with parsed detection results
  toJSON() {
    return {
      projectId: this.projectId,
      userId: this.userId,
      projectName: this.projectName,
      audioFileUrl: this.audioFileUrl,
      detectionResults: this.detectionResults,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
