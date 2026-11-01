import { analyzeJavaScript } from '../analyzers/javascriptAnalyzer.js';
import { saveAnalysis, getAnalyses, getAnalysisById } from '../database/database.js';

const SUPPORTED_LANGUAGES = ['javascript', 'js'];
const MAX_CODE_LENGTH = 500000; // 500 KB limit for single analysis payload

/**
 * Service orchestrating static code analysis and database persistence.
 */
export async function runAnalysisService({ code, language = 'javascript', filename }) {
  // 1. Input Validation: Code presence
  if (typeof code !== 'string' || !code.trim()) {
    const error = new Error('Invalid input: "code" field is required and must be a non-empty string.');
    error.status = 400;
    error.code = 'ERR_MISSING_CODE';
    throw error;
  }

  // 2. Input Validation: Maximum payload size
  if (code.length > MAX_CODE_LENGTH) {
    const error = new Error(`Code exceeds maximum supported size of ${MAX_CODE_LENGTH} characters.`);
    error.status = 400;
    error.code = 'ERR_OVERSIZED_INPUT';
    throw error;
  }

  // 3. Input Validation: Language support
  const normalizedLang = String(language).toLowerCase().trim();
  if (!SUPPORTED_LANGUAGES.includes(normalizedLang)) {
    const error = new Error(
      `Unsupported language "${language}". The Phase 1 AST static engine currently supports "javascript". Support for TypeScript and Python will follow in subsequent phases.`
    );
    error.status = 400;
    error.code = 'ERR_UNSUPPORTED_LANGUAGE';
    throw error;
  }

  // 4. Generate unique Scan ID
  const scanId = `SCAN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  // 5. Execute AST Analysis
  const result = analyzeJavaScript(code, {
    id: scanId,
    filename: filename || 'source.js'
  });

  // 6. Persist to SQLite database
  try {
    saveAnalysis({
      ...result,
      createdAt: new Date().toISOString()
    });
  } catch (dbErr) {
    console.error('Failed to persist analysis to database:', dbErr.message);
    // Continue: do not fail client response if DB persistence encounters transient issue
  }

  return result;
}

/**
 * Retrieve analysis history list from SQLite.
 */
export async function getAnalysisHistoryService(limit = 20, offset = 0) {
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

  return getAnalyses(safeLimit, safeOffset);
}

/**
 * Retrieve single analysis record by ID from SQLite.
 */
export async function getAnalysisByIdService(id) {
  if (!id) {
    const error = new Error('Analysis ID is required.');
    error.status = 400;
    throw error;
  }

  const analysis = getAnalysisById(id);
  if (!analysis) {
    const error = new Error(`Analysis with ID "${id}" was not found.`);
    error.status = 404;
    error.code = 'ERR_NOT_FOUND';
    throw error;
  }

  return analysis;
}
