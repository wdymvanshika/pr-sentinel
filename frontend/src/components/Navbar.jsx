import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, GitBranch } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="landing-navbar">
      <Link to="/" className="brand-logo">
        <div className="brand-icon-wrapper">
          <ShieldCheck size={22} />
        </div>
        <span>PR Sentinel</span>
      </Link>

      <div className="landing-nav-links">
        <a href="#features" className="nav-link">Features</a>
        <a href="#how-it-works" className="nav-link">How It Works</a>
        <a href="#architecture" className="nav-link">AST Engine</a>
        <Link to="/history" className="nav-link">Analysis History</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 12px' }}
        >
          <GitBranch size={16} />
          <span>v1.0.0</span>
        </a>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-primary btn-sm"
        >
          <span>Launch Dashboard</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </nav>
  );
};
