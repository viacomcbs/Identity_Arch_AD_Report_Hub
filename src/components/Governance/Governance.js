import React, { useState } from 'react';
import axios from 'axios';
import './Governance.css';
import ExportButton from '../common/ExportButton';
import FavoriteButton from '../common/FavoriteButton';
import { formatDate } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';

const Governance = () => {
  const { selectedDomain, validateDomainForForest } = useApp();

  // ── User governance state ─────────────────────────────────────────────
  const [userActiveQuery, setUserActiveQuery] = useState(null);
  const [userData, setUserData] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [userPageSize, setUserPageSize] = useState(25);
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  // ── Service account governance state ──────────────────────────────────
  const [svcActiveQuery, setSvcActiveQuery] = useState(null);
  const [svcData, setSvcData] = useState([]);
  const [svcLoading, setSvcLoading] = useState(false);
  const [svcError, setSvcError] = useState(null);
  const [svcPageSize, setSvcPageSize] = useState(25);
  const [svcCurrentPage, setSvcCurrentPage] = useState(1);
  const [svcOrphanedDomain, setSvcOrphanedDomain] = useState('');
  const [svcOrphanedDays, setSvcOrphanedDays] = useState(30);
  const [svcInactiveDomain, setSvcInactiveDomain] = useState('');
  const [svcInactiveDays, setSvcInactiveDays] = useState(90);

  // ── Query definitions ─────────────────────────────────────────────────
  const userGovernanceQueries = [
    { id: 'passwd-not-required', label: 'Password Not Required', description: 'Accounts with PASSWD_NOTREQD UAC flag — may allow blank passwords. Enabled accounts are high risk.' },
    { id: 'no-manager', label: 'Accounts with No Manager', description: 'Enabled users with no Manager attribute set — orphan risk with no management chain.' },
    { id: 'disabled-manager', label: 'Accounts with Disabled Manager', description: 'Enabled users whose assigned manager is disabled — oversight gap after off-boarding.' },
    { id: 'password-expired', label: 'Password Expired', description: 'Users with expired passwords across the forest.' },
    { id: 'password-never-expires', label: 'Password Never Expires', description: 'User accounts with non-expiring passwords — non-compliant password policy.' },
    { id: 'never-logged-on', label: 'Never Logged On', description: 'Users who have never authenticated — stale provisioned accounts.' },
  ];

  const svcGovernanceQueries = [
    { id: 'orphaned', label: 'Orphaned Service Accounts', description: 'Service accounts without a manager (forest-wide).' },
    { id: 'orphaned-recent', label: 'Recently Created Orphaned Accounts', description: 'Orphaned service accounts created in X days (max 90) per domain.', needsOrphaned: true },
    { id: 'inactive', label: 'Inactive Service Accounts', description: 'Service accounts not logged on for X days per domain.', needsInactive: true },
    { id: 'pwd-never-expires', label: 'Password Never Expires', description: 'Service accounts with non-expiring passwords — security hygiene risk.' },
    { id: 'interactive-logon', label: 'Interactive Logon Detected', description: 'Service accounts with recent interactive logon activity — potential misuse.' },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleUserQuery = async (queryId) => {
    setUserLoading(true);
    setUserError(null);
    setUserActiveQuery(queryId);
    setUserCurrentPage(1);
    try {
      const params = { query: queryId };
      if (selectedDomain) params.domain = selectedDomain;
      const response = await axios.get('/api/users', { params });
      const result = response.data.data;
      setUserData(Array.isArray(result) ? result : (result ? [result] : []));
    } catch (err) {
      setUserError(err.response?.data?.error || 'Query failed');
      setUserData([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleSvcQuery = async (queryId) => {
    if (queryId === 'orphaned-recent' && !svcOrphanedDomain.trim() && !selectedDomain) {
      setSvcError('Please enter a domain name');
      return;
    }
    if (queryId === 'inactive' && !svcInactiveDomain.trim() && !selectedDomain) {
      setSvcError('Please enter a domain name');
      return;
    }
    // Validate entered domain belongs to the selected forest
    const domainToCheck =
      queryId === 'orphaned-recent' ? (svcOrphanedDomain.trim() || selectedDomain) :
      queryId === 'inactive'        ? (svcInactiveDomain.trim() || selectedDomain) :
      null;
    if (domainToCheck) {
      const forestError = validateDomainForForest(domainToCheck);
      if (forestError) { setSvcError(forestError); return; }
    }
    setSvcLoading(true);
    setSvcError(null);
    setSvcActiveQuery(queryId);
    setSvcCurrentPage(1);
    try {
      const params = { query: queryId };
      if (queryId === 'orphaned-recent') {
        params.domain = svcOrphanedDomain || selectedDomain;
        params.days = Math.min(svcOrphanedDays, 90);
      }
      if (queryId === 'inactive') {
        params.domain = svcInactiveDomain || selectedDomain;
        params.days = svcInactiveDays;
      }
      if (!params.domain && selectedDomain) params.domain = selectedDomain;
      const response = await axios.get('/api/service-accounts', { params });
      setSvcData(response.data.data || []);
    } catch (err) {
      setSvcError(err.response?.data?.error || 'Query failed');
      setSvcData([]);
    } finally {
      setSvcLoading(false);
    }
  };

  // ── Pagination helpers ────────────────────────────────────────────────
  const userTotalPages = Math.ceil(userData.length / userPageSize);
  const userStart = (userCurrentPage - 1) * userPageSize;
  const userPaginatedData = userData.slice(userStart, userStart + userPageSize);

  const svcTotalPages = Math.ceil(svcData.length / svcPageSize);
  const svcStart = (svcCurrentPage - 1) * svcPageSize;
  const svcPaginatedData = svcData.slice(svcStart, svcStart + svcPageSize);

  const renderPagination = (total, current, setCurrent, totalPg, size, setSize) => {
    if (total === 0) return null;
    const start = (current - 1) * size + 1;
    const end = Math.min(current * size, total);
    return (
      <div className="pagination-controls">
        <div className="pagination-info">Showing {start}–{end} of {total} results</div>
        <div className="pagination-actions">
          <div className="page-size-select">
            <label>Per page:</label>
            <select value={size} onChange={(e) => { setSize(parseInt(e.target.value)); setCurrent(1); }}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="page-nav">
            <button onClick={() => current > 1 && setCurrent(current - 1)} disabled={current <= 1} className="btn btn-secondary">Back</button>
            <span className="page-indicator">Page {current} of {totalPg}</span>
            <button onClick={() => current < totalPg && setCurrent(current + 1)} disabled={current >= totalPg} className="btn btn-secondary">Next</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Badge helpers ─────────────────────────────────────────────────────
  const getRiskBadgeClass = (risk) => {
    switch ((risk || '').toLowerCase()) {
      case 'high':   return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low':    return 'risk-low';
      default:       return 'risk-info';
    }
  };

  const getExpiryBadgeClass = (status) => {
    switch (status) {
      case 'Expired':       return 'disabled';
      case 'Expiring Soon': return 'risk-medium';
      case 'Active':        return 'enabled';
      default:              return '';
    }
  };

  // ── User governance table renderers ───────────────────────────────────
  const renderPasswordNotRequiredTable = () => (
    <table className="data-table">
      <thead><tr>
        <th>Name</th><th>SAM Account</th><th>Email</th>
        <th>Enabled</th><th>Risk</th><th>Domain</th>
        <th>Department</th><th>Employee Type</th>
        <th>Password Last Set</th><th>Last Logon</th><th>Created</th>
      </tr></thead>
      <tbody>
        {userPaginatedData.map((u, i) => (
          <tr key={i}>
            <td><strong>{u.Name || u.DisplayName}</strong></td>
            <td>{u.SamAccountName}</td>
            <td>{u.Email || '-'}</td>
            <td><span className={`status-badge ${u.Enabled ? 'enabled' : 'disabled'}`}>{u.Enabled ? 'Enabled' : 'Disabled'}</span></td>
            <td><span className={`status-badge ${getRiskBadgeClass(u.RiskLevel)}`}>{u.RiskLevel || '-'}</span></td>
            <td>{u.Domain || '-'}</td>
            <td>{u.Department || '-'}</td>
            <td>{u.EmployeeType || '-'}</td>
            <td>{formatDate(u.PasswordLastSet)}</td>
            <td>{formatDate(u.LastLogon)}</td>
            <td>{formatDate(u.Created)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderNoManagerTable = () => (
    <table className="data-table">
      <thead><tr>
        <th>Name</th><th>SAM Account</th><th>Email</th>
        <th>Department</th><th>Title</th><th>Employee Type</th>
        <th>Domain</th><th>Last Logon</th><th>Created</th>
      </tr></thead>
      <tbody>
        {userPaginatedData.map((u, i) => (
          <tr key={i}>
            <td><strong>{u.Name || u.DisplayName}</strong></td>
            <td>{u.SamAccountName}</td>
            <td>{u.Email || '-'}</td>
            <td>{u.Department || '-'}</td>
            <td>{u.Title || '-'}</td>
            <td>{u.EmployeeType || '-'}</td>
            <td>{u.Domain || '-'}</td>
            <td>{formatDate(u.LastLogon)}</td>
            <td>{formatDate(u.Created)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDisabledManagerTable = () => (
    <table className="data-table">
      <thead><tr>
        <th>Name</th><th>SAM Account</th><th>Email</th>
        <th>Department</th><th>Domain</th>
        <th>Manager Name</th><th>Manager SAM</th><th>Manager Status</th><th>Last Logon</th>
      </tr></thead>
      <tbody>
        {userPaginatedData.map((u, i) => (
          <tr key={i}>
            <td><strong>{u.Name || u.DisplayName}</strong></td>
            <td>{u.SamAccountName}</td>
            <td>{u.Email || '-'}</td>
            <td>{u.Department || '-'}</td>
            <td>{u.Domain || '-'}</td>
            <td>{u.ManagerName || '-'}</td>
            <td>{u.ManagerSam || '-'}</td>
            <td><span className="status-badge disabled">Disabled</span></td>
            <td>{formatDate(u.LastLogon)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderGenericUserTable = () => (
    <table className="data-table">
      <thead><tr>
        <th>Name</th><th>SAM Account</th><th>Email</th>
        <th>Enabled</th><th>Department</th><th>Domain</th>
        <th>Password Last Set</th><th>Last Logon</th><th>Created</th>
      </tr></thead>
      <tbody>
        {userPaginatedData.map((u, i) => (
          <tr key={i}>
            <td><strong>{u.Name || u.DisplayName}</strong></td>
            <td>{u.SamAccountName}</td>
            <td>{u.Email || '-'}</td>
            <td><span className={`status-badge ${u.Enabled ? 'enabled' : 'disabled'}`}>{u.Enabled ? 'Enabled' : 'Disabled'}</span></td>
            <td>{u.Department || '-'}</td>
            <td>{u.Domain || '-'}</td>
            <td>{formatDate(u.PasswordLastSet)}</td>
            <td>{formatDate(u.LastLogon)}</td>
            <td>{formatDate(u.Created)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderUserTable = () => {
    switch (userActiveQuery) {
      case 'passwd-not-required': return renderPasswordNotRequiredTable();
      case 'no-manager':          return renderNoManagerTable();
      case 'disabled-manager':    return renderDisabledManagerTable();
      default:                    return renderGenericUserTable();
    }
  };

  // ── Service account table renderer ────────────────────────────────────
  const renderSvcTable = () => (
    <table className="data-table">
      <thead><tr>
        <th>Name</th><th>SAM Account</th><th>Account Type</th>
        <th>Status</th><th>Domain</th><th>Created</th>
        {svcActiveQuery === 'inactive' && <th>Days Inactive</th>}
        {svcActiveQuery === 'inactive' && <th>Last Logon</th>}
        <th>EA6 Value</th><th>Manager Status</th><th>Department</th>
      </tr></thead>
      <tbody>
        {svcPaginatedData.map((a, i) => (
          <tr key={i}>
            <td><strong>{a.Name}</strong></td>
            <td>{a.SamAccountName}</td>
            <td>{a.AccountType || 'Service Account'}</td>
            <td><span className={`status-badge ${a.Enabled ? 'enabled' : 'disabled'}`}>{a.Enabled ? 'Enabled' : 'Disabled'}</span></td>
            <td>{a.Domain || '-'}</td>
            <td>{formatDate(a.Created)}</td>
            {svcActiveQuery === 'inactive' && (
              <td>
                <span className={`days-badge ${a.DaysSinceLogon === 'Never' ? 'never' : a.DaysSinceLogon > 180 ? 'critical' : a.DaysSinceLogon > 90 ? 'warning' : 'normal'}`}>
                  {a.DaysSinceLogon}
                </span>
              </td>
            )}
            {svcActiveQuery === 'inactive' && (
              <td>{a.LastLogonDate ? formatDate(a.LastLogonDate) : 'Never'}</td>
            )}
            <td>{a.EA6_Value || a.extensionAttribute6 || '-'}</td>
            <td>
              <span className={`manager-badge ${a.ManagerStatus === 'NOT ASSIGNED' || a.ManagerStatus === 'MISSING' ? 'missing' : 'assigned'}`}>
                {a.ManagerStatus || 'Unknown'}
              </span>
            </td>
            <td>{a.Department || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // ── Query card renderer ───────────────────────────────────────────────
  const renderGovCard = (q, activeId, onClick) => (
    <div
      key={q.id}
      className={`gov-query-card ${activeId === q.id ? 'active' : ''}`}
      onClick={() => !q.needsOrphaned && !q.needsInactive && onClick(q.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !q.needsOrphaned && !q.needsInactive) { e.preventDefault(); onClick(q.id); } }}
      aria-label={`${q.label}: ${q.description}`}
    >
      <div className="gov-query-title">
        <span>{q.label}</span>
        <FavoriteButton page="/governance" queryId={q.id} label={q.label} />
      </div>
      <div className="gov-query-desc">{q.description}</div>
      {q.needsOrphaned && (
        <div className="query-input" onClick={(e) => e.stopPropagation()} style={{ marginTop: '10px' }}>
          <input type="text" placeholder="Domain (e.g., cbs.ad.cbs.net)" value={svcOrphanedDomain} onChange={(e) => setSvcOrphanedDomain(e.target.value)} style={{ flex: 2 }} />
          <input type="number" placeholder="Days" value={svcOrphanedDays} onChange={(e) => setSvcOrphanedDays(Math.min(parseInt(e.target.value) || 30, 90))} min="1" max="90" style={{ width: '70px', flex: 'none' }} />
          <button className="btn btn-primary btn-sm" onClick={() => onClick(q.id)}>Run</button>
        </div>
      )}
      {q.needsInactive && (
        <div className="query-input" onClick={(e) => e.stopPropagation()} style={{ marginTop: '10px' }}>
          <input type="text" placeholder="Domain (e.g., cbs.ad.cbs.net)" value={svcInactiveDomain} onChange={(e) => setSvcInactiveDomain(e.target.value)} style={{ flex: 2 }} />
          <input type="number" placeholder="Days" value={svcInactiveDays} onChange={(e) => setSvcInactiveDays(e.target.value)} min="1" max="9999" style={{ width: '70px', flex: 'none' }} />
          <button className="btn btn-primary btn-sm" onClick={() => onClick(q.id)}>Run</button>
        </div>
      )}
    </div>
  );

  const userActiveQueryDef = userGovernanceQueries.find(q => q.id === userActiveQuery);
  const svcActiveQueryDef = svcGovernanceQueries.find(q => q.id === svcActiveQuery);

  return (
    <div className="governance-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Identity Governance</h1>
        </div>
        <p className="page-description">
          Detect identity hygiene issues across your AD forest — accounts without managers, password policy violations, inactive service accounts, and contractor expirations.
        </p>
      </div>

      {/* ── User Account Governance ─────────────────────────────────── */}
      <div className="gov-section">
        <div className="gov-section-header">
          <div>
            <h2 className="gov-section-title">User Account Governance</h2>
            <p className="gov-section-desc">Password policy, manager assignment, and stale account detection for user accounts</p>
          </div>
        </div>

        <div className="query-panel card">
          <div className="gov-query-cards">
            {userGovernanceQueries.map((q) => renderGovCard(q, userActiveQuery, handleUserQuery))}
          </div>
        </div>

        {userError && <div className="error-message">{userError}</div>}
        {userLoading && (
          <div className="loading"><div className="spinner"></div><span>Running governance report...</span></div>
        )}
        {!userLoading && userData.length > 0 && (
          <div className="results-panel card">
            <div className="results-header">
              <div>
                <strong>{userActiveQueryDef?.label}</strong>
                <span style={{ marginLeft: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {userData.length} result{userData.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ExportButton data={userData} filename={`governance_users_${userActiveQuery}`} title="User Governance Report" />
            </div>
            <div className="table-scroll">{renderUserTable()}</div>
            {renderPagination(userData.length, userCurrentPage, setUserCurrentPage, userTotalPages, userPageSize, setUserPageSize)}
          </div>
        )}
        {!userLoading && Boolean(userActiveQuery) && !userError && userData.length === 0 && (
          <div className="empty-state card">
            <div className="empty-icon"></div>
            <p>No issues found. Your environment looks clean!</p>
          </div>
        )}
      </div>

      {/* ── Service Account Governance ──────────────────────────────── */}
      <div className="gov-section">
        <div className="gov-section-header">
          <div>
            <h2 className="gov-section-title">Service Account Governance</h2>
            <p className="gov-section-desc">Orphaned, inactive, and misconfigured service accounts across your AD environment</p>
          </div>
        </div>

        <div className="query-panel card">
          <div className="gov-query-cards">
            {svcGovernanceQueries.map((q) => renderGovCard(q, svcActiveQuery, handleSvcQuery))}
          </div>
        </div>

        {svcError && <div className="error-message">{svcError}</div>}
        {svcLoading && (
          <div className="loading"><div className="spinner"></div><span>Running service account report...</span></div>
        )}
        {!svcLoading && svcData.length > 0 && (
          <div className="results-panel card">
            <div className="results-header">
              <div>
                <strong>{svcActiveQueryDef?.label}</strong>
                <span style={{ marginLeft: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {svcData.length} result{svcData.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ExportButton data={svcData} filename={`governance_svc_${svcActiveQuery}`} title="Service Account Governance Report" />
            </div>
            <div className="table-scroll">{renderSvcTable()}</div>
            {renderPagination(svcData.length, svcCurrentPage, setSvcCurrentPage, svcTotalPages, svcPageSize, setSvcPageSize)}
          </div>
        )}
        {!svcLoading && Boolean(svcActiveQuery) && !svcError && svcData.length === 0 && (
          <div className="empty-state card">
            <div className="empty-icon"></div>
            <p>No issues found for this report. Your environment looks clean!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Governance;
