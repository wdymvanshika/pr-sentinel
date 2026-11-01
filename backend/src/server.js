import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initDatabase } from './database/database.js';
import analysisRoutes from './routes/analysisRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Permitted origins for frontend clients (development and production)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Production frontend origin configured via FRONTEND_URL
if (process.env.FRONTEND_URL) {
  const prodOrigin = process.env.FRONTEND_URL.trim().replace(/\/+$/, '');
  if (prodOrigin && prodOrigin !== '*' && !ALLOWED_ORIGINS.includes(prodOrigin)) {
    ALLOWED_ORIGINS.push(prodOrigin);
  }
}

// Optional additional CORS origins (comma-separated, no wildcards)
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(origin => {
    const trimmed = origin.trim().replace(/\/+$/, '');
    if (trimmed && trimmed !== '*' && !ALLOWED_ORIGINS.includes(trimmed)) {
      ALLOWED_ORIGINS.push(trimmed);
    }
  });
}

// Security and parser middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, tests)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with sensible size limit (1 MB)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint
const serverStartTime = Date.now();
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: new Date().toISOString(),
    service: 'PR Sentinel AST Static Analysis Engine',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount analysis routes
app.use('/api', analysisRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

// Function to start server after database initialization
export async function startServer(port = PORT, dbPath) {
  try {
    await initDatabase(dbPath);
    console.log('✅ SQLite Database initialized successfully.');

    return new Promise((resolve) => {
      const server = app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 PR Sentinel Backend running at http://localhost:${port}`);
        console.log(`📡 Health Check: http://localhost:${port}/api/health`);
        console.log(`🔍 Analysis Endpoint: POST http://localhost:${port}/api/analyze`);
        resolve(server);
      });
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Auto-start if running directly
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  startServer();
}

export default app;
