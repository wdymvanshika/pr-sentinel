import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

/**
 * Initializes the SQLite database.
 * Supports both better-sqlite3 and Node's built-in node:sqlite DatabaseSync
 * to ensure zero-native compilation issues on any operating system or Node version.
 */
export async function initDatabase(customPath) {
  if (dbInstance) return dbInstance;

  const dbPath = customPath || process.env.DB_PATH || path.join(__dirname, '../../data/sentinel.db');

  // Ensure data directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let DatabaseConstructor;

  try {
    const betterSqlite = await import('better-sqlite3');
    DatabaseConstructor = betterSqlite.default;
  } catch {
    // Graceful fallback to Node's native built-in SQLite driver
    const nodeSqlite = await import('node:sqlite');
    DatabaseConstructor = nodeSqlite.DatabaseSync;
  }

  dbInstance = new DatabaseConstructor(dbPath);

  // Enable WAL mode for high performance where supported
  try {
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  } catch {
    // In-memory or environments without WAL support
  }

  // Create table schema
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      filename TEXT,
      quality_score INTEGER NOT NULL,
      grade TEXT NOT NULL,
      verdict TEXT NOT NULL,
      critical_count INTEGER DEFAULT 0,
      warning_count INTEGER DEFAULT 0,
      suggestion_count INTEGER DEFAULT 0,
      findings TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return dbInstance;
}

/**
 * Insert a new analysis record into SQLite.
 */
export function saveAnalysis(record) {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  const stmt = dbInstance.prepare(`
    INSERT INTO analyses (
      id, code, language, filename, quality_score, grade, verdict,
      critical_count, warning_count, suggestion_count, findings, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createdAt = record.createdAt || new Date().toISOString();

  stmt.run(
    record.id,
    record.code,
    record.language,
    record.filename || 'anonymous.js',
    record.qualityScore,
    record.grade,
    record.verdict,
    record.summary?.critical || 0,
    record.summary?.warning || 0,
    record.summary?.suggestion || 0,
    JSON.stringify(record.issues || []),
    createdAt
  );

  return record;
}

/**
 * Retrieve recent analyses, newest first.
 */
export function getAnalyses(limit = 50, offset = 0) {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  const stmt = dbInstance.prepare(`
    SELECT id, language, filename, quality_score, grade, verdict,
           critical_count, warning_count, suggestion_count, created_at
    FROM analyses
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  const rows = stmt.all(limit, offset);

  return rows.map(row => ({
    id: row.id,
    language: row.language,
    filename: row.filename,
    qualityScore: row.quality_score,
    grade: row.grade,
    verdict: row.verdict,
    summary: {
      critical: row.critical_count,
      warning: row.warning_count,
      suggestion: row.suggestion_count,
      total: row.critical_count + row.warning_count + row.suggestion_count
    },
    createdAt: row.created_at
  }));
}

/**
 * Retrieve a single analysis by its ID, including full source code and findings.
 */
export function getAnalysisById(id) {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  const stmt = dbInstance.prepare(`
    SELECT id, code, language, filename, quality_score, grade, verdict,
           critical_count, warning_count, suggestion_count, findings, created_at
    FROM analyses
    WHERE id = ?
  `);

  const row = stmt.get(id);
  if (!row) return null;

  let issues = [];
  try {
    issues = JSON.parse(row.findings);
  } catch {
    issues = [];
  }

  return {
    id: row.id,
    code: row.code,
    language: row.language,
    filename: row.filename,
    qualityScore: row.quality_score,
    grade: row.grade,
    verdict: row.verdict,
    summary: {
      critical: row.critical_count,
      warning: row.warning_count,
      suggestion: row.suggestion_count,
      total: row.critical_count + row.warning_count + row.suggestion_count
    },
    issues,
    criticalIssues: issues.filter(i => i.severity === 'critical'),
    warnings: issues.filter(i => i.severity === 'warning'),
    suggestions: issues.filter(i => i.severity === 'suggestion'),
    createdAt: row.created_at
  };
}

/**
 * Close the database connection (for tests and graceful shutdowns).
 */
export function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}
