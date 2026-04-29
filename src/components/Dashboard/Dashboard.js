import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import FavoritesPanel from './FavoritesPanel';
import { useApp } from '../../context/AppContext';

// ─── SVG icons ────────────────────────────────────────────────────────────────
const Icon = ({ d, d2, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

// ─── Real data from IAM Architecture — Confluence (CCE/74614900) ──────────────
const BASE_ENTERPRISE_STATS = [
  { key: 'forests',  value: '2',   label: 'AD Forests' },
  { key: 'dcs',      value: null,  label: 'Domain Controllers' },
  { key: 'domains',  value: '10',  label: 'AD Domains' },
  { key: 'sites',    value: '92',  label: 'AD Sites' },
  { key: 'reports',  value: '30+', label: 'Report types' },
];

const FOREST_META = {
  'ad.viacom.com': {
    color: '#1e40af',
    architecture: 'Single Forest, Multi-Domain',
    stats: [
      { key: 'dc', label: 'Domain Controllers', value: '238' },
      { label: 'AD Sites',           value: '61'  },
      { label: 'Domains',            value: '8'   },
      { label: 'Forest Mode',        value: 'WS 2016' },
    ],
    domains: [
      { role: 'Forest Root', fqdn: 'ad.viacom.com' },
      { role: 'Child',       fqdn: 'mtvn.ad.viacom.com' },
      { role: 'Child',       fqdn: 'corp.ad.viacom.com' },
      { role: 'Child',       fqdn: 'viacom_corp.ad.viacom.com' },
      { role: 'Child',       fqdn: 'paramount.ad.viacom.com' },
      { role: 'Child',       fqdn: 'playasur.ad.viacom.com' },
      { role: 'Child',       fqdn: 'mtvnasia.ad.viacom.com' },
      { role: 'Child',       fqdn: 'mtvne.ad.viacom.com' },
    ],
    note: 'Single forest, multi-domain architecture with one forest root and seven child domains. All domains share the ad.viacom.com namespace and are connected via automatic two-way transitive Kerberos trusts.',
  },
  'ad.cbs.net': {
    color: '#0369a1',
    architecture: 'Single Forest, Multi-Domain',
    stats: [
      { key: 'dc', label: 'Domain Controllers', value: '60' },
      { label: 'AD Sites',           value: '31' },
      { label: 'Domains',            value: '2'  },
      { label: 'Forest Mode',        value: 'WS 2016' },
    ],
    domains: [
      { role: 'Forest Root', fqdn: 'ad.cbs.net' },
      { role: 'Child',       fqdn: 'cbs.ad.cbs.net' },
    ],
    note: 'Single forest, multi-domain architecture with one forest root and one child domain. The child domain cbs.ad.cbs.net hosts the majority of user, workstation, and resource accounts.',
  },
};

const EXTENDED_FORESTS = [
  {
    name: 'AWS Managed AD',
    fqdn: 'awscloud.viacomcbs.com',
    color: '#b45309',
    icon: <Icon size={16} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10" />,
    desc: 'Dedicated resource forest hosted in AWS. Enables authentication for Amazon RDS and FSx services via one-way external trusts with the Viacom and CBS forests.',
  },
  {
    name: 'Network Ten AD',
    fqdn: 'networkten.com.au',
    color: '#047857',
    icon: <Icon size={16} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />,
    desc: 'Independent regional forest for the Australia region. Connected via bidirectional forest-level and domain-level trusts with both the Viacom and CBS forests.',
  },
];

const TRUST_GROUPS = [
  {
    color: '#1e40af',
    icon: <Icon size={18} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />,
    title: 'CBS ↔ Viacom',
    type: 'Bidirectional External Trusts',
    count: '7 trusts',
    detail: 'cbs.ad.cbs.net maintains individual bidirectional external trusts with each of the 7 Viacom child domains, scoped at child-domain level for precise authentication boundary control.',
  },
  {
    color: '#b45309',
    icon: <Icon size={18} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10" />,
    title: 'Enterprise ↔ AWS',
    type: 'One-Way External Trusts',
    count: '2 trusts',
    detail: 'awscloud.viacomcbs.com is the trusting (resource) forest. Viacom and CBS are the trusted (account) domains — allowing on-premises users to authenticate to AWS-hosted RDS and FSx without separate cloud accounts.',
  },
  {
    color: '#047857',
    icon: <Icon size={18} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />,
    title: 'Enterprise ↔ Network Ten',
    type: 'Bidirectional Forest + External Trusts',
    count: '6 trusts',
    detail: 'networkten.com.au is connected via a forest-level trust with Viacom AD plus explicit child-domain trusts for mtvn, corp, and paramount, plus a domain trust with cbs.ad.cbs.net.',
  },
];

const WHY_ITEMS = [
  {
    icon: <Icon size={20} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    color: '#1e40af',
    title: 'Real-time queries',
    desc: 'Every report hits Active Directory directly — no cached snapshots, no stale data. You always see the current live state of the environment.',
  },
  {
    icon: <Icon size={20} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />,
    color: '#0369a1',
    title: 'Cross-forest reporting',
    desc: 'Switch between CBS (ad.cbs.net) and Paramount (ad.viacom.com) with one click. Unified interface across both production forests.',
  },
  {
    icon: <Icon size={20} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    color: '#1e40af',
    title: 'Governance & compliance',
    desc: 'Surface AS-REP roastable accounts, unconstrained Kerberos delegation, AdminSDHolder anomalies, and orphaned identities in seconds.',
  },
  {
    icon: <Icon size={20} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" d2="M9 11a4 4 0 100-8 4 4 0 000 8z" />,
    color: '#047857',
    title: 'Identity lifecycle',
    desc: 'Track password hygiene, account expiry, inactive users, last logon data, and manager chains — critical for access reviews and audits.',
  },
  {
    icon: <Icon size={20} d="M4 4h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM4 14h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 012-2z" />,
    color: '#374151',
    title: 'Infrastructure visibility',
    desc: 'DC health, FSMO roles, replication topology, site links, and GPO inventory across all domain controllers and 92 AD sites.',
  },
  {
    icon: <Icon size={20} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h5" />,
    color: '#374151',
    title: 'Audit trail',
    desc: 'Every query is logged with timestamp, user context, and parameters. Full history in Activity Logs for compliance reviews.',
  },
];

// Build the static DC count map from FOREST_META so we always have a
// number to show from the very first render — no loading spinner needed.
const STATIC_DC_COUNTS = Object.fromEntries(
  Object.entries(FOREST_META).map(([root, meta]) => {
    const stat = meta.stats?.find(s => s.key === 'dc');
    return [root, stat ? parseInt(stat.value, 10) : 0];
  })
);

// ─── Component ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  // Pre-seed with known static values so the page shows numbers immediately
  const [dcCounts, setDcCounts] = useState(STATIC_DC_COUNTS);
  const { forestData, forestLoading } = useApp();

  const forests = forestData?.forests || [];

  // Fetch live DC counts from the server cache — returns instantly, updates
  // in the background if the server cache is stale. Replace our local state
  // only when the API returns a positive live count.
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

  const enterpriseStats = BASE_ENTERPRISE_STATS.map(s => {
    if (s.key === 'dcs') return { ...s, value: String(totalDCs || '—') };
    return s;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    else navigate('/search');
  };

  return (
    <div className="db">

      {/* ── Hero ───────────────────────────────────── */}
      <div className="db-hero">
        <div className="db-hero-inner">
          <div className="db-hero-eyebrow">
            <span className="db-badge">v2.3.0</span>
            <span className="db-badge db-badge-secondary">Internal Tool</span>
            <span className="db-badge db-badge-org">Paramount Global</span>
          </div>
          <h1 className="db-hero-title">AD Report Hub</h1>
          <p className="db-hero-sub">
            Active Directory reporting and governance platform for the Paramount enterprise.
            Real-time queries across identity, infrastructure, and compliance — CBS and Viacom forests.
          </p>
          <form className="db-search-form" onSubmit={handleSearch}>
            <div className="db-search-wrap">
              <span className="db-search-icon">
                <Icon size={18} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </span>
              <input
                className="db-search-input"
                type="text"
                placeholder="Search users, groups, computers, OUs…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <kbd className="db-search-kbd">Ctrl K</kbd>
            </div>
          </form>
        </div>
      </div>

      {/* ── Enterprise stats strip ─────────────────── */}
      <div className="db-stats">
        {enterpriseStats.map((s, i) => (
          <div key={i} className="db-stat">
            <span className="db-stat-value">{s.value}</span>
            <span className="db-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Favorites ────────────────────────────── */}
      <FavoritesPanel />

      {/* ── Primary AD Forests ───────────────────── */}
      <div className="db-env-section">
        <div className="db-section-header">
          <div className="db-section-title-row">
            <span className="db-section-pip" style={{ background: '#1e40af' }} />
            <span className="db-section-label">Primary AD Forests</span>
          </div>
          <span className="db-section-desc">
            Production forests — select a forest in the top bar to scope reports
          </span>
        </div>

        {forestLoading && <div className="db-env-loading">Loading forest configuration…</div>}

        <div className="db-env-grid">
          {forests.map((forest) => {
            const meta = FOREST_META[forest.root] || {};
            const color = meta.color || '#1e40af';
            return (
              <div key={forest.id} className="db-env-card" style={{ '--ec': color }}>
                <div className="db-env-card-header">
                  <div className="db-env-icon-wrap">
                    <Icon size={20} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </div>
                  <div>
                    <div className="db-env-name">{forest.name}</div>
                    <div className="db-env-root">{forest.root}</div>
                  </div>
                  <span className="db-env-live-dot">LIVE</span>
                </div>

                {/* Key stats row */}
                {meta.stats && (
                  <div className="db-env-kpi-row">
                    {meta.stats.map((s) => {
                      const val = s.key === 'dc'
                        ? String(dcCounts[forest.root] ?? parseInt(s.value, 10))
                        : s.value;
                      return (
                        <div key={s.label} className="db-env-kpi">
                          <span className="db-env-kpi-value">{val}</span>
                          <span className="db-env-kpi-label">{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Domain structure */}
                {meta.domains && (
                  <div className="db-env-domains">
                    <div className="db-env-domains-title">Domain structure</div>
                    <div className="db-env-domain-list">
                      {meta.domains.map((d) => (
                        <div key={d.fqdn} className="db-env-domain-row">
                          <span className={`db-env-domain-role ${d.role === 'Forest Root' ? 'root' : ''}`}>
                            {d.role === 'Forest Root' ? '◆' : '◇'}
                          </span>
                          <span className="db-env-domain-fqdn">{d.fqdn}</span>
                          {d.role === 'Forest Root' && <span className="db-env-domain-tag">root</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {meta.note && <div className="db-env-note">{meta.note}</div>}

                <div className="db-env-actions">
                  <button className="db-env-btn" onClick={() => navigate('/domain-controllers')}>
                    Domain Controllers
                  </button>
                  <button className="db-env-btn" onClick={() => navigate('/topology')}>
                    Topology
                  </button>
                  <button className="db-env-btn" onClick={() => navigate('/users')}>
                    Users
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extended forests */}
        <div className="db-ext-grid">
          {EXTENDED_FORESTS.map((f) => (
            <div key={f.fqdn} className="db-ext-card" style={{ '--xc': f.color }}>
              <div className="db-ext-icon" style={{ color: f.color, background: `${f.color}14` }}>
                {f.icon}
              </div>
              <div className="db-ext-body">
                <div className="db-ext-name">{f.name}</div>
                <div className="db-ext-fqdn">{f.fqdn}</div>
                <div className="db-ext-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust Architecture ────────────────────── */}
      <div className="db-trust-section">
        <div className="db-section-header">
          <div className="db-section-title-row">
            <span className="db-section-pip" style={{ background: '#1e40af' }} />
            <span className="db-section-label">Trust Architecture</span>
          </div>
          <span className="db-section-desc">
            Inter-forest trust relationships — Source: IAM Architecture, Confluence CCE
          </span>
        </div>

        <div className="db-trust-grid">
          {TRUST_GROUPS.map((t) => (
            <div key={t.title} className="db-trust-card" style={{ '--tc': t.color }}>
              <div className="db-trust-card-top">
                <div className="db-trust-icon" style={{ color: t.color, background: `${t.color}14` }}>
                  {t.icon}
                </div>
                <div>
                  <div className="db-trust-title">{t.title}</div>
                  <div className="db-trust-meta">
                    <span className="db-trust-type">{t.type}</span>
                    <span className="db-trust-count">{t.count}</span>
                  </div>
                </div>
              </div>
              <div className="db-trust-detail">{t.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why use this tool ─────────────────────── */}
      <div className="db-why-section">
        <div className="db-section-header">
          <div className="db-section-title-row">
            <span className="db-section-pip" style={{ background: '#1e40af' }} />
            <span className="db-section-label">Why use this tool</span>
          </div>
          <span className="db-section-desc">Built for Identity Architecture — Paramount Global</span>
        </div>

        <div className="db-why-grid">
          {WHY_ITEMS.map((item) => (
            <div key={item.title} className="db-why-card">
              <div className="db-why-icon" style={{ color: item.color, background: `${item.color}14` }}>
                {item.icon}
              </div>
              <div className="db-why-title">{item.title}</div>
              <div className="db-why-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <div className="db-footer">
        <span>AD Report Hub v2.3.0 — Meridian</span>
        <span className="db-footer-sep">·</span>
        <span>Paramount Global — Identity Architecture</span>
        <span className="db-footer-sep">·</span>
        <span>© {new Date().getFullYear()} Paramount Global</span>
      </div>

    </div>
  );
};

export default Dashboard;
