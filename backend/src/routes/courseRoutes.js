import express from 'express';
import { processOpenRouterRequest } from '../services/openRouterService.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  // This would typically fetch from a database
  // For now, return a placeholder response
  res.json({ message: 'Courses API endpoint' });
});

// Process syllabus
router.post('/process-syllabus', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Syllabus content is required' });
    }
    
    const result = await processOpenRouterRequest(content);
    res.json(result);
  } catch (error) {
    console.error('Error processing syllabus:', error);
    res.status(500).json({ error: 'Failed to process syllabus' });
  }
});

// Generate course content
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await processOpenRouterRequest(prompt);
    res.json(result);
  } catch (error) {
    console.error('Error generating course content:', error);
    res.status(500).json({ error: 'Failed to generate course content' });
  }
});

export default router;