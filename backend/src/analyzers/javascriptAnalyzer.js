import * as espree from 'espree';

/**
 * Universal AST Walker
 * Visits every node in the AST recursively.
 */
function walk(node, visitor, parent = null) {
  if (!node || typeof node !== 'object') return;

  visitor(node, parent);

  for (const key of Object.keys(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && item.type) {
          walk(item, visitor, node);
        }
      }
    } else if (child && typeof child === 'object' && child.type) {
      walk(child, visitor, node);
    }
  }
}

/**
 * Extracts the exact line from code by 1-based line number.
 */
function extractLineSnippet(code, lineNum) {
  const lines = code.split('\n');
  return lines[lineNum - 1] ? lines[lineNum - 1].trim() : '';
}

/**
 * Analyzes JavaScript source code using Espree AST parser.
 * Applies 7 core explainable static analysis rules.
 */
export function analyzeJavaScript(code, options = {}) {
  const filename = options.filename || 'source.js';
  const lines = code.split('\n');
  const lineCount = lines.length;

  let ast;
  const issues = [];

  // Parse code into AST with Espree.
  // First attempt ES Module parsing, fallback to Script if module features fail.
  try {
    ast = espree.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      loc: true,
      range: true,
      tokens: true,
      comment: true
    });
  } catch (moduleErr) {
    try {
      ast = espree.parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'script',
        loc: true,
        range: true,
        tokens: true,
        comment: true
      });
    } catch (syntaxErr) {
      // Gracefully handle syntax errors without crashing the server
      const line = syntaxErr.lineNumber || 1;
      const column = syntaxErr.column || 1;

      issues.push({
        id: 'ISSUE-1',
        ruleId: 'syntax/parse-error',
        title: 'JavaScript Syntax Error',
        description: syntaxErr.message || 'Failed to parse JavaScript source into Abstract Syntax Tree.',
        severity: 'critical',
        line,
        column,
        endLine: line,
        endColumn: column + 1,
        codeSnippet: extractLineSnippet(code, line),
        impact: 'Syntactically invalid code cannot be executed by the Node.js or browser runtime.',
        recommendedSolution: 'Review and correct the syntax error at the indicated line and column.',
        correctedCode: null,
        confidence: 'high'
      });

      return buildAnalysisResult({
        id: options.id,
        code,
        language: 'javascript',
        filename,
        lineCount,
        issues
      });
    }
  }

  // Tracking structures for scope and unused variables
  const declaredVariables = new Map(); // name -> { node, line, column, count: 0 }
  const referencedIdentifiers = new Set();
  const exportedIdentifiers = new Set();

  // First pass: identify exports
  walk(ast, (node) => {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration && node.declaration.declarations) {
        for (const decl of node.declaration.declarations) {
          if (decl.id && decl.id.name) exportedIdentifiers.add(decl.id.name);
        }
      }
      if (node.declaration && node.declaration.id) {
        exportedIdentifiers.add(node.declaration.id.name);
      }
      if (node.specifiers) {
        for (const spec of node.specifiers) {
          if (spec.local && spec.local.name) exportedIdentifiers.add(spec.local.name);
        }
      }
    } else if (node.type === 'ExportDefaultDeclaration') {
      if (node.declaration && node.declaration.name) {
        exportedIdentifiers.add(node.declaration.name);
      }
    }
  });

  // Second pass: AST inspection for all 7 rules
  walk(ast, (node, parent) => {
    // ------------------------------------------------------------------
    // RULE 1: Division by Zero (correctness/division-by-zero)
    // ------------------------------------------------------------------
    if (node.type === 'BinaryExpression' && node.operator === '/') {
      let isZero = false;
      let divisorStr = '';

      if (node.right.type === 'Literal') {
        if (node.right.value === 0 || node.right.raw === '0' || node.right.raw === '0.0') {
          isZero = true;
          divisorStr = String(node.right.raw);
        }
      } else if (node.right.type === 'UnaryExpression' && node.right.operator === '-') {
        if (node.right.argument.type === 'Literal' && node.right.argument.value === 0) {
          isZero = true;
          divisorStr = '-0';
        }
      }

      if (isZero) {
        issues.push({
          id: `ISSUE-${issues.length + 1}`,
          ruleId: 'correctness/division-by-zero',
          title: 'Statically Identifiable Division by Zero',
          description: `Direct arithmetic division by constant zero (${divisorStr}) detected.`,
          severity: 'warning',
          line: node.loc.start.line,
          column: node.loc.start.column + 1,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column + 1,
          codeSnippet: extractLineSnippet(code, node.loc.start.line),
          impact: 'In JavaScript, dividing by zero produces Infinity, -Infinity, or NaN (for 0/0), which frequently corrupts downstream calculations.',
          recommendedSolution: 'Ensure divisors are validated before division or check for non-zero values.',
          correctedCode: `divisor !== 0 ? numerator / divisor : 0`,
          confidence: 'high'
        });
      }
    }

    // ------------------------------------------------------------------
    // RULE 2: Hardcoded Passwords and Likely Secrets (security/hardcoded-credentials)
    // ------------------------------------------------------------------
    const secretKeyPattern = /(password|passwd|secret|api_?key|auth_?token|jwt_?secret|private_?key|access_?token)/i;
    const falsePositiveValues = new Set([
      'password', 'changeme', 'secret', 'admin', '12345678', 'placeholder', 'undefined', 'null', 'todo', 'test', 'dummy', 'localhost'
    ]);

    const checkSecretAssignment = (varName, valueNode) => {
      if (!varName || !secretKeyPattern.test(varName)) return;

      if (valueNode && valueNode.type === 'Literal' && typeof valueNode.value === 'string') {
        const val = valueNode.value.trim();
        // Ignore placeholders, short test strings, or environment variable patterns
        if (val.length >= 8 && !falsePositiveValues.has(val.toLowerCase()) && !val.startsWith('process.env')) {
          issues.push({
            id: `ISSUE-${issues.length + 1}`,
            ruleId: 'security/hardcoded-credentials',
            title: `Hardcoded Secret Detected in '${varName}'`,
            description: `Variable '${varName}' is initialized with a high-entropy string literal that appears to be a plaintext credential or token.`,
            severity: 'critical',
            line: valueNode.loc.start.line,
            column: valueNode.loc.start.column + 1,
            endLine: valueNode.loc.end.line,
            endColumn: valueNode.loc.end.column + 1,
            codeSnippet: extractLineSnippet(code, valueNode.loc.start.line),
            impact: 'Committing credentials to version control exposes infrastructure and authentication keys to repository viewers and unauthorized third parties.',
            recommendedSolution: 'Store credentials in environment variables or a secure key management system.',
            correctedCode: `const ${varName} = process.env.${varName.toUpperCase()} || '';`,
            confidence: 'medium-high'
          });
        }
      }
    };

    if (node.type === 'VariableDeclarator' && node.id && node.id.name) {
      checkSecretAssignment(node.id.name, node.init);
    } else if (node.type === 'AssignmentExpression') {
      if (node.left.type === 'Identifier') {
        checkSecretAssignment(node.left.name, node.right);
      } else if (node.left.type === 'MemberExpression' && node.left.property.name) {
        checkSecretAssignment(node.left.property.name, node.right);
      }
    } else if (node.type === 'Property') {
      const propName = node.key.type === 'Identifier' ? node.key.name : String(node.key.value);
      checkSecretAssignment(propName, node.value);
    }

    // High-entropy token strings anywhere (AWS keys, GitHub PAT, JWT)
    if (node.type === 'Literal' && typeof node.value === 'string') {
      const val = node.value;
      if (/AKIA[0-9A-Z]{16}/.test(val)) {
        issues.push({
          id: `ISSUE-${issues.length + 1}`,
          ruleId: 'security/hardcoded-credentials',
          title: 'Hardcoded AWS Access Key Detected',
          description: 'Literal string matches standard AWS Access Key ID format (AKIA...).',
          severity: 'critical',
          line: node.loc.start.line,
          column: node.loc.start.column + 1,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column + 1,
          codeSnippet: extractLineSnippet(code, node.loc.start.line),
          impact: 'Exposure of cloud provider credentials risks total account and infrastructure takeover.',
          recommendedSolution: 'Revoke this access key immediately and load credentials via IAM roles or environment variables.',
          correctedCode: `process.env.AWS_ACCESS_KEY_ID`,
          confidence: 'high'
        });
      } else if (/ghp_[a-zA-Z0-9]{36}/.test(val)) {
        issues.push({
          id: `ISSUE-${issues.length + 1}`,
          ruleId: 'security/hardcoded-credentials',
          title: 'Hardcoded GitHub Personal Access Token Detected',
          description: 'Literal string matches GitHub Personal Access Token format (ghp_...).',
          severity: 'critical',
          line: node.loc.start.line,
          column: node.loc.start.column + 1,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column + 1,
          codeSnippet: extractLineSnippet(code, node.loc.start.line),
          impact: 'Leaked GitHub tokens can allow attackers to read proprietary repositories or push unauthorized changes.',
          recommendedSolution: 'Revoke the token from GitHub Settings and inject it via GitHub Actions Secrets.',
          correctedCode: `process.env.GITHUB_TOKEN`,
          confidence: 'high'
        });
      }
    }

    // ------------------------------------------------------------------
    // RULE 3: Console Log Usage (observability/console-log)
    // ------------------------------------------------------------------
    if (node.type === 'CallExpression') {
      const callee = node.callee;
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        callee.object.name === 'console' &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'log'
      ) {
        issues.push({
          id: `ISSUE-${issues.length + 1}`,
          ruleId: 'observability/console-log',
          title: 'Console Log Usage in Source Code',
          description: 'Invocation of console.log() detected in production code.',
          severity: 'suggestion',
          line: node.loc.start.line,
          column: node.loc.start.column + 1,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column + 1,
          codeSnippet: extractLineSnippet(code, node.loc.start.line),
          impact: 'Console logging produces unformatted standard output, risks logging sensitive customer PII, and impacts node throughput.',
          recommendedSolution: 'Use a structured logging library (e.g. Winston, Pino) with configurable log levels.',
          correctedCode: `logger.info(...)`,
          confidence: 'high'
        });
      }
    }

    // ------------------------------------------------------------------
    // RULE 4: Use of eval() (security/detect-eval)
    // ------------------------------------------------------------------
    if (node.type === 'CallExpression') {
      const callee = node.callee;
      let isEval = false;

      if (callee.type === 'Identifier' && callee.name === 'eval') {
        isEval = true;
      } else if (
        callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'eval' &&
        callee.object.type === 'Identifier' &&
        ['window', 'global', 'globalThis'].includes(callee.object.name)
      ) {
        isEval = true;
      }

      if (isEval) {
        issues.push({
          id: `ISSUE-${issues.length + 1}`,
          ruleId: 'security/detect-eval',
          title: 'Dangerous Use of eval()',
          description: 'Direct or indirect invocation of eval() executes arbitrary strings as JavaScript code.',
          severity: 'critical',
          line: node.loc.start.line,
          column: node.loc.start.column + 1,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column + 1,
          codeSnippet: extractLineSnippet(code, node.loc.start.line),
          impact: 'eval() creates a critical Remote Code Execution (RCE) vulnerability when inputs are influenced by users and defeats engine optimizations.',
          recommendedSolution: 'Refactor using JSON.parse() for data serialization, mapping objects, or dedicated safe expression evaluators.',
          correctedCode: `JSON.parse(data)`,
          confidence: 'high'
        });
      }
    }

    // ------------------------------------------------------------------
    // RULE 5: Loose Equality (best-practice/no-loose-equality)
    // ------------------------------------------------------------------
    if (node.type === 'BinaryExpression' && (node.operator === '==' || node.operator === '!=')) {
      const strictOp = node.operator === '==' ? '===' : '!==';
      const rawSnippet = extractLineSnippet(code, node.loc.start.line);

      issues.push({
        id: `ISSUE-${issues.length + 1}`,
        ruleId: 'best-practice/no-loose-equality',
        title: `Use of Loose Equality Operator ('${node.operator}')`,
        description: `Comparison uses loose equality '${node.operator}', which triggers implicit type coercion.`,
        severity: 'warning',
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
        endLine: node.loc.end.line,
        endColumn: node.loc.end.column + 1,
        codeSnippet: rawSnippet,
        impact: 'Implicit type coercion causes subtle comparison defects (e.g., "" == 0 is true, null == undefined is true, false == "0" is true).',
        recommendedSolution: `Replace loose equality '${node.operator}' with strict equality '${strictOp}'.`,
        correctedCode: rawSnippet.replace(new RegExp(`\\b${node.operator}\\b|${node.operator}`, 'g'), strictOp),
        confidence: 'high'
      });
    }

    // ------------------------------------------------------------------
    // RULE 6: Unreachable Code (correctness/unreachable-code)
    // ------------------------------------------------------------------
    if (node.type === 'BlockStatement' || node.type === 'Program') {
      const statements = node.body || [];
      let terminatingFound = false;
      let terminatingStmt = null;

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];

        if (terminatingFound) {
          // Functions declarations hoisted in JS, but statements are dead
          if (stmt.type !== 'FunctionDeclaration') {
            issues.push({
              id: `ISSUE-${issues.length + 1}`,
              ruleId: 'correctness/unreachable-code',
              title: 'Unreachable Statement Detected',
              description: `Statement follows a terminal '${terminatingStmt.type}' in the same execution block and can never execute.`,
              severity: 'warning',
              line: stmt.loc.start.line,
              column: stmt.loc.start.column + 1,
              endLine: stmt.loc.end.line,
              endColumn: stmt.loc.end.column + 1,
              codeSnippet: extractLineSnippet(code, stmt.loc.start.line),
              impact: 'Unreachable code indicates logic errors, broken control flow, or incomplete refactoring, unnecessarily increasing maintenance complexity.',
              recommendedSolution: 'Remove the unreachable code or adjust conditional control flow before the terminal statement.',
              correctedCode: null,
              confidence: 'high'
            });
          }
        }

        if (['ReturnStatement', 'ThrowStatement', 'BreakStatement', 'ContinueStatement'].includes(stmt.type)) {
          terminatingFound = true;
          terminatingStmt = stmt;
        }
      }
    }

    // ------------------------------------------------------------------
    // Scope Collection for RULE 7: Unused Variables
    // ------------------------------------------------------------------
    if (node.type === 'VariableDeclarator' && node.id && node.id.type === 'Identifier') {
      const varName = node.id.name;
      // Exclude variables starting with _ and common exported vars
      if (!varName.startsWith('_') && !exportedIdentifiers.has(varName)) {
        declaredVariables.set(varName, {
          node: node.id,
          line: node.id.loc.start.line,
          column: node.id.loc.start.column + 1,
          count: 0
        });
      }
    }

    // Track identifier references
    if (node.type === 'Identifier') {
      const isDeclarationName =
        (parent?.type === 'VariableDeclarator' && parent.id === node) ||
        (parent?.type === 'FunctionDeclaration' && parent.id === node) ||
        (parent?.type === 'MemberExpression' && parent.property === node && !parent.computed);

      if (!isDeclarationName) {
        referencedIdentifiers.add(node.name);
      }
    }
  });

  // Evaluate RULE 7: Unused variables
  for (const [varName, meta] of declaredVariables.entries()) {
    if (!referencedIdentifiers.has(varName)) {
      issues.push({
        id: `ISSUE-${issues.length + 1}`,
        ruleId: 'quality/unused-variable',
        title: `Unused Variable '${varName}'`,
        description: `Variable '${varName}' is declared but never read or referenced in subsequent code.`,
        severity: 'suggestion',
        line: meta.line,
        column: meta.column,
        endLine: meta.line,
        endColumn: meta.column + varName.length,
        codeSnippet: extractLineSnippet(code, meta.line),
        impact: 'Unused variables consume memory, increase cognitive burden, and often point to incomplete features or missed variable usages.',
        recommendedSolution: `Remove '${varName}' or prefix with an underscore ('_${varName}') if required by an interface.`,
        correctedCode: null,
        confidence: 'medium'
      });
    }
  }

  // Sort issues by line and column
  issues.sort((a, b) => {
    if (a.line !== b.line) return a.line - b.line;
    return a.column - b.column;
  });

  return buildAnalysisResult({
    id: options.id,
    code,
    language: 'javascript',
    filename,
    lineCount,
    issues
  });
}

