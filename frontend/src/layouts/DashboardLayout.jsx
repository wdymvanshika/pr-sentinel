import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  Plus
} from 'lucide-react';

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'System Overview';
      case '/analyzer':
        return 'Interactive Code Analyzer';
      case '/results':
        return 'PR Review & Vulnerability Report';
      case '/history':
        return 'Analysis Audit History';
      default:
        return 'PR Sentinel';
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="dashboard-main-shell">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="topbar-icon-btn mobile-menu-btn"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              style={{ display: 'none' }} // Visible on mobile via CSS
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                {getPageTitle()}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                production-ci
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="topbar-search">
              <Search size={15} />
              <input 
                type="text" 
                placeholder="Search PR, repository, rule..." 
              />
            </div>

            <button 
              onClick={() => navigate('/analyzer')}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} />
              <span>New Analysis</span>
            </button>

            <button className="topbar-icon-btn" title="System Notifications">
              <Bell size={16} />
            </button>

            <div className="user-profile-badge">
              <div className="user-avatar">PR</div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Senior Dev</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
