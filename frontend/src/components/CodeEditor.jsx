import React, { useRef } from 'react';
import { 
  Trash2, 
  Play, 
  Upload, 
  FileCode, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { SAMPLE_SNIPPETS } from '../data/sampleSnippets';

export const CodeEditor = ({
  code,
  setCode,
  language,
  setLanguage,
  filename,
  setFilename,
  onAnalyze,
  onClear,
  isAnalyzing = false
}) => {
  const fileInputRef = useRef(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  const handleSnippetSelect = (e) => {
    const key = e.target.value;
    if (key && SAMPLE_SNIPPETS[key]) {
      const snippet = SAMPLE_SNIPPETS[key];
      setCode(snippet.code);
      setLanguage(snippet.language);
      setFilename(snippet.filename);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    // Infer language from extension
    if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) setLanguage('javascript');
    else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) setLanguage('typescript');
    else if (file.name.endsWith('.py')) setLanguage('python');
    else if (file.name.endsWith('.go')) setLanguage('go');
    else if (file.name.endsWith('.rs')) setLanguage('rust');
    else if (file.name.endsWith('.java')) setLanguage('java');

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="editor-card glow-card">
      {/* Top Toolbar */}
      <div className="editor-toolbar">
        <div className="editor-toolbar-group">
          <FileCode size={18} style={{ color: 'var(--accent-blue)' }} />
          <input 
            type="text" 
            value={filename} 
            onChange={(e) => setFilename(e.target.value)} 
            placeholder="filename.js"
            className="editor-select"
            style={{ width: '180px', padding: '6px 10px' }}
          />

          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            className="editor-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="editor-toolbar-group">
          <select 
            onChange={handleSnippetSelect} 
            defaultValue="" 
            className="editor-select"
            style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
          >
            <option value="" disabled>Load Example Vulnerability...</option>
            {Object.entries(SAMPLE_SNIPPETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.name}
              </option>
            ))}
          </select>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            accept=".js,.jsx,.ts,.tsx,.py,.go,.rs,.java,.json,.txt"
          />

          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
            title="Upload source file"
          >
            <Upload size={14} />
            <span>Upload</span>
          </button>

          <button 
            type="button" 
            onClick={onClear}
            className="btn btn-secondary btn-sm"
            title="Clear code"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>

          <button 
            type="button" 
            onClick={onAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="btn btn-primary btn-sm"
            style={{ minWidth: '130px' }}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Analyse Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div className="editor-body">
        <div className="editor-line-numbers">
          {Array.from({ length: Math.max(lineCount, 15) }).map((_, i) => (
            <div key={i} className="editor-line-number">
              {i + 1}
            </div>
          ))}
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your pull request code, git diff, or upload a source file..."
          className="editor-textarea"
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="editor-statusbar">
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Lines: {lineCount}</span>
          <span>Characters: {code.length}</span>
          <span>Language: {language}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} style={{ color: '#34d399' }} />
          <span>AST Heuristic Engine Ready</span>
        </div>
      </div>
    </div>
  );
};
