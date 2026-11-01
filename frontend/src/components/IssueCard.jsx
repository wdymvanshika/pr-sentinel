import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Check, 
  Copy, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2
} from 'lucide-react';

export const IssueCard = ({ issue }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const getSeverityBadge = (severity = 'suggestion') => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <span className="badge badge-critical">
            <AlertCircle size={12} /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="badge badge-warning">
            <AlertTriangle size={12} /> Warning
          </span>
        );
      case 'suggestion':
      case 'info':
      default:
        return (
          <span className="badge badge-info">
            <Info size={12} /> Suggestion
          </span>
        );
    }
  };

  const codeToCopy = issue.correctedCode || issue.suggestedFix || issue.recommendedSolution;

  const handleCopyFix = () => {
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`issue-card severity-${issue.severity} glow-card`}>
      <div className="issue-header">
        <div style={{ flex: 1 }}>
          <div className="issue-title-group">
            {getSeverityBadge(issue.severity)}
            <span className="issue-rule-code">{issue.ruleId}</span>
            <span className="badge badge-neutral">Line {issue.line}:{issue.column || 1}</span>
            {issue.category && (
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 500 }}>
                • {issue.category}
              </span>
            )}
          </div>
          <h3 className="issue-title" style={{ marginTop: '10px' }}>
            {issue.title}
          </h3>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)} 
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 10px', color: 'var(--text-muted)' }}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="issue-desc">
        {issue.description}
      </div>

      {expanded && (
        <div className="animate-fade-in">
          {issue.impact && (
            <div style={{ margin: '0 24px 14px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
              <ShieldAlert size={16} style={{ color: issue.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fff' }}>Impact: </strong>
                {issue.impact}
              </div>
            </div>
          )}

          {issue.recommendedSolution && (
            <div style={{ margin: '0 24px 14px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fff' }}>Recommended Solution: </strong>
                {issue.recommendedSolution}
              </div>
            </div>
          )}

          {issue.codeSnippet && (
            <div className="code-diff-block">
              <div className="diff-header">
                <span>Problematic Code (Line {issue.line})</span>
                <span style={{ color: 'var(--status-critical)' }}>Violates rule {issue.ruleId}</span>
              </div>
              <div className="diff-offending">
                <code>{issue.codeSnippet}</code>
              </div>
            </div>
          )}

          {(issue.correctedCode || (issue.suggestedFix && issue.suggestedFix !== issue.recommendedSolution)) && (
            <div className="code-diff-block" style={{ marginTop: '12px' }}>
              <div className="diff-header">
                <span>Proposed Replacement Code</span>
                <button 
                  onClick={handleCopyFix}
                  className="btn btn-sm"
                  style={{ 
                    padding: '3px 8px', 
                    fontSize: '11px', 
                    background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: copied ? '#34d399' : 'var(--text-muted)'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="diff-suggested">
                <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
                  {issue.correctedCode || issue.suggestedFix}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
