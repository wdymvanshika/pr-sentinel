export const OVERVIEW_METRICS = {
  totalAnalyses: {
    value: '1,428',
    change: '+14.2%',
    trend: 'up',
    subtitle: 'across 42 repositories'
  },
  issuesDetected: {
    value: '284',
    change: '-8.5%',
    trend: 'down', // downward trend is good for issues!
    subtitle: '62% auto-fixable'
  },
  securityWarnings: {
    value: '17',
    change: '-3',
    trend: 'down',
    subtitle: '3 critical, 9 high, 5 medium'
  },
  averageQualityScore: {
    value: '88.4',
    change: '+4.1 pts',
    trend: 'up',
    subtitle: 'Grade A- (Healthy)'
  }
};

export const QUALITY_TREND_DATA = [
  { date: 'Oct 18', score: 79, issues: 38, critical: 5 },
  { date: 'Oct 20', score: 81, issues: 32, critical: 4 },
  { date: 'Oct 22', score: 80, issues: 35, critical: 3 },
  { date: 'Oct 24', score: 84, issues: 28, critical: 2 },
  { date: 'Oct 26', score: 83, issues: 30, critical: 3 },
  { date: 'Oct 28', score: 86, issues: 22, critical: 2 },
  { date: 'Oct 30', score: 87, issues: 19, critical: 1 },
  { date: 'Nov 01', score: 88, issues: 17, critical: 1 }
];

export const ISSUES_BY_CATEGORY = [
  { name: 'Security', count: 17, color: '#f43f5e' },
  { name: 'Performance', count: 48, color: '#f59e0b' },
  { name: 'Code Quality', count: 126, color: '#38bdf8' },
  { name: 'Maintainability', count: 93, color: '#818cf8' }
];

export const RECENT_ANALYSES = [
  {
    id: 'PR-1042',
    title: 'feat: Add OAuth2 token validation & refresh handler',
    repo: 'sentinel-core-api',
    branch: 'feat/oauth2-handler',
    author: 'alex-dev',
    language: 'TypeScript',
    score: 72,
    grade: 'B-',
    critical: 1,
    warnings: 4,
    info: 3,
    timestamp: '12 minutes ago',
    date: '2026-11-01 19:48',
    duration: '1.8s',
    linesScanned: 412,
    status: 'warning'
  },
  {
    id: 'PR-1041',
    title: 'refactor: Payment checkout webhook dispatcher',
    repo: 'billing-service',
    branch: 'hotfix/webhook-retry',
    author: 'sarah-k',
    language: 'Go',
    score: 96,
    grade: 'A+',
    critical: 0,
    warnings: 1,
    info: 2,
    timestamp: '2 hours ago',
    date: '2026-11-01 18:15',
    duration: '2.4s',
    linesScanned: 850,
    status: 'clean'
  },
  {
    id: 'PR-1040',
    title: 'fix: User database connection pooling leak',
    repo: 'data-layer',
    branch: 'fix/pool-exhaustion',
    author: 'dchen',
    language: 'Python',
    score: 64,
    grade: 'C+',
    critical: 2,
    warnings: 5,
    info: 4,
    timestamp: '4 hours ago',
    date: '2026-11-01 16:30',
    duration: '3.1s',
    linesScanned: 1240,
    status: 'critical'
  },
  {
    id: 'PR-1039',
    title: 'feat: Real-time notification worker using Redis pub/sub',
    repo: 'notification-service',
    branch: 'feature/redis-stream',
    author: 'marcus-v',
    language: 'JavaScript',
    score: 89,
    grade: 'A-',
    critical: 0,
    warnings: 2,
    info: 5,
    timestamp: 'Yesterday',
    date: '2026-10-31 14:10',
    duration: '1.2s',
    linesScanned: 530,
    status: 'clean'
  },
  {
    id: 'PR-1038',
    title: 'sec: Sanitize user input before markdown rendering',
    repo: 'web-frontend',
    branch: 'sec/xss-patch',
    author: 'elena-s',
    language: 'TypeScript',
    score: 98,
    grade: 'A+',
    critical: 0,
    warnings: 0,
    info: 1,
    timestamp: '2 days ago',
    date: '2026-10-30 11:22',
    duration: '0.9s',
    linesScanned: 310,
    status: 'clean'
  },
  {
    id: 'PR-1037',
    title: 'chore: Upgrade dependency manifest and remove deprecated APIs',
    repo: 'analytics-worker',
    branch: 'chore/deps-bump',
    author: 'bot-dependabot',
    language: 'JavaScript',
    score: 92,
    grade: 'A',
    critical: 0,
    warnings: 1,
    info: 2,
    timestamp: '3 days ago',
    date: '2026-10-29 09:14',
    duration: '1.4s',
    linesScanned: 620,
    status: 'clean'
  }
];

