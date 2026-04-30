import React, { useState, useMemo } from 'react';
import axios from 'axios';
import './ADSitesSubnets.css';
import ExportButton from '../common/ExportButton';
import FavoriteButton from '../common/FavoriteButton';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

const TOPOLOGY_API = new Set(['ad-sites', 'dc-replication']);

const QUERY_GROUPS = [
  {
    id: 'sites',
    title: 'Sites',
    queries: [
      { id: 'ad-sites',    label: 'AD Sites Summary', description: 'All sites with DC count, subnet count, and linked site details' },
      { id: 'sites-no-dc', label: 'Sites with No DC',  description: 'AD Sites that have no Domain Controller assigned — potential routing issues' },
    ],
  },
  {
    id: 'subnets',
    title: 'Subnets',
    queries: [
      { id: 'subnets',            label: 'All Subnets',        description: 'All subnets with their AD Site assignment and DC associations' },
      { id: 'subnets-detailed',   label: 'Subnets Detailed',   description: 'Subnets with DC count, physical location, and modification dates' },
      { id: 'unassigned-subnets', label: 'Unassigned Subnets', description: 'Subnets not associated with any AD Site — clients may authenticate suboptimally' },
    ],
  },
  {
    id: 'replication',
    title: 'Replication',
    queries: [
      { id: 'site-links',         label: 'AD Site Links',         description: 'Site link objects, replication intervals, costs, and schedules' },
      { id: 'replication-health', label: 'Replication Health',    description: 'Per-DC partner replication status — highlights overdue (>24h) and failed links' },
      { id: 'dc-replication',     label: 'DC Replication Status', description: 'DC-to-DC replication connections, naming contexts, and failure counts' },
    ],
  },
];

const ALL_QUERIES = QUERY_GROUPS.flatMap(g => g.queries);

