import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter, 
  ArrowRight, 
  GitBranch, 
  Trash2, 
  Code2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export const AnalysisHistory = () => {
  const navigate = useNavigate();
  const { 
    history = [], 
    selectResultById, 
    clearHistory, 
    isLoadingHistory, 
    historyError, 
    refreshHistory 
  } = useAnalysis();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [loadingId, setLoadingId] = useState(null);

  const filteredHistory = history.filter((item) => {
    const titleStr = item.filename || item.title || item.id || '';
    const repoStr = item.repo || 'active-workspace';
    const branchStr = item.branch || 'main';
    const idStr = item.id || '';

    const matchesSearch = 
      titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repoStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branchStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idStr.toLowerCase().includes(searchTerm.toLowerCase());

    const itemLang = (item.language || 'javascript').toLowerCase();
    const matchesLang = 
      selectedLanguage === 'all' || 
      itemLang === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLang;
  });

  const handleViewReport = async (id) => {
    try {
      setLoadingId(id);
      await selectResultById(id);
      navigate('/results');
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const getScoreBadgeClass = (score = 100) => {
    if (score >= 90) return 'badge-success';
    if (score >= 75) return 'badge-warning';
    return 'badge-critical';
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-title">Analysis Audit History</h1>
          <p className="dashboard-subtitle">
            Complete record of automated static scans and PR reviews fetched from the SQLite database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={refreshHistory}
            disabled={isLoadingHistory}
            className="btn btn-secondary btn-sm"
            title="Refresh from server"
          >
            <RefreshCw size={14} className={isLoadingHistory ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={() => navigate('/analyzer')}
            className="btn btn-primary btn-sm"
          >
            <Code2 size={14} />
            <span>New Scan</span>
          </button>

          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="btn btn-danger btn-sm"
              title="Clear locally cached history"
            >
              <Trash2 size={14} />
              <span>Clear Cache</span>
            </button>
          )}
        </div>
      </div>

      {/* History Error Alert */}
      {historyError && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fb7185'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '13px' }}>{historyError}</span>
          </div>
          <button 
            onClick={refreshHistory}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="dashboard-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
            <div className="topbar-search" style={{ width: '100%' }}>
              <Search size={15} />
              <input 
                type="text" 
                placeholder="Filter by filename, PR title, or scan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={15} style={{ color: 'var(--text-dim)' }} />
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="editor-select"
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="dashboard-card glow-card">
        <div className="card-header-row">
          <div>
            <div className="card-title">
              <span>Historical Scan Records ({filteredHistory.length})</span>
            </div>
            <div className="card-subtitle">
              Persisted in SQLite database — Click "View Report" to load full AST issue breakdown
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingHistory ? (
          <div style={{ textAlign: 'center', padding: '56px 20px' }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--accent-blue)', margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading analysis records from backend...</div>
          </div>
        ) : filteredHistory.length === 0 ? (
          /* Empty State */
          <div style={{ textAlign: 'center', padding: '56px 20px' }}>
            <History size={40} style={{ color: 'var(--text-dim)', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '17px', color: '#fff', marginBottom: '6px' }}>No analysis records found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '400px', margin: '0 auto 20px' }}>
              {searchTerm 
                ? 'No recorded scans match your search query. Try clearing the filter.' 
                : 'You have not executed any static code scans yet. Run your first analysis in the Code Analyzer.'}
            </p>
            <button onClick={() => navigate('/analyzer')} className="btn btn-primary btn-sm">
              <Code2 size={14} />
              <span>Analyze Code Now</span>
            </button>
          </div>
        ) : (
          /* Table of Results */
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target / File</th>
                  <th>Language</th>
                  <th>Quality Score</th>
                  <th>Severity Breakdown</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const score = item.qualityScore ?? item.score ?? 100;
                  const grade = item.grade || (score >= 90 ? 'A' : score >= 80 ? 'B' : 'C');
                  const critical = item.summary?.critical ?? item.critical ?? 0;
                  const warnings = item.summary?.warning ?? item.warnings ?? 0;
                  const suggestions = item.summary?.suggestion ?? item.summary?.info ?? item.info ?? 0;
                  const formattedDate = item.createdAt 
                    ? new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : item.date || item.timestamp || 'Recent';

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="repo-cell">
                          <span className="repo-title">
                            <GitBranch size={13} style={{ color: 'var(--accent-blue)' }} />
                            {item.filename || item.title || item.id}
                          </span>
                          <span className="repo-meta">
                            {item.repo || 'active-workspace'} • ID: {item.id}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                          {item.language || 'JavaScript'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getScoreBadgeClass(score)}`}>
                          {score}/100 ({grade})
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {critical > 0 && (
                            <span className="badge badge-critical" style={{ padding: '2px 6px', fontSize: '10px' }}>
                              {critical} crit
                            </span>
                          )}
                          {warnings > 0 && (
                            <span className="badge badge-warning" style={{ padding: '2px 6px', fontSize: '10px' }}>
                              {warnings} warn
                            </span>
                          )}
                          {suggestions > 0 && (
                            <span className="badge badge-info" style={{ padding: '2px 6px', fontSize: '10px' }}>
                              {suggestions} sugg
                            </span>
                          )}
                          {critical === 0 && warnings === 0 && suggestions === 0 && (
                            <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '10px' }}>
                              clean
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formattedDate}
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleViewReport(item.id)}
                          disabled={loadingId === item.id}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 12px', fontSize: '11px' }}
                        >
                          {loadingId === item.id ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <span>View Report</span>
                              <ArrowRight size={12} />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
