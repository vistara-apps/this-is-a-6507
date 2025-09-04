import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

export class LicenseAgreement {
  constructor(data) {
    this.agreementId = data.agreementId || uuidv4();
    this.sampleId = data.sampleId;
    this.rightsHolderContact = data.rightsHolderContact;
    this.terms = data.terms ? JSON.parse(data.terms) : null;
    this.status = data.status || 'pending';
    this.signedDate = data.signedDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new license agreement
  static async create(agreementData) {
    const {
      sampleId,
      rightsHolderContact,
      terms,
      status = 'pending'
    } = agreementData;
    
    const agreementId = uuidv4();
    const now = new Date().toISOString();
    
    await database.run(
      `INSERT INTO license_agreements (
        agreementId, sampleId, rightsHolderContact, terms, 
        status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        agreementId,
        sampleId,
        rightsHolderContact,
        terms ? JSON.stringify(terms) : null,
        status,
        now,
        now
      ]
    );
    
    return new LicenseAgreement({
      agreementId,
      sampleId,
      rightsHolderContact,
      terms: terms ? JSON.stringify(terms) : null,
      status,
      createdAt: now,
      updatedAt: now
    });
  }

  // Find agreement by ID
  static async findById(agreementId) {
    const row = await database.get(
      'SELECT * FROM license_agreements WHERE agreementId = ?',
      [agreementId]
    );
    
    return row ? new LicenseAgreement(row) : null;
  }

  // Find agreements by sample ID
  static async findBySampleId(sampleId) {
    const rows = await database.all(
      'SELECT * FROM license_agreements WHERE sampleId = ? ORDER BY createdAt DESC',
      [sampleId]
    );
    
    return rows.map(row => new LicenseAgreement(row));
  }

  // Find agreements by user ID (through samples and projects)
  static async findByUserId(userId) {
    const rows = await database.all(
      `SELECT la.* FROM license_agreements la
       JOIN samples s ON la.sampleId = s.sampleId
       JOIN projects p ON s.projectId = p.projectId
       WHERE p.userId = ?
       ORDER BY la.createdAt DESC`,
      [userId]
    );
    
    return rows.map(row => new LicenseAgreement(row));
  }

  // Find agreements by status
  static async findByStatus(status, userId = null) {
    let query = `SELECT la.* FROM license_agreements la`;
    let params = [status];
    
    if (userId) {
      query += ` JOIN samples s ON la.sampleId = s.sampleId
                 JOIN projects p ON s.projectId = p.projectId
                 WHERE la.status = ? AND p.userId = ?`;
      params.push(userId);
    } else {
      query += ` WHERE la.status = ?`;
    }
    
    query += ` ORDER BY la.createdAt DESC`;
    
    const rows = await database.all(query, params);
    return rows.map(row => new LicenseAgreement(row));
  }

  // Update agreement
  async update(updates) {
    const allowedUpdates = [
      'rightsHolderContact',
      'terms',
      'status',
      'signedDate'
    ];
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        if (key === 'terms') {
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
    updateValues.push(this.agreementId);
    
    await database.run(
      `UPDATE license_agreements SET ${updateFields.join(', ')} WHERE agreementId = ?`,
      updateValues
    );
    
    this.updatedAt = now;
    
    // If status is being updated to 'signed', update the sample's licensing status
    if (updates.status === 'signed') {
      await database.run(
        `UPDATE samples SET licensingStatus = 'cleared', updatedAt = ? WHERE sampleId = ?`,
        [now, this.sampleId]
      );
    }
    
    return this;
  }

  // Sign the agreement
  async sign() {
    const now = new Date().toISOString();
    
    await this.update({
      status: 'signed',
      signedDate: now
    });
    
    return this;
  }

  // Reject the agreement
  async reject() {
    await this.update({
      status: 'rejected'
    });
    
    return this;
  }

  // Delete agreement
  async delete() {
    await database.run(
      'DELETE FROM license_agreements WHERE agreementId = ?',
      [this.agreementId]
    );
  }

  // Get the associated sample
  async getSample() {
    const { Sample } = await import('./Sample.js');
    return Sample.findById(this.sampleId);
  }

  // Generate standard license terms template
  static generateStandardTerms(sampleName, copyrightHolder, usageType = 'commercial') {
    return {
      sampleName,
      copyrightHolder,
      usageType,
      territory: 'Worldwide',
      duration: 'Perpetual',
      royaltyRate: usageType === 'commercial' ? '10%' : '5%',
      advancePayment: usageType === 'commercial' ? '$500' : '$100',
      creditRequirement: `Contains a sample of "${sampleName}" performed by ${copyrightHolder}`,
      restrictions: [
        'No synchronization rights included',
        'No remix or derivative work rights',
        'Original sample must not exceed 30 seconds'
      ],
      termination: 'Either party may terminate with 30 days written notice',
      governing_law: 'New York State Law'
    };
  }

  // Check if agreement is expired or needs renewal
  isExpired() {
    if (!this.terms || !this.terms.expirationDate) {
      return false; // No expiration date means perpetual
    }
    
    const expirationDate = new Date(this.terms.expirationDate);
    return new Date() > expirationDate;
  }

  // Get days until expiration
  getDaysUntilExpiration() {
    if (!this.terms || !this.terms.expirationDate) {
      return null; // Perpetual license
    }
    
    const expirationDate = new Date(this.terms.expirationDate);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Convert to JSON with parsed terms
  toJSON() {
    return {
      agreementId: this.agreementId,
      sampleId: this.sampleId,
      rightsHolderContact: this.rightsHolderContact,
      terms: this.terms,
      status: this.status,
      signedDate: this.signedDate,
      isExpired: this.isExpired(),
      daysUntilExpiration: this.getDaysUntilExpiration(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
