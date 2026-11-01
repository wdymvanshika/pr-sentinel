export const SAMPLE_SNIPPETS = {
  javascript_sql: {
    id: 'javascript_sql',
    name: 'SQL Injection Risk (Node.js/Express)',
    language: 'javascript',
    filename: 'authController.js',
    code: `const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Authenticate user credentials
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // CRITICAL: Vulnerable to SQL Injection via direct string interpolation
  const query = "SELECT id, email, role FROM users WHERE username = '" + username + "' AND password_hash = '" + password + "'";

  try {
    const [rows] = await db.query(query);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // WARNING: Storing sensitive token without expiration
    const token = "auth_" + rows[0].id + "_" + Math.random().toString(36).substring(2);
    
    // INFO: Missing structured logging for audit trail
    console.log("User logged in:", username);

    res.json({ success: true, token, user: rows[0] });
  } catch (err) {
    // WARNING: Leaking database internal stack trace to client
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;`
  },

  typescript_react: {
    id: 'typescript_react',
    name: 'Memory Leak & Uncontrolled State (React/TS)',
    language: 'typescript',
    filename: 'LiveMetricMonitor.tsx',
    code: `import React, { useState, useEffect } from 'react';

interface MetricStreamProps {
  endpoint: string;
  refreshInterval: number;
}

export const LiveMetricMonitor: React.FC<MetricStreamProps> = ({ endpoint, refreshInterval }) => {
  const [data, setData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CRITICAL: Interval timer created without cleanup function
    const timer = setInterval(async () => {
      try {
        const response = await fetch(endpoint);
        const json = await response.json();
        // WARNING: Mutating previous state without functional updater
        setData([...data, json.value]);
      } catch (e: any) {
        setError(e.message);
      }
    }, refreshInterval);

    // INFO: Missing dependency array items: [data, endpoint, refreshInterval]
  }, []);

  return (
    <div className="monitor-container">
      <h3>Live Telemetry Stream</h3>
      {error && <span className="alert">{error}</span>}
      <div className="stream-data">
        {data.map((val, idx) => (
          // WARNING: Using unstable array index as React key
          <div key={idx} className="metric-point">
            <span>#{idx}</span>: <strong>{val}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};`
  },

  python_security: {
    id: 'python_security',
    name: 'Hardcoded Secret & Insecure File Access (Python)',
    language: 'python',
    filename: 'report_generator.py',
    code: `import os
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

# CRITICAL: Hardcoded production secret key
JWT_SECRET = "YOUR_JWT_SECRET_HERE"
ADMIN_API_TOKEN = "super_secret_admin_token_2026"

@app.route('/generate-report', methods=['POST'])
def generate_report():
    report_name = request.json.get('name', 'monthly')
    output_dir = request.json.get('directory', '/tmp/reports')

    # CRITICAL: Command Injection vulnerability via shell execution
    command = f"python generate_pdf.py --title '{report_name}' --out '{output_dir}'"
    os.system(command)

    # WARNING: Path traversal risk without sanitizing directory path
    target_file = os.path.join(output_dir, f"{report_name}.pdf")

    # INFO: Unclosed file descriptor without context manager
    f = open(target_file, 'rb')
    content = f.read()

    return jsonify({"status": "generated", "bytes": len(content)})

if __name__ == '__main__':
    # WARNING: Debug mode enabled in production code
    app.run(host='0.0.0.0', port=5000, debug=True)`
  },

  go_concurrency: {
    id: 'go_concurrency',
    name: 'Goroutine Leak & Race Condition (Go)',
    language: 'go',
    filename: 'worker_pool.go',
    code: `package workers

import (
	"context"
	"fmt"
	"time"
)

type Job struct {
	ID    string
	Data  []byte
	Reply chan error
}

// CRITICAL: Goroutine leak if context cancels before send completes
func ProcessJobAsync(ctx context.Context, job Job) {
	go func() {
		time.Sleep(100 * time.Millisecond)
		// WARNING: Potential nil pointer dereference or send on closed channel
		job.Reply <- fmt.Errorf("simulated failure for job %s", job.ID)
	}()
}

// WARNING: Unprotected shared state counter causing data race
var globalJobCounter int

func IncrementJobCounter() {
	globalJobCounter++
}

// INFO: Function name deviates from standard Go exported conventions
func run_batch_processor(jobs []Job) {
	for _, j := range jobs {
		ProcessJobAsync(context.Background(), j)
	}
}`
  },

  clean_code: {
    id: 'clean_code',
    name: 'Clean Production Service (TypeScript/Express)',
    language: 'typescript',
    filename: 'paymentService.ts',
    code: `import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../database';
import { logger } from '../utils/logger';

export const paymentRouter = Router();

// Robust schema validation with Zod
const ProcessPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  idempotencyKey: z.string().min(16),
});

paymentRouter.post('/charge', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = ProcessPaymentSchema.parse(req.body);

    // Parameterized SQL query preventing injection
    const query = \`
      SELECT id, status, amount_due 
      FROM invoices 
      WHERE id = $1 AND is_settled = false
    \`;
    const invoice = await db.queryOne(query, [validated.invoiceId]);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found or already settled' });
    }

    logger.info('Processing payment transaction', { 
      invoiceId: validated.invoiceId, 
      amount: validated.amountCents 
    });

    res.status(200).json({ status: 'succeeded', invoiceId: invoice.id });
  } catch (err) {
    next(err);
  }
});`
  }
};
