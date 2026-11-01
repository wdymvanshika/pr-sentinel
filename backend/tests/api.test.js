import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../src/server.js';
import { closeDatabase } from '../src/database/database.js';

let serverInstance;
let baseUrl;

test.before(async () => {
  // Use port 0 so the OS assigns any free ephemeral port, preventing port collisions
  serverInstance = await startServer(0, ':memory:');
  const port = serverInstance.address().port;
  baseUrl = `http://localhost:${port}`;
});

test.after(async () => {
  if (serverInstance) {
    await new Promise(resolve => serverInstance.close(resolve));
  }
  closeDatabase();
});

test.describe('PR Sentinel Express HTTP API Endpoints', () => {
  test('GET /api/health returns status 200 and health metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'PR Sentinel AST Static Analysis Engine');
    assert.equal(data.version, '1.0.0');
    assert.ok(typeof data.uptime === 'number');
  });

  test('POST /api/analyze successfully analyzes source code and returns structured JSON', async () => {
    const sampleCode = `
      function calculatePayout(balance, rate) {
        if (rate == 0) {
          const result = balance / 0;
          return result;
        }
        console.log("Processing payout");
        return eval("balance * rate");
      }
    `;

    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: sampleCode,
        language: 'javascript',
        filename: 'payout.js'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.ok(body.data.id.startsWith('SCAN-'));
    assert.equal(body.data.language, 'javascript');
    assert.equal(body.data.filename, 'payout.js');
    assert.ok(body.data.qualityScore < 100);
    assert.ok(body.data.issues.length >= 3);

    // Verify rules flagged
    const ruleIds = body.data.issues.map(i => i.ruleId);
    assert.ok(ruleIds.includes('correctness/division-by-zero'));
    assert.ok(ruleIds.includes('best-practice/no-loose-equality'));
    assert.ok(ruleIds.includes('observability/console-log'));
    assert.ok(ruleIds.includes('security/detect-eval'));
  });

  test('POST /api/analyze validates missing code parameter', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'javascript'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ERR_MISSING_CODE');
  });

  test('POST /api/analyze validates unsupported language', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'def foo(): pass',
        language: 'python'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ERR_UNSUPPORTED_LANGUAGE');
  });

  test('GET /api/history returns list of previous analyses', async () => {
    const res = await fetch(`${baseUrl}/api/history`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  test('GET /api/history/:id returns specific analysis by ID', async () => {
    // 1. Create a scan
    const createRes = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'const x = 1;',
        language: 'javascript',
        filename: 'test-single.js'
      })
    });
    const created = await createRes.json();
    const scanId = created.data.id;

    // 2. Fetch it by ID
    const getRes = await fetch(`${baseUrl}/api/history/${scanId}`);
    assert.equal(getRes.status, 200);

    const fetched = await getRes.json();
    assert.equal(fetched.success, true);
    assert.equal(fetched.data.id, scanId);
    assert.equal(fetched.data.filename, 'test-single.js');
  });

  test('GET /api/history/:id returns 404 for non-existent scan ID', async () => {
    const res = await fetch(`${baseUrl}/api/history/SCAN-NONEXISTENT-9999`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ERR_NOT_FOUND');
  });

  test('GET /api/nonexistent-route returns 404 not found JSON response', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ERR_ROUTE_NOT_FOUND');
  });

  test('CORS allows requests from permitted origin', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' }
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  });

  test('CORS rejects requests from untrusted external origin', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://malicious-untrusted-origin.com' }
    });
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('CORS blocked'));
  });
});
