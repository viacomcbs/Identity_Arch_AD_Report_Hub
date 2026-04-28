import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../../App';
import axios from 'axios';
import ForestDomainSelector from '../common/ForestDomainSelector';
import './TopBar.css';

const TopBar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/system/current-user');
        const raw = response?.data?.data;
        const normalized = Array.isArray(raw) ? raw[0] : raw;
        if (normalized && typeof normalized === 'object') {
          setUserInfo(normalized);
        } else {
          setUserInfo({ username: 'Unknown User', domain: 'Unknown Domain', displayName: 'User' });
        }
      } catch {
        setUserInfo({ username: 'Unknown User', domain: 'Unknown Domain', displayName: 'User' });
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleCloseApp = async () => {
    if (window.confirm('Are you sure you want to close the application?')) {
      try {
        await axios.post('/api/system/shutdown');
        window.close();
        setTimeout(() => {
          document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0a1929;color:white;font-family:Arial,sans-serif;flex-direction:column;"><h1>Application Closed</h1><p>You can safely close this browser tab.</p></div>';
        }, 500);
      } catch {
        window.close();
      }
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await axios.post('/api/system/shutdown');
        window.close();
        setTimeout(() => {
          document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0a1929;color:white;font-family:Arial,sans-serif;flex-direction:column;"><h1>Signed Out</h1><p>You can safely close this browser tab.</p></div>';
        }, 500);
      } catch {
        window.close();
      }
    }
  };

  const displayName = userInfo?.displayName || userInfo?.username || 'User';

  return (
    <>
      <header className="topbar">
        {/* Forest selector */}
        <div className="topbar-forest">
          <ForestDomainSelector />
        </div>

        <div className="topbar-divider" />

        {/* Theme toggle */}
        <button className="topbar-theme-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User menu */}
        <div className="topbar-user" ref={userMenuRef}>
          <button className="topbar-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            <span className="topbar-avatar">{getInitials(displayName)}</span>
            <span className="topbar-user-name">{displayName}</span>
            <span className="topbar-chevron">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>

          {showUserMenu && (
            <div className="topbar-user-dropdown">
              <div className="topbar-dropdown-header">
                <span className="topbar-avatar-lg">{getInitials(displayName)}</span>
                <div>
                  <div className="topbar-dropdown-name">{displayName}</div>
                  <div className="topbar-dropdown-domain">{userInfo?.domain}</div>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item" onClick={() => { setShowUserDetails(true); setShowUserMenu(false); }}>
                <span>👤</span> User Info
              </button>
              <button className="topbar-dropdown-item" onClick={handleSignOut}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Close app */}
        <button className="topbar-close-btn" onClick={handleCloseApp} title="Close application">✕</button>
      </header>

      {/* User Details Modal */}
      {showUserDetails && userInfo && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="modal user-details-modal user-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Profile</h3>
              <button className="modal-close" onClick={() => setShowUserDetails(false)} aria-label="Close user details">×</button>
            </div>
            <div className="modal-body user-profile-body">
              <div className="profile-header">
                <div className="profile-avatar">{getInitials(userInfo.displayName || userInfo.username)}</div>
                <div className="profile-header-info">
                  <h2 className="profile-name">{userInfo.displayName || userInfo.username}</h2>
                  <p className="profile-title">{userInfo.title || 'No title'}</p>
                  <p className="profile-email">{userInfo.email || userInfo.upn || 'No email'}</p>
                </div>
                <div className="profile-status">
                  <span className={`status-badge ${userInfo.enabled ? 'enabled' : 'disabled'}`}>
                    {userInfo.enabled ? '● Active' : '○ Disabled'}
                  </span>
                  {userInfo.lockedOut && <span className="status-badge locked">🔒 Locked</span>}
                </div>
              </div>

              <div className="profile-sections">
                <div className="profile-section">
                  <h4 className="section-title">👤 Basic Information</h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="field-label">Username</span>
                      <span className="field-value">{userInfo.username}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Domain</span>
                      <span className="field-value">{userInfo.domain}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">First Name</span>
                      <span className="field-value">{userInfo.firstName || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Last Name</span>
                      <span className="field-value">{userInfo.lastName || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Employee ID</span>
                      <span className="field-value">{userInfo.employeeId || 'N/A'}</span>
                    </div>
                    <div className="profile-field full-width">
                      <span className="field-label">Description</span>
                      <span className="field-value">{userInfo.description || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4 className="section-title">💼 Organization</h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="field-label">Title</span>
                      <span className="field-value">{userInfo.title || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Department</span>
                      <span className="field-value">{userInfo.department || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Company</span>
                      <span className="field-value">{userInfo.company || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Manager</span>
                      <span className="field-value">{userInfo.manager || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4 className="section-title">📞 Contact</h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="field-label">Email</span>
                      <span className="field-value">{userInfo.email || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Phone</span>
                      <span className="field-value">{userInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Mobile</span>
                      <span className="field-value">{userInfo.mobile || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Office</span>
                      <span className="field-value">{userInfo.office || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {(userInfo.city || userInfo.country || userInfo.address) && (
                  <div className="profile-section">
                    <h4 className="section-title">📍 Location</h4>
                    <div className="profile-grid">
                      <div className="profile-field full-width">
                        <span className="field-label">Address</span>
                        <span className="field-value">{userInfo.address || 'N/A'}</span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">City</span>
                        <span className="field-value">{userInfo.city || 'N/A'}</span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">State</span>
                        <span className="field-value">{userInfo.state || 'N/A'}</span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">Postal Code</span>
                        <span className="field-value">{userInfo.postalCode || 'N/A'}</span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">Country</span>
                        <span className="field-value">{userInfo.country || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="profile-section">
                  <h4 className="section-title">🔐 Account Details</h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="field-label">Domain</span>
                      <span className="field-value">{userInfo.domainDns || userInfo.domain || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Logon Server (DC)</span>
                      <span className="field-value">{userInfo.logonServer || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Group Memberships</span>
                      <span className="field-value">{userInfo.groupCount || 0} groups</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Account Created</span>
                      <span className="field-value">{userInfo.created || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Last Logon</span>
                      <span className="field-value">{userInfo.lastLogon || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Password Last Set</span>
                      <span className="field-value">{userInfo.passwordLastSet || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Account Expires</span>
                      <span className="field-value">{userInfo.accountExpires || 'Never'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">UPN</span>
                      <span className="field-value">{userInfo.upn || 'N/A'}</span>
                    </div>
                    <div className="profile-field full-width">
                      <span className="field-label">Distinguished Name</span>
                      <span className="field-value dn-value">{userInfo.distinguishedName || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4 className="section-title">💻 Computer Details</h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="field-label">Computer Name</span>
                      <span className="field-value">{userInfo.computer || 'N/A'}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Operating System</span>
                      <span className="field-value">{userInfo.computerOS || 'N/A'}</span>
                    </div>
                    <div className="profile-field full-width">
                      <span className="field-label">Computer DN</span>
                      <span className="field-value dn-value">{userInfo.computerDN || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
