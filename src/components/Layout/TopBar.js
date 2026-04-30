import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ThemeContext } from '../../App';
import ForestDomainSelector from '../common/ForestDomainSelector';
import './TopBar.css';

const TopBar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser]             = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    axios.get('/api/system/current-user')
      .then(res => setUser(res.data.data || res.data))
      .catch(() => setUser({ username: 'Windows User' }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const displayName = user?.displayName || user?.username || 'Windows User';

  const Field = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="tp-field">
        <span className="tp-field-label">{label}</span>
        <span className="tp-field-value">{value}</span>
      </div>
    );
  };

  return (
    <header className="topbar">
      <div className="topbar-forest">
        <ForestDomainSelector />
      </div>

      <div className="topbar-divider" />

      <button className="topbar-theme-btn" onClick={toggleTheme} title="Toggle theme">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* User button + profile panel */}
      <div className="topbar-user" ref={profileRef}>
        <button className="topbar-user-btn" onClick={() => setShowProfile(v => !v)}>
          <span className="topbar-avatar">{getInitials(displayName)}</span>
          <span className="topbar-user-name">{displayName}</span>
          <span className="topbar-chevron">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {showProfile && user && (
          <div className="tp-panel">

            {/* Header */}
            <div className="tp-panel-header">
              {user.photo
                ? <img className="tp-avatar-photo" src={`data:image/jpeg;base64,${user.photo}`} alt={displayName} />
                : <div className="tp-avatar-lg">{getInitials(displayName)}</div>
              }
              <div className="tp-panel-identity">
                <div className="tp-panel-name">{displayName}</div>
                {user.title      && <div className="tp-panel-title">{user.title}</div>}
                {user.department && <div className="tp-panel-dept">{user.department}</div>}
                {user.company    && <div className="tp-panel-dept">{user.company}</div>}
              </div>
              {user.enabled !== undefined && (
                <span className={`tp-status-badge ${user.enabled ? 'enabled' : 'disabled'}`}>
                  {user.enabled ? 'Active' : 'Disabled'}
                </span>
              )}
            </div>

            <div className="tp-panel-body">

              {/* Account */}
              <div className="tp-section">
                <div className="tp-section-label">Account</div>
                <Field label="Full Name"    value={user.fullName} />
                <Field label="SAM Account" value={user.username} />
                <Field label="UPN"         value={user.upn} />
                <Field label="Email"       value={user.email} />
                <Field label="Domain"      value={user.domainDns || user.domain} />
                <Field label="Employee ID" value={user.employeeId} />
                <Field label="Manager"     value={user.manager} />
                <Field label="Company"     value={user.company} />
              </div>

              {/* Contact & Location */}
              <div className="tp-section">
                <div className="tp-section-label">Contact &amp; Location</div>
                <Field label="Office"      value={user.office} />
                <Field label="Phone"       value={user.phone} />
                <Field label="Mobile"      value={user.mobile} />
                <Field label="Address"     value={user.address} />
                {(user.city || user.state || user.postalCode || user.country) && (
                  <Field label="Location"
                    value={[user.city, user.state, user.postalCode, user.country].filter(Boolean).join(', ')} />
                )}
              </div>

              {/* Device & Session */}
              <div className="tp-section">
                <div className="tp-section-label">Device &amp; Session</div>
                <Field label="Computer"    value={user.computer} />
                <Field label="OS"          value={user.computerOS} />
                <Field label="Logon Server" value={user.logonServer} />
                <Field label="Last Logon"  value={user.lastLogon} />
                <Field label="Pwd Last Set" value={user.passwordLastSet} />
              </div>

            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
