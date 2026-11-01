/**
 * PR Sentinel API Service Client
 * Handles HTTP communication with the Node.js + Express backend.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Universal fetch wrapper that parses structured error messages and handles network timeouts.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data?.error?.code || 'ERR_API_ERROR';
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If it's already an API error with status, rethrow
    if (err.status) throw err;

    // Handle network / connection errors (e.g. backend down)
    const networkError = new Error(
      `Cannot connect to PR Sentinel backend at ${API_BASE_URL}. Please ensure the backend server is running.`
    );
    networkError.code = 'ERR_BACKEND_UNAVAILABLE';
    networkError.originalError = err;
    throw networkError;
  }
}

/**
 * Sends source code to the backend for AST static analysis.
 *
 * @param {Object} params
 * @param {string} params.code - Source code string
 * @param {string} params.language - Language identifier (e.g. 'javascript')
 * @param {string} [params.filename] - Source filename
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeCode({ code, language = 'javascript', filename }) {
  const response = await request('/analyze', {
    method: 'POST',
    body: JSON.stringify({
      code,
      language: language.toLowerCase(),
      filename: filename || 'source.js'
    })
  });

  return response.data;
}

/**
 * Retrieves past analyses from SQLite database.
 *
 * @param {number} [limit=50]
 * @param {number} [offset=0]
 * @returns {Promise<Array>} List of analyses
 */
export async function fetchHistory(limit = 50, offset = 0) {
  const response = await request(`/history?limit=${limit}&offset=${offset}`, {
    method: 'GET'
  });

  return response.data || [];
}

/**
 * Retrieves a single analysis record with its issues by ID.
 *
 * @param {string} id - Scan ID (e.g. SCAN-xxxx)
 * @returns {Promise<Object>} Analysis details
 */
export async function fetchAnalysisById(id) {
  const response = await request(`/history/${encodeURIComponent(id)}`, {
    method: 'GET'
  });

  return response.data;
}

/**
 * Checks server health status.
 *
 * @returns {Promise<Object>} Health check metadata
 */
export async function checkBackendHealth() {
  const response = await request('/health', {
    method: 'GET'
  });

  return response;
}
