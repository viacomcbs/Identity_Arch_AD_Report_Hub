import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

// AD Report Hub logos - using direct paths for compatibility
const adReportHubIcon = '/ad-report-hub-icon.svg';

// Custom colored SVG icons
const UserIcon = ({ color = '#F59E0B' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4"/>
    <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/>
  </svg>
);

const GroupIcon = ({ color = '#EA580C' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="8" r="3.5"/>
    <circle cx="16" cy="9" r="2.5"/>
    <path d="M9 13c-3.31 0-6 1.34-6 3v2h12v-2c0-1.66-2.69-3-6-3z"/>
    <path d="M16 13.5c-1.18 0-2.24.32-3 .82.93.6 1.5 1.38 1.5 2.18v1.5h6v-1.5c0-1.38-2.01-3-4.5-3z"/>
  </svg>
);

const Navbar = () => {
  const { isLoading, recentActivity, addRecentActivity, requestNavigation } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [tabAlerts] = useState({});
  const recentRef = useRef(null);

  const s = 16;
  const sw = "2";
  const lc = "round";
  const lj = "round";

  const tabIcons = {
    // Identity (filled style matching Users/Groups)
    '/users': <UserIcon />,
    '/groups': <GroupIcon />,
    '/service-accounts': <svg width={s} height={s} viewBox="0 0 24 24" fill="#6366f1" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="4"/><path d="M12 13c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/><path d="M19 3l-1.5 1.5M19 3l1.5 1.5M19 3v2.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
    '/contacts': <svg width={s} height={s} viewBox="0 0 24 24" fill="#0ea5e9" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="2" width="18" height="20" rx="2" fill="none" stroke="#0ea5e9" strokeWidth="2"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2.21 2.24-4 5-4s5 1.79 5 4"/></svg>,

    // Infrastructure (greens / teals / earth tones)
    '/domain-controllers': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1" fill="#dc2626"/><circle cx="6" cy="18" r="1" fill="#dc2626"/></svg>,
    '/computers': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    '/sites-subnets': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    '/topology': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></svg>,
    '/gpos': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    '/printers': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="1.8" strokeLinecap={lc} strokeLinejoin={lj}><path d="M6 9V2h12v7"/><rect x="2" y="9" width="20" height="8" rx="2"/><rect x="6" y="14" width="12" height="8" rx="1"/><circle cx="18" cy="13" r="1" fill="#0e7490"/></svg>,
    '/containers': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
    '/compliance': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    '/governance': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" stroke="#0e7490" strokeWidth="2"/></svg>,

    // Quick Links (purple / neutral tones)
    '/search': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    '/activity-logs': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    '/help': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    '/license': <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  };

  // Organized tabs - Identity reports
  const mainTabs = [
    { path: '/users', label: 'Users' },
    { path: '/groups', label: 'Groups' },
    { path: '/service-accounts', label: 'Service Accounts' },
    { path: '/contacts', label: 'Contacts' },
  ];

  // Infrastructure tabs - AD infrastructure reports
  const infraTabs = [
    { path: '/domain-controllers', label: 'Domain Controllers' },
    { path: '/computers', label: 'Computers' },
    { path: '/sites-subnets', label: 'Sites & Subnets' },
    { path: '/topology', label: 'AD Topology' },
    { path: '/gpos', label: 'Group Policy' },
    { path: '/containers', label: 'Containers' },
    { path: '/printers', label: 'Printers' },
  ];

  // Governance tabs
  const securityTabs = [
    { path: '/compliance', label: 'Compliance' },
    { path: '/governance', label: 'Governance' },
  ];

  // Quick links - utility/tool tabs
  const utilityTabs = [
    { path: '/search', label: 'Search' },
    { path: '/activity-logs', label: 'Activity Logs' },
    { path: '/help', label: 'Help' },
    { path: '/license', label: 'License' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (recentRef.current && !recentRef.current.contains(event.target)) {
        setShowRecentActivity(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track navigation for recent activity
  useEffect(() => {
    const allTabs = [...mainTabs, ...infraTabs, ...securityTabs, ...utilityTabs];
    const currentTab = allTabs.find(t => t.path === location.pathname);
    if (currentTab) {
      addRecentActivity({
        name: currentTab.label,
        path: currentTab.path,
        icon: tabIcons[currentTab.path] || '📄'
      });
    }
  }, [location.pathname]); // eslint-disable-line

  const handleNavClick = (e, path) => {
    if (isLoading) {
      e.preventDefault();
      const canNavigate = requestNavigation(path, () => {
        navigate(path);
      });
      if (!canNavigate) {
        return;
      }
    }
  };

  const handleRecentClick = (item) => {
    setShowRecentActivity(false);
    if (isLoading) {
      requestNavigation(item.path, () => {
        navigate(item.path);
      });
    } else {
      navigate(item.path);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <nav className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
        <img src={adReportHubIcon} className="sidebar-brand-icon" alt="AD Report Hub" />
        <span className="sidebar-brand-text">AD Report Hub</span>
      </div>

      {/* Nav scroll area */}
      <div className="sidebar-nav">
        {/* Home */}
        <div className="sidebar-group sidebar-group-home">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-item sidebar-home-item ${isActive ? 'active group-home' : ''}`}
            onClick={(e) => handleNavClick(e, '/dashboard')}
          >
            <span className="sidebar-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className="sidebar-item-label">Home</span>
          </NavLink>
        </div>

        {/* Identity group */}
        <div className="sidebar-group">
          <span className="sidebar-group-label" style={{ color: '#2563eb' }}>Identity</span>
          {mainTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} group-identity`}
              onClick={(e) => handleNavClick(e, tab.path)}
            >
              <span className="sidebar-item-icon">{tabIcons[tab.path]}</span>
              <span className="sidebar-item-label">{tab.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Infrastructure group */}
        <div className="sidebar-group">
          <span className="sidebar-group-label" style={{ color: '#059669' }}>Infrastructure</span>
          {infraTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} group-infra`}
              onClick={(e) => handleNavClick(e, tab.path)}
            >
              <span className="sidebar-item-icon">{tabIcons[tab.path]}</span>
              <span className="sidebar-item-label">{tab.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Governance group */}
        <div className="sidebar-group">
          <span className="sidebar-group-label" style={{ color: '#0e7490' }}>Governance</span>
          {securityTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} group-security`}
              onClick={(e) => handleNavClick(e, tab.path)}
            >
              <span className="sidebar-item-icon">{tabIcons[tab.path]}</span>
              <span className="sidebar-item-label">{tab.label}</span>
              {tabAlerts[tab.path] && (
                <span className={`tab-alert-dot alert-${tabAlerts[tab.path].level}`} title={`${tabAlerts[tab.path].count} issue(s) detected`}></span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Tools group */}
        <div className="sidebar-group">
          <span className="sidebar-group-label" style={{ color: '#64748b' }}>Tools</span>
          {utilityTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} group-utility`}
              onClick={(e) => handleNavClick(e, tab.path)}
            >
              <span className="sidebar-item-icon">{tabIcons[tab.path]}</span>
              <span className="sidebar-item-label">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Recent activity button */}
        <div className="sidebar-footer-row" ref={recentRef}>
          <button className="sidebar-recent-btn" onClick={() => setShowRecentActivity(!showRecentActivity)}>
            <span>🕐</span> <span>Recent</span>
          </button>
          {showRecentActivity && (
            <div className="recent-activity-panel">
              <div className="recent-activity-header">
                <h4>Recent Activity</h4>
              </div>
              <div className="recent-activity-list">
                {recentActivity.length === 0 ? (
                  <div className="recent-activity-empty">No recent activity</div>
                ) : (
                  recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="recent-activity-item"
                      onClick={() => handleRecentClick(item)}
                    >
                      <span className="recent-activity-icon">{item.icon}</span>
                      <div className="recent-activity-info">
                        <div className="recent-activity-name">{item.name}</div>
                        <div className="recent-activity-path">{item.path}</div>
                      </div>
                      <span className="recent-activity-time">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="sidebar-loading">
            <svg className="sidebar-hourglass" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2" />
            </svg>
            <span>Report running…</span>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
