import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Code2, 
  FileCheck2, 
  History, 
  Home,
  ExternalLink
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  return (
    <aside className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="brand-logo" onClick={() => setIsMobileOpen?.(false)}>
          <div className="brand-icon-wrapper">
            <ShieldCheck size={20} />
          </div>
          <span>PR Sentinel</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileOpen?.(false)}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/analyzer" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileOpen?.(false)}
        >
          <Code2 size={18} />
          <span>Code Analyzer</span>
        </NavLink>

        <NavLink 
          to="/results" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileOpen?.(false)}
        >
          <FileCheck2 size={18} />
          <span>Analysis Results</span>
        </NavLink>

        <NavLink 
          to="/history" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileOpen?.(false)}
        >
          <History size={18} />
          <span>Analysis History</span>
        </NavLink>

        <div className="sidebar-section-title" style={{ marginTop: '16px' }}>External & Docs</div>

        <Link to="/" className="sidebar-link" onClick={() => setIsMobileOpen?.(false)}>
          <Home size={18} />
          <span>Landing Page</span>
        </Link>

        <a 
          href="https://owasp.org/www-project-top-ten/" 
          target="_blank" 
          rel="noreferrer" 
          className="sidebar-link"
        >
          <ExternalLink size={18} />
          <span>OWASP Ruleset</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <div className="pulse-dot"></div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff' }}>AST Engine Online</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ruleset v2.4 (Active)</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