const ADSitesSubnets = () => {
  const { selectedDomain } = useApp();
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);
  const [pageSize, setPageSize]       = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig]   = useState({ key: null, direction: 'asc' });

  const activeQueryDef = ALL_QUERIES.find(q => q.id === activeQuery);

  const handleQuery = async (queryId) => {
    setLoading(true);
    setError(null);
    setActiveQuery(queryId);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
    try {
      const endpoint = TOPOLOGY_API.has(queryId) ? '/api/topology' : '/api/sites-subnets';
      const params = { query: queryId };
      if (selectedDomain) params.domain = selectedDomain;
      const response = await axios.get(endpoint, { params });
      const result = response.data.data;
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Query failed');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = useMemo(() => {
    if (!data?.length) return [];
    const items = [...data];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] ?? '';
        let bv = b[sortConfig.key] ?? '';
        if (typeof av === 'boolean') av = av ? 1 : 0;
        if (typeof bv === 'boolean') bv = bv ? 1 : 0;
        if (typeof av === 'number' && typeof bv === 'number')
          return sortConfig.direction === 'asc' ? av - bv : bv - av;
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        if (as < bs) return sortConfig.direction === 'asc' ? -1 : 1;
        if (as > bs) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [data, sortConfig]);

  const totalPages    = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const startIndex    = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const SortableHeader = ({ columnKey, label }) => (
    <th onClick={() => handleSort(columnKey)} className="sortable-th">
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        <span className={`sort-indicator${sortConfig.key === columnKey ? ' active' : ''}`}>
          {sortConfig.key === columnKey ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </th>
  );

  // ── Tables ──────────────────────────────────────────────────────────────────

  const renderSitesSummaryTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="SiteName"         label="Site Name" />
        <SortableHeader columnKey="DCCount"          label="DCs" />
        <SortableHeader columnKey="SubnetCount"      label="Subnets" />
        <SortableHeader columnKey="SiteLinksCount"   label="Site Links" />
        <SortableHeader columnKey="LinkedSitesCount" label="Linked Sites" />
        <SortableHeader columnKey="LinkedSites"      label="Linked Site Names" />
      </tr></thead>
      <tbody>
        {paginatedData.map((site, i) => (
          <tr key={i}>
            <td><strong>{site.SiteName}</strong></td>
            <td>{site.DCCount || 0}</td>
            <td>{site.SubnetCount || 0}</td>
            <td>{site.SiteLinksCount || 0}</td>
            <td>{site.LinkedSitesCount || 0}</td>
            <td className="sites-list">{site.LinkedSites || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSitesNoDCTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="SiteName"     label="Site Name" />
        <SortableHeader columnKey="Description"  label="Description" />
        <SortableHeader columnKey="DCCount"      label="DC Count" />
        <SortableHeader columnKey="SubnetCount"  label="Subnet Count" />
        <SortableHeader columnKey="SiteLinks"    label="Site Links" />
        <SortableHeader columnKey="Created"      label="Created" />
        <SortableHeader columnKey="LastModified" label="Last Modified" />
      </tr></thead>
      <tbody>
        {paginatedData.map((site, i) => (
          <tr key={i}>
            <td><strong>{site.SiteName}</strong></td>
            <td>{site.Description || '-'}</td>
            <td>{site.DCCount}</td>
            <td>{site.SubnetCount}</td>
            <td>{site.SiteLinks || '-'}</td>
            <td>{formatDate(site.Created)}</td>
            <td>{formatDate(site.LastModified)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSubnetsTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="SubnetName"  label="Subnet Name" />
        <SortableHeader columnKey="ADSite"      label="AD Site" />
        <SortableHeader columnKey="DCCount"     label="DC Count" />
        <SortableHeader columnKey="DCNames"     label="DC Names" />
        <SortableHeader columnKey="Description" label="Description" />
        <SortableHeader columnKey="Location"    label="Location" />
      </tr></thead>
      <tbody>
        {paginatedData.map((s, i) => (
          <tr key={i}>
            <td>{s['Subnet Name'] || s.SubnetName || s.Subnet}</td>
            <td>{s['AD Site'] || s.ADSite}</td>
            <td>{s['DC Count'] || s.DCCount || 0}</td>
            <td className="dc-names">{s['DC Names'] || s.DCNames || '-'}</td>
            <td>{s['Subnet Description'] || s.Description || '-'}</td>
            <td>{s['Subnet Location'] || s.Location || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSubnetsDetailedTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="Subnet"           label="Subnet" />
        <SortableHeader columnKey="ADSite"           label="AD Site" />
        <SortableHeader columnKey="DCCount"          label="DC Count" />
        <SortableHeader columnKey="Description"      label="Description" />
        <SortableHeader columnKey="PhysicalLocation" label="Physical Location" />
        <SortableHeader columnKey="CreatedDate"      label="Created" />
        <SortableHeader columnKey="LastModified"     label="Last Modified" />
      </tr></thead>
      <tbody>
        {paginatedData.map((s, i) => (
          <tr key={i}>
            <td>{s.Subnet || s['Subnet Name']}</td>
            <td>{s['AD Site'] || s.ADSite}</td>
            <td>{s['DC Count'] || s.DCCount || 0}</td>
            <td>{s.Description || '-'}</td>
            <td>{s['Physical Location'] || s.PhysicalLocation || '-'}</td>
            <td>{formatDate(s.CreatedDate || s['Created Date'])}</td>
            <td>{formatDate(s.LastModified || s['Last Modified'])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderUnassignedSubnetsTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="Subnet"           label="Subnet" />
        <SortableHeader columnKey="ADSite"           label="AD Site" />
        <SortableHeader columnKey="Description"      label="Description" />
        <SortableHeader columnKey="PhysicalLocation" label="Physical Location" />
        <SortableHeader columnKey="Created"          label="Created" />
        <SortableHeader columnKey="LastModified"     label="Last Modified" />
      </tr></thead>
      <tbody>
        {paginatedData.map((s, i) => (
          <tr key={i}>
            <td>{s.Subnet}</td>
            <td><span className="unassigned-site">{s.ADSite || 'None'}</span></td>
            <td>{s.Description || '-'}</td>
            <td>{s.PhysicalLocation || '-'}</td>
            <td>{formatDate(s.Created)}</td>
            <td>{formatDate(s.LastModified)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSiteLinksTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="SiteLinkName"           label="Site Link Name" />
        <SortableHeader columnKey="Description"            label="Description" />
        <SortableHeader columnKey="Cost"                   label="Cost" />
        <SortableHeader columnKey="ReplicationIntervalMin" label="Interval (min)" />
        <SortableHeader columnKey="ReplicationSchedule"    label="Schedule" />
        <SortableHeader columnKey="ChangeNotification"     label="Change Notify" />
        <SortableHeader columnKey="SiteCount"              label="Sites" />
        <SortableHeader columnKey="AssociatedSites"        label="Associated Sites" />
      </tr></thead>
      <tbody>
        {paginatedData.map((link, i) => (
          <tr key={i}>
            <td><strong>{link.SiteLinkName || link['Site Link Name']}</strong></td>
            <td>{link.Description || '-'}</td>
            <td>{link.Cost}</td>
            <td>{link.ReplicationIntervalMin || link.DurationMin || '-'}</td>
            <td>{link.ReplicationSchedule || '-'}</td>
            <td>
              <span className={`status-badge ${link.ChangeNotification ? 'enabled' : 'disabled'}`}>
                {link.ChangeNotification ? 'Yes' : 'No'}
              </span>
            </td>
            <td>{link.SiteCount || link['Site Count']}</td>
            <td className="sites-list">{link.AssociatedSites || link['Associated Sites'] || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const getReplStatusClass = (status) => {
    switch (status) {
      case 'Healthy':  return 'enabled';
      case 'Warning':  return 'risk-medium';
      case 'Overdue':  return 'risk-high';
      case 'Failed':   return 'disabled';
      default:         return '';
    }
  };

  const renderReplicationHealthTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="Domain"                label="Domain" />
        <SortableHeader columnKey="DCName"                label="DC Name" />
        <SortableHeader columnKey="Site"                  label="DC Site" />
        <SortableHeader columnKey="PartnerName"           label="Partner DC" />
        <SortableHeader columnKey="PartnerSite"           label="Partner Site" />
        <SortableHeader columnKey="Partition"             label="Partition" />
        <SortableHeader columnKey="ReplicationStatus"     label="Status" />
        <SortableHeader columnKey="HoursSinceLastSuccess" label="Hrs Since Success" />
        <SortableHeader columnKey="ConsecutiveFailures"   label="Failures" />
        <SortableHeader columnKey="LastSuccess"           label="Last Success" />
        <SortableHeader columnKey="LastAttempt"           label="Last Attempt" />
        <SortableHeader columnKey="LastResultMessage"     label="Last Result" />
      </tr></thead>
      <tbody>
        {paginatedData.map((row, i) => (
          <tr key={i} className={row.IsOverdue ? 'row-overdue' : ''}>
            <td>{row.Domain || '-'}</td>
            <td>{row.DCName || '-'}</td>
            <td>{row.Site || '-'}</td>
            <td>{row.PartnerName || '-'}</td>
            <td>{row.PartnerSite || '-'}</td>
            <td className="partition-cell">{row.Partition || '-'}</td>
            <td><span className={`status-badge ${getReplStatusClass(row.ReplicationStatus)}`}>{row.ReplicationStatus || '-'}</span></td>
            <td className={row.HoursSinceLastSuccess > 24 ? 'cell-error' : ''}>
              {row.HoursSinceLastSuccess != null ? `${row.HoursSinceLastSuccess}h` : '-'}
            </td>
            <td className={row.ConsecutiveFailures > 0 ? 'cell-error' : ''}>
              {row.ConsecutiveFailures ?? '-'}
            </td>
            <td>{formatDate(row.LastSuccess)}</td>
            <td>{formatDate(row.LastAttempt)}</td>
            <td className="result-cell">{row.LastResultCode === 0 ? 'Success' : (row.LastResultMessage || '-')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDCReplicationTable = () => (
    <table className="data-table">
      <thead><tr>
        <SortableHeader columnKey="SourceDC"          label="Source DC" />
        <SortableHeader columnKey="DestinationDC"     label="Destination DC" />
        <SortableHeader columnKey="NamingContext"      label="Naming Context" />
        <SortableHeader columnKey="LastReplication"   label="Last Replication" />
        <SortableHeader columnKey="ReplicationStatus" label="Status" />
        <SortableHeader columnKey="FailureCount"      label="Failures" />
      </tr></thead>
      <tbody>
        {paginatedData.map((repl, i) => (
          <tr key={i}>
            <td>{repl.SourceDC}</td>
            <td>{repl.DestinationDC}</td>
            <td className="dn-cell">{repl.NamingContext || '-'}</td>
            <td>{repl.LastReplication || 'Never'}</td>
            <td>
              <span className={`status-badge ${repl.ReplicationStatus === 'Success' ? 'enabled' : repl.ReplicationStatus === 'In Progress' ? 'warning' : 'disabled'}`}>
                {repl.ReplicationStatus || 'Unknown'}
              </span>
            </td>
            <td>
              <span className={`failure-badge ${repl.FailureCount > 0 ? 'has-failures' : 'no-failures'}`}>
                {repl.FailureCount || 0}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTable = () => {
    switch (activeQuery) {
      case 'ad-sites':           return renderSitesSummaryTable();
      case 'sites-no-dc':        return renderSitesNoDCTable();
      case 'subnets':            return renderSubnetsTable();
      case 'subnets-detailed':   return renderSubnetsDetailedTable();
      case 'unassigned-subnets': return renderUnassignedSubnetsTable();
      case 'site-links':         return renderSiteLinksTable();
      case 'replication-health': return renderReplicationHealthTable();
      case 'dc-replication':     return renderDCReplicationTable();
      default:                   return null;
    }
  };

  const renderPagination = () => {
    if (!sortedData.length) return null;
    const start = startIndex + 1;
    const end   = Math.min(startIndex + pageSize, sortedData.length);
    return (
      <div className="pagination-controls">
        <div className="pagination-info">Showing {start}–{end} of {sortedData.length} results</div>
        <div className="pagination-actions">
          <div className="page-size-select">
            <label>Per page:</label>
            <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setCurrentPage(1); }}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="page-nav">
            <button className="btn btn-secondary" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1}>Back</button>
            <span className="page-indicator">Page {currentPage} of {totalPages}</span>
            <button className="btn btn-secondary" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Next</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sites-page">

      <h1>AD Sites &amp; Subnets</h1>

      {/* ── Sites ── */}
      <div className="query-panel card">
        <h3>Sites</h3>
        <div className="ss-query-cards">
          {QUERY_GROUPS[0].queries.map(q => (
            <div
              key={q.id}
              className={`ss-query-card ${activeQuery === q.id ? 'active' : ''}`}
              onClick={() => handleQuery(q.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuery(q.id); } }}
            >
              <div className="ss-query-header">
                <span className="ss-query-label">{q.label}</span>
                <FavoriteButton page="/sites-subnets" queryId={q.id} label={q.label} />
              </div>
              <div className="ss-query-desc">{q.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Subnets ── */}
      <div className="query-panel card">
        <h3>Subnets</h3>
        <div className="ss-query-cards">
          {QUERY_GROUPS[1].queries.map(q => (
            <div
              key={q.id}
              className={`ss-query-card ${activeQuery === q.id ? 'active' : ''}`}
              onClick={() => handleQuery(q.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuery(q.id); } }}
            >
              <div className="ss-query-header">
                <span className="ss-query-label">{q.label}</span>
                <FavoriteButton page="/sites-subnets" queryId={q.id} label={q.label} />
              </div>
              <div className="ss-query-desc">{q.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Replication ── */}
      <div className="query-panel card">
        <h3>Replication</h3>
        <div className="ss-query-cards">
          {QUERY_GROUPS[2].queries.map(q => (
            <div
              key={q.id}
              className={`ss-query-card ${activeQuery === q.id ? 'active' : ''}`}
              onClick={() => handleQuery(q.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuery(q.id); } }}
            >
              <div className="ss-query-header">
                <span className="ss-query-label">{q.label}</span>
                <FavoriteButton page="/sites-subnets" queryId={q.id} label={q.label} />
              </div>
              <div className="ss-query-desc">{q.description}</div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Running report…</span>
        </div>
      )}

      {!loading && sortedData.length > 0 && (
        <div className="results-panel card">
          <div className="results-header">
            <div>
              <strong>{activeQueryDef?.label}</strong>
              <span className="results-count">{sortedData.length} result{sortedData.length !== 1 ? 's' : ''}</span>
            </div>
            <ExportButton data={sortedData} filename={`sites_${activeQuery || 'export'}`} title="AD Sites & Subnets Report" />
          </div>
          <div className="table-scroll">{renderTable()}</div>
          {renderPagination()}
        </div>
      )}

      {!loading && activeQuery && !error && sortedData.length === 0 && (
        <div className="empty-state card">
          <p>No data found for this query.</p>
        </div>
      )}

    </div>
  );
};

export default ADSitesSubnets;
