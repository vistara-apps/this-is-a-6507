import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';
import { authenticateToken, checkUsageLimit } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createNegotiationSchema = Joi.object({
  sampleId: Joi.string().required(),
  rightsHolderEmail: Joi.string().email().required(),
  initialMessage: Joi.string().min(10).max(2000).required()
});

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  attachments: Joi.array().items(Joi.string())
});

// Get all negotiations for user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const negotiations = await database.all(
      `SELECT n.*, s.identifiedSampleName, s.copyrightHolder 
       FROM negotiations n
       JOIN samples s ON n.sampleId = s.sampleId
       JOIN projects p ON s.projectId = p.projectId
       WHERE p.userId = ?
       ORDER BY n.createdAt DESC`,
      [req.user.userId]
    );

    res.json({
      negotiations
    });
  } catch (error) {
    next(error);
  }
});

// Get specific negotiation
router.get('/:negotiationId', authenticateToken, async (req, res, next) => {
  try {
    const { negotiationId } = req.params;
    
    const negotiation = await database.get(
      `SELECT n.*, s.identifiedSampleName, s.copyrightHolder 
       FROM negotiations n
       JOIN samples s ON n.sampleId = s.sampleId
       JOIN projects p ON s.projectId = p.projectId
       WHERE n.negotiationId = ? AND p.userId = ?`,
      [negotiationId, req.user.userId]
    );

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    res.json({
      negotiation
    });
  } catch (error) {
    next(error);
  }
});

// Create new negotiation
router.post('/', 
  authenticateToken, 
  checkUsageLimit('start_negotiation'),
  async (req, res, next) => {
    try {
      const { error, value } = createNegotiationSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        return next(error);
      }

      const { sampleId, rightsHolderEmail, initialMessage } = value;

      // Verify sample belongs to user
      const sample = await database.get(
        `SELECT s.*, p.userId 
         FROM samples s
         JOIN projects p ON s.projectId = p.projectId
         WHERE s.sampleId = ?`,
        [sampleId]
      );

      if (!sample || sample.userId !== req.user.userId) {
        return res.status(404).json({ error: 'Sample not found' });
      }

      // Check if negotiation already exists
      const existingNegotiation = await database.get(
        'SELECT * FROM negotiations WHERE sampleId = ? AND status = ?',
        [sampleId, 'active']
      );

      if (existingNegotiation) {
        return res.status(409).json({ 
          error: 'Active negotiation already exists for this sample' 
        });
      }

      const negotiationId = uuidv4();
      const now = new Date().toISOString();

      // Create negotiation
      await database.run(
        `INSERT INTO negotiations (
          negotiationId, sampleId, userId, rightsHolderEmail, 
          status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [negotiationId, sampleId, req.user.userId, rightsHolderEmail, 'active', now, now]
      );

      // Send initial message
      const messageId = uuidv4();
      await database.run(
        `INSERT INTO messages (
          messageId, negotiationId, senderId, senderType, 
          content, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [messageId, negotiationId, req.user.userId, 'user', initialMessage, now]
      );

      res.status(201).json({
        message: 'Negotiation started successfully',
        negotiationId,
        status: 'active'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update negotiation status
router.put('/:negotiationId', authenticateToken, async (req, res, next) => {
  try {
    const { negotiationId } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify negotiation belongs to user
    const negotiation = await database.get(
      `SELECT n.* FROM negotiations n
       JOIN samples s ON n.sampleId = s.sampleId
       JOIN projects p ON s.projectId = p.projectId
       WHERE n.negotiationId = ? AND p.userId = ?`,
      [negotiationId, req.user.userId]
    );

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    const now = new Date().toISOString();
    await database.run(
      'UPDATE negotiations SET status = ?, updatedAt = ? WHERE negotiationId = ?',
      [status, now, negotiationId]
    );

    res.json({
      message: 'Negotiation updated successfully',
      status
    });
  } catch (error) {
    next(error);
  }
});

// Get messages for negotiation
router.get('/:negotiationId/messages', authenticateToken, async (req, res, next) => {
  try {
    const { negotiationId } = req.params;
    
    // Verify negotiation belongs to user
    const negotiation = await database.get(
      `SELECT n.* FROM negotiations n
       JOIN samples s ON n.sampleId = s.sampleId
       JOIN projects p ON s.projectId = p.projectId
       WHERE n.negotiationId = ? AND p.userId = ?`,
      [negotiationId, req.user.userId]
    );

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    const messages = await database.all(
      'SELECT * FROM messages WHERE negotiationId = ? ORDER BY createdAt ASC',
      [negotiationId]
    );

    res.json({
      messages
    });
  } catch (error) {
    next(error);
  }
});

// Send message in negotiation
router.post('/:negotiationId/messages', authenticateToken, async (req, res, next) => {
  try {
    const { negotiationId } = req.params;
    
    const { error, value } = sendMessageSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const { content, attachments } = value;

    // Verify negotiation belongs to user and is active
    const negotiation = await database.get(
      `SELECT n.* FROM negotiations n
       JOIN samples s ON n.sampleId = s.sampleId
       JOIN projects p ON s.projectId = p.projectId
       WHERE n.negotiationId = ? AND p.userId = ? AND n.status = ?`,
      [negotiationId, req.user.userId, 'active']
    );

    if (!negotiation) {
      return res.status(404).json({ 
        error: 'Active negotiation not found' 
      });
    }

    const messageId = uuidv4();
    const now = new Date().toISOString();

    await database.run(
      `INSERT INTO messages (
        messageId, negotiationId, senderId, senderType, 
        content, attachments, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        messageId, 
        negotiationId, 
        req.user.userId, 
        'user', 
        content, 
        attachments ? JSON.stringify(attachments) : null,
        now
      ]
    );

    // Update negotiation timestamp
    await database.run(
      'UPDATE negotiations SET updatedAt = ? WHERE negotiationId = ?',
      [now, negotiationId]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      messageId
    });
  } catch (error) {
    next(error);
  }
});

// Get negotiation templates
router.get('/templates/licensing', authenticateToken, async (req, res, next) => {
  try {
    const templates = [
      {
        id: 'basic-commercial',
        name: 'Basic Commercial License',
        description: 'Standard commercial licensing template',
        template: `Dear [Rights Holder],

I am writing to request permission to use a sample from "[Sample Name]" in my upcoming musical work.

Details:
- Sample Duration: [Duration]
- Usage: Commercial release
- Territory: Worldwide
- Proposed Terms: [Terms]

I would appreciate the opportunity to discuss licensing terms with you.

Best regards,
[Your Name]`
      },
      {
        id: 'non-commercial',
        name: 'Non-Commercial License',
        description: 'Template for non-commercial use',
        template: `Dear [Rights Holder],

I am requesting permission to use a sample from "[Sample Name]" for non-commercial purposes.

This will be used in [Project Description] and will not be sold or monetized.

Thank you for your consideration.

Best regards,
[Your Name]`
      }
    ];

    res.json({
      templates
    });
  } catch (error) {
    next(error);
  }
});

export default router;
