import {
  runAnalysisService,
  getAnalysisHistoryService,
  getAnalysisByIdService
} from '../services/analysisService.js';

/**
 * Controller for POST /api/analyze
 */
export async function analyzeCodeController(req, res, next) {
  try {
    const { code, language, filename } = req.body || {};

    const result = await runAnalysisService({
      code,
      language,
      filename
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for GET /api/history
 */
export async function getHistoryController(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const history = await getAnalysisHistoryService(limit, offset);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for GET /api/history/:id
 */
export async function getAnalysisByIdController(req, res, next) {
  try {
    const { id } = req.params;
    const analysis = await getAnalysisByIdService(id);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
}
