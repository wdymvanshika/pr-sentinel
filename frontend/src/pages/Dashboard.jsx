import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck2, 
  AlertTriangle, 
  ShieldAlert, 
  Award, 
  ArrowRight, 
  Code2, 
  GitBranch
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { OVERVIEW_METRICS, QUALITY_TREND_DATA, ISSUES_BY_CATEGORY, RECENT_ANALYSES, RECENT_ACTIVITY } from '../data/sampleData';
import { useAnalysis } from '../context/AnalysisContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { history, selectResultById } = useAnalysis();

  // Use combined history or recent sample analyses
  const displayAnalyses = history.length > 0 ? history.slice(0, 5) : RECENT_ANALYSES.slice(0, 5);

  const handleViewReport = async (id) => {
    try {
      await selectResultById(id);
      navigate('/results');
    } catch {
      navigate('/results');
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 90) return 'badge-success';
    if (score >= 75) return 'badge-warning';
    return 'badge-critical';
  };

  return (
    <div className="animate-fade-in">
      {/* Header Row */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-title">Engineering Quality Hub</h1>
          <p className="dashboard-subtitle">
            Real-time static analysis insights, pull request health metrics, and vulnerability alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/analyzer')}
            className="btn btn-primary"
          >
            <Code2 size={16} />
            <span>Analyse Code</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="metrics-grid">
        <MetricCard 
          label="Total Analyses"
          value={OVERVIEW_METRICS.totalAnalyses.value}
          change={OVERVIEW_METRICS.totalAnalyses.change}
          trend={OVERVIEW_METRICS.totalAnalyses.trend}
          subtitle={OVERVIEW_METRICS.totalAnalyses.subtitle}
          icon={FileCheck2}
          iconColor="#38bdf8"
          iconBg="rgba(56, 189, 248, 0.12)"
        />

        <MetricCard 
          label="Issues Detected"
          value={OVERVIEW_METRICS.issuesDetected.value}
          change={OVERVIEW_METRICS.issuesDetected.change}
          trend={OVERVIEW_METRICS.issuesDetected.trend}
          subtitle={OVERVIEW_METRICS.issuesDetected.subtitle}
          icon={AlertTriangle}
          iconColor="#f59e0b"
          iconBg="rgba(245, 158, 11, 0.12)"
        />

        <MetricCard 
          label="Security Warnings"
          value={OVERVIEW_METRICS.securityWarnings.value}
          change={OVERVIEW_METRICS.securityWarnings.change}
          trend={OVERVIEW_METRICS.securityWarnings.trend}
          subtitle={OVERVIEW_METRICS.securityWarnings.subtitle}
          icon={ShieldAlert}
          iconColor="#fb7185"
          iconBg="rgba(244, 63, 94, 0.12)"
        />

        <MetricCard 
          label="Average Quality Score"
          value={OVERVIEW_METRICS.averageQualityScore.value}
          change={OVERVIEW_METRICS.averageQualityScore.change}
          trend={OVERVIEW_METRICS.averageQualityScore.trend}
          subtitle={OVERVIEW_METRICS.averageQualityScore.subtitle}
          icon={Award}
          iconColor="#34d399"
          iconBg="rgba(16, 185, 129, 0.12)"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="analytics-grid">
        {/* Main Quality Trend Area Chart */}
        <div className="dashboard-card glow-card">
          <div className="card-header-row">
            <div>
              <div className="card-title">
                <span>Code Quality Score Trend (14 Days)</span>
              </div>
              <div className="card-subtitle">
                Aggregate score progression calculated across active PR branches
              </div>
            </div>
            <span className="badge badge-success">+4.1% This Cycle</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={QUALITY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-dim)" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[60, 100]} 
                  stroke="var(--text-dim)" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111726', 
                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                  }} 
                  formatter={(val) => [`${val} / 100`, 'Quality Score']}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#scoreGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issues by Category Bar Chart */}
        <div className="dashboard-card glow-card">
          <div className="card-header-row">
            <div>
              <div className="card-title">
                <span>Issues by Category</span>
              </div>
              <div className="card-subtitle">
                Distribution across 140+ AST rules
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ISSUES_BY_CATEGORY} layout="vertical" margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-dim)" fontSize={11} tickLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  width={90}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111726', 
                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {ISSUES_BY_CATEGORY.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Analyses & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Analysis Table */}
        <div className="dashboard-card glow-card">
          <div className="card-header-row">
            <div>
              <div className="card-title">
                <span>Recent Analysis Runs</span>
              </div>
              <div className="card-subtitle">
                Latest pull request reviews and static scan executions
              </div>
            </div>
            <button 
              onClick={() => navigate('/history')}
              className="btn btn-secondary btn-sm"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pull Request / Target</th>
                  <th>Language</th>
                  <th>Quality Score</th>
                  <th>Issues</th>
                  <th>Scanned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayAnalyses.map((item) => {
                  const score = item.qualityScore ?? item.score ?? 100;
                  const grade = item.grade || (score >= 90 ? 'A' : score >= 80 ? 'B' : 'C');
                  const critical = item.summary?.critical ?? item.critical ?? 0;
                  const warnings = item.summary?.warning ?? item.warnings ?? 0;
                  const timeDisplay = item.createdAt 
                    ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : item.timestamp || 'Recent';

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="repo-cell">
                          <span className="repo-title">
                            <GitBranch size={13} style={{ color: 'var(--accent-blue)' }} />
                            {item.filename || item.title || item.id}
                          </span>
                          <span className="repo-meta">
                            {item.repo || 'active-workspace'} • {item.branch || 'main'}
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
                          {critical === 0 && warnings === 0 && (
                            <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '10px' }}>
                              clean
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {timeDisplay}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleViewReport(item.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="dashboard-card glow-card">
          <div className="card-header-row">
            <div>
              <div className="card-title">
                <span>Recent Activity</span>
              </div>
              <div className="card-subtitle">
                Live automated pipeline stream
              </div>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Live</span>
          </div>

          <div className="activity-feed-list">
            {RECENT_ACTIVITY.map((act) => {
              const badgeClass = act.badgeType === 'critical' ? 'badge-critical' :
                                act.badgeType === 'warning' ? 'badge-warning' :
                                act.badgeType === 'success' ? 'badge-success' : 'badge-info';
              return (
                <div key={act.id} className="activity-item">
                  <div className="activity-info">
                    <div className="activity-title-row">
                      <span className="activity-title">{act.title}</span>
                      <span className="activity-time">{act.time}</span>
                    </div>
                    <p className="activity-desc">{act.desc}</p>
                    <div style={{ marginTop: '8px' }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '10px', padding: '1px 7px' }}>
                        {act.badge}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
