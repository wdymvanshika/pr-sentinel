# PR Sentinel — Static Code Analysis & PR Review Backend

Welcome to the backend service of **PR Sentinel**. This is a Node.js + Express REST API that performs real static analysis on JavaScript code using an Abstract Syntax Tree (AST) engine, calculates transparent quality scores, and records all review history in an embedded SQLite database.

---

## 📖 What the Backend Does

1. **Parses JavaScript into an AST**: Uses [Espree](https://github.com/eslint/espree) (the official parser powering ESLint) to construct a full Abstract Syntax Tree of submitted source code.
2. **Evaluates 7 Real Static Rules**:
   - 🚨 **`security/detect-eval`**: Detects dangerous `eval()` and dynamic code execution vectors.
   - 🚨 **`security/hardcoded-credentials`**: Detects hardcoded API keys, passwords, and cloud tokens (e.g. AWS access keys, GitHub PATs).
   - ⚠️ **`correctness/division-by-zero`**: Identifies statically constant division by zero arithmetic.
   - ⚠️ **`best-practice/no-loose-equality`**: Identifies loose equality (`==`, `!=`) and suggests strict equality (`===`, `!==`).
   - ⚠️ **`correctness/unreachable-code`**: Identifies dead statements following `return`, `throw`, `break`, or `continue`.
   - ℹ️ **`observability/console-log`**: Flags `console.log()` calls as maintenance suggestions (not critical security alerts).
   - ℹ️ **`quality/unused-variable`**: Tracks variable declarations and detects unused identifiers.
   - 🛠️ **Syntax Error Graceful Handling**: Recovers from invalid syntax and provides exact line/column indicators without crashing the server.
3. **Computes a Transparent Quality Score**:
   - Base score: `100`.
   - Each Critical issue: `-25` pts.
   - Each Warning issue: `-10` pts.
   - Each Suggestion: `-2` pts.
   - Returns letter grades (`A+`, `A`, `B`, `C`, `D`, `F`) and clear status verdicts.
4. **Stores Analysis History in SQLite**: Saves submitted source code, scores, timestamps, and findings locally in SQLite without requiring external database servers.

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── analyzers/
│   │   └── javascriptAnalyzer.js    # AST inspection engine and 7 static rules
│   ├── controllers/
│   │   └── analysisController.js    # Express route handlers
│   ├── database/
│   │   └── database.js              # SQLite connection, schema, and persistence
│   ├── middleware/
│   │   └── errorHandler.js          # Centralized error handler and 404 middleware
│   ├── routes/
│   │   └── analysisRoutes.js        # API route definitions
│   ├── services/
│   │   └── analysisService.js       # Business logic, input validation, and orchestration
│   └── server.js                    # Express app initialization and server entry point
├── tests/
│   ├── analysis.test.js             # Engine ruleset and service unit tests
│   └── api.test.js                  # End-to-end HTTP API integration tests
├── .env.example                     # Environment template
├── .env                             # Local environment variables
├── .gitignore                       # Git ignore configuration
├── package.json                     # NPM dependencies and scripts
└── README.md                        # Documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or newer.

### 2. Installation
Open your terminal in the `backend` folder:

```powershell
cd "c:\Users\Davinder Kumar\OneDrive\Desktop\pr-sentinel\backend"
npm install
```

### 3. Start the Server
To start the backend in production mode:
```powershell
npm start
```

To start the backend in development mode with automatic reload:
```powershell
npm run dev
```

The server will boot and display:
```
✅ SQLite Database initialized successfully.
🚀 PR Sentinel Backend running at http://localhost:5000
📡 Health Check: http://localhost:5000/api/health
🔍 Analysis Endpoint: POST http://localhost:5000/api/analyze
```

---

## 📡 API Endpoints

### 1. Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Description**: Verifies that the API service is alive and healthy.
- **Example Response**:
  ```json
  {
    "status": "ok",
    "uptime": 42,
    "timestamp": "2026-11-01T21:58:00.000Z",
    "service": "PR Sentinel AST Static Analysis Engine",
    "version": "1.0.0",
    "environment": "development"
  }
  ```

---

### 2. Analyze Source Code
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/analyze`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "code": "function calculate(balance, rate) {\n  if (rate == 0) {\n    return balance / 0;\n  }\n  console.log('Balance:', balance);\n  return eval('balance * rate');\n}",
    "language": "javascript",
    "filename": "calculator.js"
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "SCAN-MH8L2Q-482",
      "language": "javascript",
      "filename": "calculator.js",
      "linesScanned": 7,
      "qualityScore": 53,
      "grade": "F",
      "verdict": "Failed – Critical Changes Required",
      "scoreBreakdown": {
        "base": 100,
        "criticalDeduction": 25,
        "warningDeduction": 20,
        "suggestionDeduction": 2,
        "finalScore": 53
      },
      "summary": {
        "critical": 1,
        "warning": 2,
        "suggestion": 1,
        "total": 4
      },
      "issues": [
        {
          "id": "ISSUE-1",
          "ruleId": "best-practice/no-loose-equality",
          "title": "Use of Loose Equality Operator ('==')",
          "severity": "warning",
          "line": 2,
          "column": 7,
          "codeSnippet": "if (rate == 0) {",
          "impact": "Implicit type coercion causes subtle comparison defects.",
          "recommendedSolution": "Replace loose equality '==' with strict equality '==='.",
          "correctedCode": "if (rate === 0) {"
        },
        {
          "id": "ISSUE-2",
          "ruleId": "correctness/division-by-zero",
          "title": "Statically Identifiable Division by Zero",
          "severity": "warning",
          "line": 3,
          "column": 12,
          "codeSnippet": "return balance / 0;",
          "impact": "In JavaScript, dividing by zero produces Infinity or NaN.",
          "recommendedSolution": "Ensure divisors are validated before division."
        },
        {
          "id": "ISSUE-3",
          "ruleId": "observability/console-log",
          "title": "Console Log Usage in Source Code",
          "severity": "suggestion",
          "line": 5,
          "column": 3,
          "codeSnippet": "console.log('Balance:', balance);",
          "impact": "Console logging produces unformatted standard output in production.",
          "recommendedSolution": "Use a structured logging library (e.g. Winston, Pino)."
        },
        {
          "id": "ISSUE-4",
          "ruleId": "security/detect-eval",
          "title": "Dangerous Use of eval()",
          "severity": "critical",
          "line": 6,
          "column": 10,
          "codeSnippet": "return eval('balance * rate');",
          "impact": "eval() creates a critical Remote Code Execution (RCE) vulnerability.",
          "recommendedSolution": "Refactor using JSON.parse() or dedicated parser libraries."
        }
      ]
    }
  }
  ```

---

### 3. Get Analysis Audit History
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/history?limit=10&offset=0`
- **Description**: Returns recent code reviews stored in the SQLite database, ordered newest first.
- **Example Response**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "SCAN-MH8L2Q-482",
        "language": "javascript",
        "filename": "calculator.js",
        "qualityScore": 53,
        "grade": "F",
        "verdict": "Failed – Critical Changes Required",
        "summary": {
          "critical": 1,
          "warning": 2,
          "suggestion": 1,
          "total": 4
        },
        "createdAt": "2026-11-01T21:58:30.000Z"
      }
    ]
  }
  ```

---

### 4. Get Analysis Details by ID
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/history/:id`
- **Description**: Returns the complete record of a single past scan, including submitted source code and findings.

---

## 🧪 Running Automated Tests

The backend includes a comprehensive test suite covering all AST inspection rules, input validation, HTTP routes, and database operations.

To run all tests:
```powershell
npm test
```

Test output:
```
✔ Static Analysis Engine - Ruleset Verification (10 tests)
✔ Analysis Service & Validation (4 tests)
✔ PR Sentinel Express HTTP API Endpoints (8 tests)
ℹ tests 22
ℹ suites 3
ℹ pass 22
ℹ fail 0
```

---

## ☁️ Deploying on Render (Production Guide)

PR Sentinel Backend is architected to deploy directly to [Render](https://render.com) as a **Web Service**.

### 1. Render Web Service Settings

When creating a new Web Service on the Render dashboard:

| Setting | Value | Notes |
|---|---|---|
| **Root Directory** | `backend` | If deploying from a monorepo containing both frontend and backend |
| **Environment** | `Node` | Node.js runtime |
| **Node Version** | `>= 22.5.0` | Specified in `package.json` under `engines` to support `node:sqlite` |
| **Build Command** | `npm install` | Installs production dependencies |
| **Start Command** | `npm start` | Runs `node src/server.js` |
| **Health Check Path** | `/api/health` | Render automatically verifies server availability |

---

### 2. Environment Variables Configuration

Set these variables in the **Environment** tab of your Render service:

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `FRONTEND_URL` | `https://your-frontend-app.onrender.com` | Production URL of your React frontend app for CORS whitelist |
| `PORT` | *(Leave empty)* | Render assigns this dynamically (e.g. `10000`). The backend automatically binds to `process.env.PORT` |
| `DB_PATH` | `./data/sentinel.db` *(or disk mount path)* | SQLite database file location |
| `CORS_ORIGIN` | *(Optional)* | Extra comma-separated origins if needed |

---

### 3. Production CORS Security

- **Strict Origin Whitelist**: In production, CORS is restricted to your `FRONTEND_URL` and standard local development ports (`5173`, `5174`).
- **No Wildcard Origins**: Unrestricted wildcard origins (`*`) are explicitly avoided to protect API integrity and credentials.
- **Safe Fallback**: If `FRONTEND_URL` is omitted, the API continues operating safely and accepts development origins or non-browser server-to-server calls without crashing.
- **Trailing Slash Normalization**: Any trailing slash in `FRONTEND_URL` is automatically stripped to prevent CORS header mismatches.

---

### 4. SQLite Storage & Ephemeral Hosting Limitations

> [!WARNING]
> **Ephemeral Filesystem Limitation on Render**
>
> By default, the SQLite database file is stored at `./data/sentinel.db` inside the backend directory.
>
> On Render's standard and free hosting tiers, the container filesystem is **ephemeral**:
> 1. Any files written to the local disk exist only in the running container instance.
> 2. Whenever a new deployment occurs, the service restarts, or Render suspends an inactive free instance, **the filesystem is wiped and restored to the Git repository state**.
> 3. Any analysis history saved to `./data/sentinel.db` during that session will be reset.

#### Production Solutions for Data Durability:
1. **Render Persistent Disk** *(Recommended for SQLite)*:
   - In Render, attach a Persistent Disk (e.g., 1 GB mounted at `/var/data`).
   - Set the environment variable:
     ```env
     DB_PATH=/var/data/sentinel.db
     ```
   - All analyses will persist across restarts, redeployments, and crashes.
2. **External Database**:
   - For high-volume multi-instance scaling, SQLite can be replaced with a managed database service such as Render PostgreSQL, Supabase, or Turso.

