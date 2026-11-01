import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="brand-logo" style={{ marginBottom: '16px' }}>
            <div className="brand-icon-wrapper">
              <ShieldCheck size={20} />
            </div>
            <span>PR Sentinel</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>
            Intelligent static analysis and automated Pull Request quality gating. Catch vulnerabilities, syntax hazards, and anti-patterns before merging to main.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul className="footer-links">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/analyzer">Code Analyzer</Link></li>
            <li><Link to="/results">Analysis Results</Link></li>
            <li><Link to="/history">Analysis History</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Rulesets</h4>
          <ul className="footer-links">
            <li><a href="#rules">OWASP Top 10</a></li>
            <li><a href="#rules">CWE/SANS 25</a></li>
            <li><a href="#rules">Memory Leak Detection</a></li>
            <li><a href="#rules">Secret & Token Guard</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Developers</h4>
          <ul className="footer-links">
            <li><a href="https://vite.dev" target="_blank" rel="noreferrer">Vite + React</a></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub Integration</a></li>
            <li><a href="#cli">CLI Reference</a></li>
            <li><a href="#status">Engine Status: 99.98%</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {CURRENT_YEAR} PR Sentinel. Phase 1 Frontend Implementation.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Crafted for high-velocity engineering teams</span>
        </div>
      </div>
    </footer>
  );
};
