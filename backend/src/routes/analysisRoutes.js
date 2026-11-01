import { Router } from 'express';
import {
  analyzeCodeController,
  getHistoryController,
  getAnalysisByIdController
} from '../controllers/analysisController.js';

const router = Router();

// Static code analysis execution
router.post('/analyze', analyzeCodeController);

// Analysis audit history
router.get('/history', getHistoryController);
router.get('/history/:id', getAnalysisByIdController);

export default router;
