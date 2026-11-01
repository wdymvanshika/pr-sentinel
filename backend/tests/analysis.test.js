import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeJavaScript } from '../src/analyzers/javascriptAnalyzer.js';
import { runAnalysisService, getAnalysisHistoryService, getAnalysisByIdService } from '../src/services/analysisService.js';
import { initDatabase, closeDatabase } from '../src/database/database.js';

// Setup test database in memory
test.before(async () => {
  await initDatabase(':memory:');
});

test.after(() => {
  closeDatabase();
});

test.describe('Static Analysis Engine - Ruleset Verification', () => {
  test('Rule 1: Division by zero is detected', () => {
    const code = `
      function computeRatio(total, count) {
        const ratio = total / 0;
        return ratio;
      }
    `;

    const result = analyzeJavaScript(code);
    const divZero = result.issues.find(i => i.ruleId === 'correctness/division-by-zero');

    assert.ok(divZero, 'Should detect division by zero');
    assert.equal(divZero.severity, 'warning');
    assert.equal(divZero.line, 3);
    assert.ok(divZero.codeSnippet.includes('total / 0'));
  });

  test('Rule 2: Hardcoded secrets and credentials are detected', () => {
    const code = `
      const apiKey = "YOUR_API_KEY_HERE";
      const user = "regular_username";
    `;

    const result = analyzeJavaScript(code);
    const secretIssue = result.issues.find(i => i.ruleId === 'security/hardcoded-credentials');

    assert.ok(secretIssue, 'Should flag hardcoded API key');
    assert.equal(secretIssue.severity, 'critical');
    assert.equal(secretIssue.line, 2);
    assert.ok(secretIssue.title.includes('apiKey'));
  });

  test('Rule 2b: Cloud token formats (AWS key) are flagged with high confidence', () => {
    const code = `
      const config = {
        key: "AKIAIOSFODNN7EXAMPLE"
      };
    `;

    const result = analyzeJavaScript(code);
    const awsIssue = result.issues.find(i => i.title.includes('AWS Access Key'));
    assert.ok(awsIssue, 'Should detect AWS Key pattern');
    assert.equal(awsIssue.severity, 'critical');
  });

  test('Rule 3: console.log is flagged as a suggestion, NOT a critical issue', () => {
    const code = `
      function logUser(user) {
        console.log("Processing user:", user);
        return true;
      }
    `;

    const result = analyzeJavaScript(code);
    const logIssue = result.issues.find(i => i.ruleId === 'observability/console-log');

    assert.ok(logIssue, 'Should detect console.log');
    assert.equal(logIssue.severity, 'suggestion', 'console.log must be suggestion, not critical');
    assert.notEqual(logIssue.severity, 'critical');
  });

  test('Rule 4: eval() usage is flagged as a critical vulnerability', () => {
    const code = `
      function parseDynamic(expr) {
        return eval(expr);
      }
    `;

    const result = analyzeJavaScript(code);
    const evalIssue = result.issues.find(i => i.ruleId === 'security/detect-eval');

    assert.ok(evalIssue, 'Should flag eval()');
    assert.equal(evalIssue.severity, 'critical');
    assert.equal(evalIssue.line, 3);
  });

  test('Rule 5: Loose equality (==) is detected with strict suggestion', () => {
    const code = `
      function isZero(val) {
        if (val == 0) return true;
        return false;
      }
    `;

    const result = analyzeJavaScript(code);
    const eqIssue = result.issues.find(i => i.ruleId === 'best-practice/no-loose-equality');

    assert.ok(eqIssue, 'Should detect loose equality ==');
    assert.equal(eqIssue.severity, 'warning');
    assert.ok(eqIssue.recommendedSolution.includes('==='));
  });

  test('Rule 6: Unreachable code following return statement is detected', () => {
    const code = `
      function calculateDiscount(price) {
        return price * 0.9;
        const auditLog = "applied 10%";
        console.log(auditLog);
      }
    `;

    const result = analyzeJavaScript(code);
    const deadCodeIssue = result.issues.find(i => i.ruleId === 'correctness/unreachable-code');

    assert.ok(deadCodeIssue, 'Should detect unreachable statement');
    assert.equal(deadCodeIssue.severity, 'warning');
    assert.equal(deadCodeIssue.line, 4);
  });

  test('Rule 7: Unused variables are flagged as suggestions', () => {
    const code = `
      function runTask() {
        const unusedValue = 42;
        return true;
      }
    `;

    const result = analyzeJavaScript(code);
    const unusedIssue = result.issues.find(i => i.ruleId === 'quality/unused-variable');

    assert.ok(unusedIssue, 'Should detect unused variable');
    assert.equal(unusedIssue.severity, 'suggestion');
    assert.ok(unusedIssue.title.includes('unusedValue'));
  });

  test('Clean code produces 100 quality score and no issues', () => {
    const cleanCode = `
      export function add(a, b) {
        if (typeof a !== 'number' || typeof b !== 'number') {
          throw new TypeError('Arguments must be numbers');
        }
        return a + b;
      }
    `;

    const result = analyzeJavaScript(cleanCode);

    assert.equal(result.qualityScore, 100);
    assert.equal(result.grade, 'A+');
    assert.equal(result.summary.total, 0);
    assert.equal(result.issues.length, 0);
  });

  test('Syntax errors are handled gracefully without throwing unhandled exceptions', () => {
    const invalidCode = `const broken = ;`;

    const result = analyzeJavaScript(invalidCode);

    assert.equal(result.summary.critical, 1);
    assert.equal(result.issues[0].ruleId, 'syntax/parse-error');
    assert.equal(result.issues[0].line, 1);
  });
});

test.describe('Analysis Service & Validation', () => {
  test('Rejects empty or whitespace-only code with 400 status', async () => {
    await assert.rejects(
      async () => {
        await runAnalysisService({ code: '   ' });
      },
      (err) => {
        assert.equal(err.status, 400);
        assert.equal(err.code, 'ERR_MISSING_CODE');
        return true;
      }
    );
  });

  test('Rejects missing code parameter with 400 status', async () => {
    await assert.rejects(
      async () => {
        await runAnalysisService({});
      },
      (err) => {
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  test('Rejects unsupported language with informative message', async () => {
    await assert.rejects(
      async () => {
        await runAnalysisService({ code: 'print("hello")', language: 'cobol' });
      },
      (err) => {
        assert.equal(err.status, 400);
        assert.equal(err.code, 'ERR_UNSUPPORTED_LANGUAGE');
        assert.ok(err.message.includes('cobol'));
        return true;
      }
    );
  });

  test('Successfully analyzes and persists to database', async () => {
    const code = `
      function authenticate(token) {
        if (token == "admin_secret_token_12345") {
          return true;
        }
        return false;
      }
    `;

    const analysis = await runAnalysisService({
      code,
      language: 'javascript',
      filename: 'auth.js'
    });

    assert.ok(analysis.id, 'Should have generated scan ID');
    assert.equal(analysis.language, 'javascript');
    assert.equal(analysis.filename, 'auth.js');
    assert.ok(analysis.qualityScore < 100, 'Score should reflect detected issues');

    // Retrieve via history service
    const history = await getAnalysisHistoryService(10, 0);
    assert.ok(history.length > 0, 'History should contain saved analysis');

    // Retrieve single by ID
    const single = await getAnalysisByIdService(analysis.id);
    assert.equal(single.id, analysis.id);
    assert.equal(single.qualityScore, analysis.qualityScore);
  });
});