/**
 * Calculates quality score and builds structured response.
 *
 * Scoring Formula:
 * - Base score: 100
 * - Each Critical issue: -25 points
 * - Each Warning issue:  -10 points
 * - Each Suggestion:     -2 points
 * - Score is strictly clamped between 0 and 100.
 */
function buildAnalysisResult({ id, code, language, filename, lineCount, issues }) {
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warnings = issues.filter(i => i.severity === 'warning');
  const suggestions = issues.filter(i => i.severity === 'suggestion');

  const criticalDeductions = criticalIssues.length * 25;
  const warningDeductions = warnings.length * 10;
  const suggestionDeductions = suggestions.length * 2;

  let qualityScore = 100 - criticalDeductions - warningDeductions - suggestionDeductions;
  if (qualityScore < 0) qualityScore = 0;
  if (qualityScore > 100) qualityScore = 100;

  let grade = 'A+';
  let verdict = 'Passed Quality Gate';

  if (qualityScore >= 95) {
    grade = 'A+';
    verdict = 'Clean / Passed Quality Gate';
  } else if (qualityScore >= 90) {
    grade = 'A';
    verdict = 'Passed – Minor Suggestions';
  } else if (qualityScore >= 80) {
    grade = 'B';
    verdict = 'Passed with Warnings';
  } else if (qualityScore >= 70) {
    grade = 'C';
    verdict = 'Review Recommended';
  } else if (qualityScore >= 60) {
    grade = 'D';
    verdict = 'Significant Issues Found';
  } else {
    grade = 'F';
    verdict = 'Failed – Critical Changes Required';
  }

  return {
    id: id || `SCAN-${Math.floor(1000 + Math.random() * 9000)}`,
    code,
    language,
    filename,
    linesScanned: lineCount,
    qualityScore,
    grade,
    verdict,
    scoreBreakdown: {
      base: 100,
      criticalDeduction: criticalDeductions,
      warningDeduction: warningDeductions,
      suggestionDeduction: suggestionDeductions,
      finalScore: qualityScore
    },
    summary: {
      critical: criticalIssues.length,
      warning: warnings.length,
      suggestion: suggestions.length,
      total: issues.length
    },
    criticalIssues,
    warnings,
    suggestions,
    issues
  };
}
