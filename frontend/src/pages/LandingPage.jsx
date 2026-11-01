import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Lock, 
  Cpu, 
  GitPullRequest, 
  AlertTriangle, 
  FileCheck
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: ShieldCheck,
      title: 'AST-Level Static Security',
      desc: 'Parses Abstract Syntax Trees to identify SQL injection, command execution, path traversals, and hardcoded credentials before deployment.'
    },
    {
      icon: GitPullRequest,
      title: 'Intelligent PR Quality Gates',
      desc: 'Automates pull request grading, enforces minimum quality scores, and blocks high-risk commits from reaching protected main branches.'
    },
    {
      icon: Lock,
      title: 'Secret & Token Shield',
      desc: 'Deep entropy and pattern detection flags exposed JWT keys, AWS secrets, private keys, and environment passwords.'
    },
    {
      icon: Cpu,
      title: 'Performance & Memory Leak Audits',
      desc: 'Uncovers uncleaned asynchronous timers, event listener leaks, unmemoized heavy calculations, and race conditions.'
    },
    {
      icon: Zap,
      title: 'Instant Sub-Second Feedback',
      desc: 'High-speed AST scanning engine processes thousands of lines in milliseconds without bogging down developer workflow.'
    },
    {
      icon: FileCheck,
      title: 'Actionable Automated Fixes',
      desc: 'Delivers concrete line-by-line diff solutions and code snippets ready to copy or push directly into PR review comments.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Connect or Paste Code',
      desc: 'Paste a patch diff, upload single or multi-language source files, or hook PR Sentinel to your GitHub Actions pipeline.'
    },
    {
      step: '02',
      title: 'Run Deep Heuristic Scan',
      desc: 'The AST engine analyzes control flow, security hazards, syntax compliance, and architectural smells across 140+ rules.'
    },
    {
      step: '03',
      title: 'Review Score & Actionable Fixes',
      desc: 'Get an instant quality score (Grade A-F), line-by-line severity breakdowns, and one-click copyable secure fixes.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-glow-backdrop"></div>

        <div className="hero-tagline-pill">
          <Zap size={14} />
          <span>Next-Gen Static Code Analysis & PR Quality Engine</span>
        </div>

        <h1 className="hero-title">
          Catch bugs <span className="hero-title-highlight">before they reach</span> production.
        </h1>

        <p className="hero-description">
          PR Sentinel inspects pull requests with AST-based security heuristics, performance leak detection, and automated quality grading. Deliver pristine code with complete confidence.
        </p>

        <div className="hero-cta-group">
          <button 
            onClick={() => navigate('/analyzer')} 
            className="btn btn-primary"
            style={{ padding: '12px 26px', fontSize: '15px' }}
          >
            <span>Start Free Analysis</span>
            <ArrowRight size={16} />
          </button>

          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-secondary"
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <span>Explore Live Dashboard</span>
          </button>
        </div>

        {/* Hero Interactive Code & Analysis Teaser Card */}
        <div className="hero-preview-wrapper glow-card">
          <div className="window-header">
            <div className="window-dots">
              <span className="window-dot dot-red"></span>
              <span className="window-dot dot-yellow"></span>
              <span className="window-dot dot-green"></span>
            </div>
            <div className="window-title">
              PR #1042 — authController.js (Automated Sentinel Review)
            </div>
            <div className="badge badge-critical" style={{ fontSize: '11px' }}>
              <AlertTriangle size={11} /> 1 Critical Found
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', background: '#090d15' }}>
            {/* Left: Code Diff */}
            <div style={{ padding: '20px', borderRight: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
              <div style={{ color: 'var(--text-dim)', marginBottom: '8px' }}>// authController.js: line 10-15</div>
              <div style={{ color: '#e2e8f0', opacity: 0.8 }}>  const &#123; username, password &#125; = req.body;</div>
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '4px 8px', borderRadius: '4px', margin: '6px 0', borderLeft: '3px solid #f43f5e' }}>
                - const query = "SELECT * FROM users WHERE user = '" + username + "'";
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 8px', borderRadius: '4px', margin: '6px 0', borderLeft: '3px solid #10b981' }}>
                + const query = "SELECT * FROM users WHERE user = $1";
              </div>
              <div style={{ color: '#e2e8f0', opacity: 0.8 }}>  const [rows] = await db.query(query, [username]);</div>
            </div>

            {/* Right: Sentinel Verdict */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-critical">Rule: security/sql-injection</span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Severity: CRITICAL</span>
              </div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>
                High-risk string concatenation detected in database query.
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                PR Sentinel flagged raw parameter interpolation and automatically prepared the parameterized SQL replacement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <div className="section-label">Enterprise Capabilities</div>
          <h2 className="section-title">Designed for Modern Engineering Rigor</h2>
          <p className="section-subtitle">
            Static analysis built with developer experience in mind. Zero configuration fatigue, pinpoint accuracy, and clear remediation guidance.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="feature-card glow-card">
                <div className="feature-icon-box">
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-section" style={{ background: 'rgba(12, 16, 26, 0.6)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="section-header">
          <div className="section-label">Workflow Automation</div>
          <h2 className="section-title">How PR Sentinel Works</h2>
          <p className="section-subtitle">
            From the initial developer commit to the merged pull request in three streamlined steps.
          </p>
        </div>

        <div className="how-it-works-grid">
          {steps.map((st, i) => (
            <div key={i} className="step-card glow-card">
              <span className="step-number">STEP {st.step}</span>
              <h3 className="step-title">{st.title}</h3>
              <p className="step-desc">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Launch CTA Banner */}
      <section className="landing-section" style={{ textAlign: 'center', padding: '90px 32px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
            Ready to upgrade your pull request quality?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Analyze your first repository patch or paste code directly into the interactive analyzer.
          </p>
          <button 
            onClick={() => navigate('/analyzer')}
            className="btn btn-primary"
            style={{ padding: '14px 32px', fontSize: '16px' }}
          >
            <span>Launch Code Analyzer Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};
