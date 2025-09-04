import express from 'express';
import multer from 'multer';
import Joi from 'joi';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Project } from '../models/Project.js';
import { Sample } from '../models/Sample.js';
import { authenticateToken, checkUsageLimit } from '../middleware/auth.js';
import { analyzeAudioFile } from '../services/audioAnalysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../uploads/audio'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Validation schemas
const createProjectSchema = Joi.object({
  projectName: Joi.string().min(1).max(255).required()
});

const updateProjectSchema = Joi.object({
  projectName: Joi.string().min(1).max(255)
});

// Get all projects for authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const projects = await Project.findByUserId(req.user.userId, parseInt(limit), offset);
    
    // Get stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const stats = await project.getStats();
        return {
          ...project.toJSON(),
          stats
        };
      })
    );
    
    res.json({
      projects: projectsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: projects.length === parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific project
router.get('/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if project belongs to user
    if (!project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const samples = await project.getSamples();
    const stats = await project.getStats();
    
    res.json({
      project: project.toJSON(),
      samples: samples.map(sample => sample.toJSON()),
      stats
    });
  } catch (error) {
    next(error);
  }
});

// Create new project with audio upload
router.post('/', 
  authenticateToken, 
  checkUsageLimit('create_project'),
  upload.single('audioFile'),
  async (req, res, next) => {
    try {
      const { error, value } = createProjectSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        return next(error);
      }

      const { projectName } = value;
      
      if (!req.file) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      // Create project
      const project = await Project.create({
        userId: req.user.userId,
        projectName,
        audioFileUrl: `/uploads/audio/${req.file.filename}`
      });

      // Start audio analysis in background
      analyzeAudioFile(project.projectId, req.file.path)
        .then(async (analysisResults) => {
          // Update project with analysis results
          await project.update({ detectionResults: analysisResults });
          
          // Create sample records for each detected sample
          if (analysisResults && analysisResults.samples) {
            for (const sampleData of analysisResults.samples) {
              await Sample.create({
                projectId: project.projectId,
                identifiedSampleName: sampleData.identifiedSampleName,
                copyrightHolder: sampleData.copyrightHolder,
                licensingStatus: sampleData.licensingStatus || 'uncleared',
                confidence: sampleData.confidence,
                startTime: sampleData.startTime,
                duration: sampleData.duration
              });
            }
          }
        })
        .catch(error => {
          console.error('Audio analysis failed:', error);
        });

      res.status(201).json({
        message: 'Project created successfully. Audio analysis in progress.',
        project: project.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update project
router.put('/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedProject = await project.update(value);

    res.json({
      message: 'Project updated successfully',
      project: updatedProject.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await project.delete();

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get project analysis status
router.get('/:projectId/analysis', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const samples = await project.getSamples();
    
    res.json({
      projectId: project.projectId,
      analysisComplete: !!project.detectionResults,
      detectionResults: project.detectionResults,
      samplesFound: samples.length,
      samples: samples.map(sample => sample.toJSON())
    });
  } catch (error) {
    next(error);
  }
});

// Reanalyze project audio
router.post('/:projectId/reanalyze', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project.belongsToUser(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Clear existing analysis results
    await project.update({ detectionResults: null });
    
    // Delete existing samples
    const existingSamples = await project.getSamples();
    for (const sample of existingSamples) {
      await sample.delete();
    }

    // Start new analysis
    const audioPath = join(__dirname, '../', project.audioFileUrl);
    analyzeAudioFile(project.projectId, audioPath)
      .then(async (analysisResults) => {
        await project.update({ detectionResults: analysisResults });
        
        if (analysisResults && analysisResults.samples) {
          for (const sampleData of analysisResults.samples) {
            await Sample.create({
              projectId: project.projectId,
              identifiedSampleName: sampleData.identifiedSampleName,
              copyrightHolder: sampleData.copyrightHolder,
              licensingStatus: sampleData.licensingStatus || 'uncleared',
              confidence: sampleData.confidence,
              startTime: sampleData.startTime,
              duration: sampleData.duration
            });
          }
        }
      })
      .catch(error => {
        console.error('Reanalysis failed:', error);
      });

    res.json({
      message: 'Project reanalysis started'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
