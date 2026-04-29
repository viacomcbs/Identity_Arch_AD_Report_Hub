import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ThemeContext } from '../../App';
import ForestDomainSelector from '../common/ForestDomainSelector';
import './TopBar.css';

const TopBar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [windowsUser, setWindowsUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    axios.get('/api/system/current-user')
      .then(res => setWindowsUser(res.data))
      .catch(() => setWindowsUser({ username: 'Windows User' }));
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
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const displayName = windowsUser?.displayName || windowsUser?.username || 'Windows User';

  return (
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
        <button className="topbar-user-btn" onClick={() => setShowUserMenu(v => !v)}>
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
                <div className="topbar-dropdown-domain">{windowsUser?.domain || 'Windows Auth'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
