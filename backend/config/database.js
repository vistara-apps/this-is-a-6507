import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : join(__dirname, '../data/samplesource.db');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables();
          resolve();
        }
      });
    });
  }

  async initializeTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        userId TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        subscriptionTier TEXT DEFAULT 'free',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Projects table
      `CREATE TABLE IF NOT EXISTS projects (
        projectId TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        projectName TEXT NOT NULL,
        audioFileUrl TEXT,
        detectionResults TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (userId)
      )`,

      // Samples table
      `CREATE TABLE IF NOT EXISTS samples (
        sampleId TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        identifiedSampleName TEXT,
        copyrightHolder TEXT,
        licensingStatus TEXT DEFAULT 'uncleared',
        negotiationDetails TEXT,
        confidence REAL,
        startTime TEXT,
        duration TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (projectId)
      )`,

      // License Agreements table
      `CREATE TABLE IF NOT EXISTS license_agreements (
        agreementId TEXT PRIMARY KEY,
        sampleId TEXT NOT NULL,
        rightsHolderContact TEXT,
        terms TEXT,
        status TEXT DEFAULT 'pending',
        signedDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sampleId) REFERENCES samples (sampleId)
      )`,

      // Negotiations table for messaging
      `CREATE TABLE IF NOT EXISTS negotiations (
        negotiationId TEXT PRIMARY KEY,
        sampleId TEXT NOT NULL,
        userId TEXT NOT NULL,
        rightsHolderEmail TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sampleId) REFERENCES samples (sampleId),
        FOREIGN KEY (userId) REFERENCES users (userId)
      )`,

      // Messages table for negotiation chat
      `CREATE TABLE IF NOT EXISTS messages (
        messageId TEXT PRIMARY KEY,
        negotiationId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        senderType TEXT NOT NULL, -- 'user' or 'rights_holder'
        content TEXT NOT NULL,
        attachments TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (negotiationId) REFERENCES negotiations (negotiationId)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

export default new Database();
