import express from 'express';
import Joi from 'joi';
import { Sample } from '../models/Sample.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const updateSampleSchema = Joi.object({
  identifiedSampleName: Joi.string().min(1).max(255),
  copyrightHolder: Joi.string().min(1).max(255),
  licensingStatus: Joi.string().valid('cleared', 'pending', 'uncleared'),
  negotiationDetails: Joi.object()
});

// Get samples (with optional project filter)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { projectId, status } = req.query;
    let samples;

    if (projectId) {
      samples = await Sample.findByProjectId(projectId);
    } else if (status) {
      samples = await Sample.findByStatus(status, req.user.userId);
    } else {
      samples = await Sample.findByUserId(req.user.userId);
    }

    res.json({
      samples: samples.map(sample => sample.toJSON())
    });
  } catch (error) {
    next(error);
  }
});

// Get specific sample
router.get('/:sampleId', authenticateToken, async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    
    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    // Check if sample belongs to user (through project)
    const { Project } = await import('../models/Project.js');
    const project = await Project.findById(sample.projectId);
    
    if (!project || !project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      sample: sample.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Update sample
router.put('/:sampleId', authenticateToken, async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    
    const { error, value } = updateSampleSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    // Check if sample belongs to user (through project)
    const { Project } = await import('../models/Project.js');
    const project = await Project.findById(sample.projectId);
    
    if (!project || !project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedSample = await sample.update(value);

    res.json({
      message: 'Sample updated successfully',
      sample: updatedSample.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Delete sample
router.delete('/:sampleId', authenticateToken, async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    
    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    // Check if sample belongs to user (through project)
    const { Project } = await import('../models/Project.js');
    const project = await Project.findById(sample.projectId);
    
    if (!project || !project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await sample.delete();

    res.json({
      message: 'Sample deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get sample risk assessment
router.get('/:sampleId/risk', authenticateToken, async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    
    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    // Check if sample belongs to user (through project)
    const { Project } = await import('../models/Project.js');
    const project = await Project.findById(sample.projectId);
    
    if (!project || !project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const riskScore = sample.calculateRiskScore();
    const riskLevel = sample.getRiskLevel();

    res.json({
      sampleId: sample.sampleId,
      riskScore,
      riskLevel,
      factors: {
        licensingStatus: sample.licensingStatus,
        confidence: sample.confidence,
        copyrightHolder: sample.copyrightHolder
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
