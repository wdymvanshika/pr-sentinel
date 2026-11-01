import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analyzeCode, fetchHistory, fetchAnalysisById, checkBackendHealth } from '../services/api';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(() => {
    try {
      const saved = localStorage.getItem('pr_sentinel_current_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Sync current result to local cache for tab refreshes
  useEffect(() => {
    if (currentResult) {
      try {
        localStorage.setItem('pr_sentinel_current_result', JSON.stringify(currentResult));
      } catch {
        // storage unavailable
      }
    }
  }, [currentResult]);

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const records = await fetchHistory(50, 0);
      setHistory(records);
      setIsBackendOnline(true);
    } catch (err) {
      setHistoryError(err.message || 'Failed to load analysis history from server.');
      setIsBackendOnline(false);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      try {
        await checkBackendHealth();
        if (isMounted) setIsBackendOnline(true);
      } catch {
        if (isMounted) setIsBackendOnline(false);
      }

      try {
        if (isMounted) setIsLoadingHistory(true);
        const records = await fetchHistory(50, 0);
        if (isMounted) {
          setHistory(records);
          setIsBackendOnline(true);
        }
      } catch (err) {
        if (isMounted) setHistoryError(err.message || 'Failed to load analysis history.');
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    initialize();
    return () => { isMounted = false; };
  }, []);

  /**
   * Maps backend analysis response format to frontend UI requirements.
   */
  const formatBackendResult = (backendData, customFilename, customCode) => {
    const issues = (backendData.issues || []).map((issue, idx) => ({
      ...issue,
      id: issue.id || `ISSUE-${idx + 1}`,
      // Normalize suggested fix for diff viewer
      suggestedFix: issue.correctedCode || issue.recommendedSolution || issue.suggestedFix,
      recommendedSolution: issue.recommendedSolution || issue.suggestedFix,
      correctedCode: issue.correctedCode
    }));

    const criticalCount = backendData.summary?.critical ?? issues.filter(i => i.severity === 'critical').length;
    const warningCount = backendData.summary?.warning ?? issues.filter(i => i.severity === 'warning').length;
    const suggestionCount = backendData.summary?.suggestion ?? issues.filter(i => i.severity === 'suggestion' || i.severity === 'info').length;

    return {
      id: backendData.id,
      code: backendData.code || customCode || '',
      title: backendData.filename || customFilename || `${backendData.language || 'javascript'}-source.js`,
      target: backendData.filename || customFilename || 'source.js',
      repo: 'active-workspace',
      branch: 'current-patch',
      author: 'developer',
      language: (backendData.language || 'javascript').charAt(0).toUpperCase() + (backendData.language || 'javascript').slice(1),
      qualityScore: backendData.qualityScore ?? 100,
      grade: backendData.grade || 'A+',
      verdict: backendData.verdict || 'Passed Quality Gate',
      duration: backendData.duration || '0.42s',
      linesScanned: backendData.linesScanned || (customCode ? customCode.split('\n').length : 0),
      timestamp: 'Just now',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      scoreBreakdown: backendData.scoreBreakdown,
      summary: {
        critical: criticalCount,
        warning: warningCount,
        info: suggestionCount,
        suggestion: suggestionCount,
        total: criticalCount + warningCount + suggestionCount
      },
      criticalIssues: backendData.criticalIssues || issues.filter(i => i.severity === 'critical'),
      warnings: backendData.warnings || issues.filter(i => i.severity === 'warning'),
      suggestions: backendData.suggestions || issues.filter(i => i.severity === 'suggestion' || i.severity === 'info'),
      issues
    };
  };

  /**
   * Executes code analysis against the real backend POST /api/analyze endpoint.
   */
  const runAnalysis = async ({ code, language, filename }) => {
    if (isAnalyzing) return; // Prevent duplicate concurrent submissions

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const backendData = await analyzeCode({
        code,
        language: language || 'javascript',
        filename: filename || 'source.js'
      });

      const formatted = formatBackendResult(backendData, filename, code);
      setCurrentResult(formatted);
      setIsBackendOnline(true);

      // Refresh history list so the new scan appears in the history audit
      refreshHistory();

      return formatted;
    } catch (err) {
      setAnalysisError(err.message || 'An error occurred during code analysis.');
      setIsBackendOnline(false);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Retrieves full analysis record by ID from the backend GET /api/history/:id endpoint.
   */
  const selectResultById = async (id) => {
    try {
      const backendData = await fetchAnalysisById(id);
      if (backendData) {
        const formatted = formatBackendResult(backendData, backendData.filename, backendData.code);
        setCurrentResult(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn(`Could not fetch analysis ${id} from backend:`, err.message);
      // Fallback: check if row summary is already in state
      const existing = history.find(h => h.id === id);
      if (existing) {
        const fallback = formatBackendResult(existing, existing.filename);
        setCurrentResult(fallback);
        return fallback;
      }
    }
    return currentResult;
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('pr_sentinel_history');
    } catch {}
  };

  return (
    <AnalysisContext.Provider value={{
      history,
      currentResult,
      runAnalysis,
      selectResultById,
      refreshHistory,
      clearHistory,
      setCurrentResult,
      isAnalyzing,
      analysisError,
      isLoadingHistory,
      historyError,
      isBackendOnline
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
