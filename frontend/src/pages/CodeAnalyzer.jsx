import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sliders, 
  ShieldCheck, 
  RefreshCw,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { SAMPLE_SNIPPETS } from '../data/sampleSnippets';
import { useAnalysis } from '../context/AnalysisContext';

export const CodeAnalyzer = () => {
  const navigate = useNavigate();
  const { runAnalysis, isAnalyzing, isBackendOnline } = useAnalysis();

  const [code, setCode] = useState(SAMPLE_SNIPPETS.javascript_sql.code);
  const [language, setLanguage] = useState(SAMPLE_SNIPPETS.javascript_sql.language);
  const [filename, setFilename] = useState(SAMPLE_SNIPPETS.javascript_sql.filename);
  const [errorMessage, setErrorMessage] = useState(null);

  // Ruleset configuration toggles
  const [rules, setRules] = useState({
    securityOwasp: true,
    hardcodedSecrets: true,
    divisionByZero: true,
    looseEquality: true,
    consoleLog: true,
    evalDetection: true,
    unreachableCode: true,
    unusedVariables: true
  });

  const toggleRule = (key) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnalyze = async () => {
    setErrorMessage(null);

    // Validation: Empty source code
    if (!code || !code.trim()) {
      setErrorMessage('Please enter or paste source code before running the analyzer.');
      return;
    }

    // Validation: Language support
    const normalizedLang = language.toLowerCase();
    if (normalizedLang !== 'javascript' && normalizedLang !== 'js') {
      setErrorMessage(
        `Language "${language}" is not yet supported by the Phase 1 static engine. Please select "JavaScript" to run real AST static analysis.`
      );
      return;
    }

    try {
      await runAnalysis({ code, language, filename });
      navigate('/results');
    } catch (err) {
      // Do not navigate to results if the analysis failed
      setErrorMessage(
        err.message || 'Failed to complete static code analysis. Please check that the backend server is running.'
      );
    }
  };

  const handleClear = () => {
    setCode('');
    setFilename('untitled.js');
    setErrorMessage(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Page Title & Guidance */}
      <div className="dashboard-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="dashboard-title">Static Code Analyzer</h1>
          <p className="dashboard-subtitle">
            Inspect source code fragments, PR diffs, or entire files against AST static rulesets on the backend engine.
          </p>
        </div>
      </div>

      {/* Backend Offline Warning Banner */}
      {!isBackendOnline && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fb7185'
        }}>
          <WifiOff size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px' }}>
            <strong>Backend Unreachable:</strong> PR Sentinel backend is not responding at <code>http://localhost:5000</code>. Please start the backend with <code>npm start</code> in the <code>backend</code> directory.
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fbbf24'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', flex: 1 }}>
            {errorMessage}
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Analysis Progress Bar */}
      {isAnalyzing && (
        <div style={{
          marginBottom: '20px',
          padding: '16px 20px',
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.15))',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              Dispatching AST Static Analysis to Node.js Backend...
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: '2px', animation: 'pulseAnimation 1s infinite' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Analyzer Grid */}
      <div className="analyzer-container">
        {/* Left Column: Code Editor */}
        <div>
          <CodeEditor 
            code={code}
            setCode={(val) => {
              setCode(val);
              if (errorMessage) setErrorMessage(null);
            }}
            language={language}
            setLanguage={setLanguage}
            filename={filename}
            setFilename={setFilename}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isAnalyzing={isAnalyzing}
          />

          {/* Quick example snippets pills */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
              Quick Templates:
            </span>
            {Object.entries(SAMPLE_SNIPPETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setCode(item.code);
                  setLanguage(item.language);
                  setFilename(item.filename);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {item.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Ruleset Configuration & Engine Info */}
        <div className="analyzer-sidebar">
          {/* Ruleset Inspector Card */}
          <div className="dashboard-card glow-card">
            <div className="card-header-row" style={{ marginBottom: '14px' }}>
              <div className="card-title">
                <Sliders size={16} style={{ color: 'var(--accent-blue)' }} />
                <span>Backend AST Rulesets</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Active static checks evaluated by Espree on the Express server:
            </p>

            <div className="ruleset-list">
              <label className="ruleset-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>eval() & RCE Detection</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>security/detect-eval</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={rules.evalDetection} 
                  onChange={() => toggleRule('evalDetection')}
                  className="ruleset-checkbox"
                />
              </label>

              <label className="ruleset-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Secret & Token Leak Guard</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>security/hardcoded-credentials</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={rules.hardcodedSecrets} 
                  onChange={() => toggleRule('hardcodedSecrets')}
                  className="ruleset-checkbox"
                />
              </label>

              <label className="ruleset-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Division by Zero Check</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>correctness/division-by-zero</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={rules.divisionByZero} 
                  onChange={() => toggleRule('divisionByZero')}
                  className="ruleset-checkbox"
                />
              </label>

              <label className="ruleset-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Loose Equality (== / !=)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>best-practice/no-loose-equality</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={rules.looseEquality} 
                  onChange={() => toggleRule('looseEquality')}
                  className="ruleset-checkbox"
                />
              </label>

              <label className="ruleset-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Unreachable Code Detection</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>correctness/unreachable-code</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={rules.unreachableCode} 
                  onChange={() => toggleRule('unreachableCode')}
                  className="ruleset-checkbox"
                />
              </label>

              <label className="ruleset-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Console Log Usage</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>observability/console-log</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={rules.consoleLog} 
                  onChange={() => toggleRule('consoleLog')}
                  className="ruleset-checkbox"
                />
              </label>

              <label className="ruleset-item">
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Unused Variables</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>quality/unused-variable</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={rules.unusedVariables} 
                  onChange={() => toggleRule('unusedVariables')}
                  className="ruleset-checkbox"
                />
              </label>
            </div>
          </div>

          {/* Engine Specs Box */}
          <div className="dashboard-card glow-card" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-violet)' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Express Backend Connected</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Static analysis requests are processed by the real Node.js AST service at <code>http://localhost:5000/api/analyze</code> and persisted to SQLite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