export const RECENT_ACTIVITY = [
  {
    id: 'act-1',
    type: 'pr_analyzed',
    title: 'PR #1042 analyzed',
    description: 'Found 1 critical SQL vulnerability in feat/oauth2-handler',
    time: '12m ago',
    badge: 'Critical',
    badgeType: 'critical'
  },
  {
    id: 'act-2',
    type: 'quality_gate_passed',
    title: 'Quality Gate Passed',
    description: 'billing-service PR #1041 scored 96/100 (Grade A+)',
    time: '2h ago',
    badge: 'Passed',
    badgeType: 'success'
  },
  {
    id: 'act-3',
    type: 'security_alert',
    title: 'Security Alert Triggered',
    description: 'Hardcoded credentials detected in data-layer branch fix/pool-exhaustion',
    time: '4h ago',
    badge: 'Alert',
    badgeType: 'warning'
  },
  {
    id: 'act-4',
    type: 'ruleset_updated',
    title: 'Ruleset Updated',
    description: 'Enabled OWASP Top 10 strict AST inspection across organization',
    time: '1d ago',
    badge: 'Config',
    badgeType: 'info'
  }
];

export const DEFAULT_ANALYSIS_RESULT = {
  id: 'PR-1042',
  title: 'authController.js (PR #1042)',
  target: 'authController.js',
  repo: 'sentinel-core-api',
  branch: 'feat/oauth2-handler',
  author: 'alex-dev',
  language: 'JavaScript',
  qualityScore: 72,
  grade: 'B-',
  verdict: 'Requires Changes',
  duration: '1.8s',
  linesScanned: 38,
  rulesEvaluated: 142,
  timestamp: 'Just now',
  summary: {
    critical: 1,
    warning: 2,
    info: 1
  },
  issues: [
    {
      id: 'ISSUE-01',
      severity: 'critical',
      category: 'Security',
      ruleId: 'security/detect-sql-injection',
      line: 11,
      title: 'Potential SQL Injection via Raw String Concatenation',
      description: 'User input parameters (username and password) are directly interpolated into raw SQL statements without parameter binding or escaping.',
      codeSnippet: `const query = "SELECT id, email, role FROM users WHERE username = '" + username + "' AND password_hash = '" + password + "';";`,
      suggestedFix: `// Use parameterized queries with bound placeholders
const query = "SELECT id, email, role FROM users WHERE username = $1 AND password_hash = $2";
const [rows] = await db.query(query, [username, password]);`,
      impact: 'Allows malicious actors to bypass authentication or extract sensitive database contents via SQL injection attacks.'
    },
    {
      id: 'ISSUE-02',
      severity: 'warning',
      category: 'Security',
      ruleId: 'security/insecure-token-generation',
      line: 20,
      title: 'Cryptographically Weak Random Token Generation',
      description: 'Using Math.random() for authentication tokens produces predictable pseudo-random values susceptible to collision and brute-force token generation.',
      codeSnippet: `const token = "auth_" + rows[0].id + "_" + Math.random().toString(36).substring(2);`,
      suggestedFix: `// Use crypto.randomBytes for cryptographically secure tokens
const crypto = require('crypto');
const token = "auth_" + rows[0].id + "_" + crypto.randomBytes(32).toString('hex');`,
      impact: 'Attackers can predict or forge valid session tokens, leading to session hijacking.'
    },
    {
      id: 'ISSUE-03',
      severity: 'warning',
      category: 'Maintainability',
      ruleId: 'error-handling/leak-stack-trace',
      line: 29,
      title: 'Internal Stack Trace Leaked to Client Response',
      description: 'Returning err.stack in production API responses discloses internal server paths, file names, database driver versions, and software architecture.',
      codeSnippet: `res.status(500).json({ error: err.message, stack: err.stack });`,
      suggestedFix: `// Log internal details on the server and return a sanitized message
logger.error('Authentication failure', { error: err.message, stack: err.stack });
res.status(500).json({ error: 'Internal server error occurred' });`,
      impact: 'Information disclosure that accelerates vulnerability discovery for reconnaissance.'
    },
    {
      id: 'ISSUE-04',
      severity: 'info',
      category: 'Best Practice',
      ruleId: 'observability/missing-structured-logger',
      line: 23,
      title: 'Unstructured Console Logging in API Route',
      description: 'Direct use of console.log() produces unformatted strings that cannot be indexed, queried, or monitored effectively in centralized log aggregators (e.g. Datadog, CloudWatch).',
      codeSnippet: `console.log("User logged in:", username);`,
      suggestedFix: `// Use application logger with structured metadata context
logger.info('User authentication succeeded', { userId: rows[0].id, username });`,
      impact: 'Reduces observability and makes incident response and auditing significantly harder.'
    }
  ]
};
