import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import FavoritesPanel from './FavoritesPanel';
import { useApp } from '../../context/AppContext';

const SearchIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const ArrowIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CATEGORIES = [
  {
    id: 'identity',
    label: 'Identity',
    items: [
      { label: 'Users',             path: '/users' },
      { label: 'Service Accounts',  path: '/service-accounts' },
      { label: 'Contractors',       path: '/users' },
      { label: 'Disabled Accounts', path: '/users' },
      { label: 'All Accounts',      path: '/users' },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    items: [
      { label: 'Domain Controllers', path: '/domain-controllers' },
      { label: 'Sites & Subnets',    path: '/sites-subnets' },
      { label: 'Replication Status', path: '/sites-subnets' },
      { label: 'AD Topology',        path: '/topology' },
      { label: 'FSMO Roles',         path: '/topology' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    items: [
      { label: 'Stale Accounts',      path: '/compliance' },
      { label: 'Privileged Groups',   path: '/compliance' },
      { label: 'SID History',         path: '/compliance' },
      { label: 'Kerberos Delegation', path: '/compliance' },
      { label: 'AdminSDHolder',       path: '/compliance' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { label: 'Password Policy',     path: '/governance' },
      { label: 'No Manager',          path: '/governance' },
      { label: 'Service Accounts',    path: '/governance' },
      { label: 'Group Policy',        path: '/gpos' },
      { label: 'OU Structure',        path: '/containers' },
    ],
  },
];

const STATIC_DC_COUNTS = { 'ad.viacom.com': 238, 'ad.cbs.net': 60 };

const BASE_STATS = [
  { value: '2',   label: 'Forests' },
  { key: 'dcs',  value: null, label: 'Domain Controllers' },
  { value: '10',  label: 'Domains' },
  { value: '92',  label: 'AD Sites' },
  { value: '30+', label: 'Reports' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [query, setQuery]     = useState('');
  const [dcCounts, setDcCounts] = useState(STATIC_DC_COUNTS);
  const { forestData } = useApp();
  const forests = forestData?.forests || [];

  useEffect(() => {
    if (!forests.length) return;
    Promise.all(
      forests.map(f =>
        fetch(`/api/domain-controllers/count?domain=${encodeURIComponent(f.root)}`)
          .then(r => r.json())
          .then(d => ({ root: f.root, count: typeof d.count === 'number' && d.count > 0 ? d.count : null }))
          .catch(() => ({ root: f.root, count: null }))
      )
    ).then(results => {
      setDcCounts(prev => {
        const next = { ...prev };
        results.forEach(r => { if (r.count !== null) next[r.root] = r.count; });
        return next;
      });
    });
  }, [forests.length]); // eslint-disable-line

  const totalDCs = Object.values(dcCounts).reduce((sum, v) => sum + (v || 0), 0);
  const stats = BASE_STATS.map(s => s.key === 'dcs' ? { ...s, value: String(totalDCs || '—') } : s);

  const handleSearch = e => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  return (
    <div className="db">

      {/* ── Header ── */}
      <div className="db-header">
        <div className="db-header-top">
          <div className="db-wordmark">
            <h1 className="db-title">AD Report Hub</h1>
            <p className="db-subtitle">Active Directory reporting &amp; governance &nbsp;·&nbsp; Paramount Global</p>
          </div>
          <div className="db-meta-stats">
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="db-meta-sep" />}
                <span className="db-meta-val">{s.value}</span>
                <span className="db-meta-lbl">{s.label}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <form className="db-search" onSubmit={handleSearch}>
          <span className="db-search-icon"><SearchIcon /></span>
          <input
            className="db-search-input"
            type="text"
            placeholder="Search users, groups, computers, OUs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="db-search-kbd">Ctrl K</kbd>
        </form>
      </div>

      {/* ── Quick access grid ── */}
      <div className="db-grid">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className={`db-col db-col--${cat.id}`}>
            <div className="db-col-header">
              <span className="db-col-label">{cat.label}</span>
            </div>
            <ul className="db-col-list">
              {cat.items.map(item => (
                <li key={item.label}>
                  <button className="db-item" onClick={() => navigate(item.path)}>
                    <span className="db-item-label">{item.label}</span>
                    <span className="db-item-arrow"><ArrowIcon /></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Favorites ── */}
      <FavoritesPanel />

    </div>
  );
};

export default Dashboard;
