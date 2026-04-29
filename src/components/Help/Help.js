import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Help.css';

const Help = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (id) => setExpandedFaq(expandedFaq === id ? null : id);

  const tabs = [
    { id: 'about',          label: 'About' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'faq',            label: 'FAQ' },
    { id: 'release-notes',  label: 'Release Notes' },
  ];

  // ─── RELEASES ──────────────────────────────────────────────────────────────
  const releases = [
    {
      version: '2.3.0',
      date: 'April 2026',
      codename: 'Meridian',
      summary: 'Identity Governance module, AD forest-scoped selector with cross-forest validation, and a professional navigation bar overhaul.',
      sections: [
        {
          title: 'Identity Governance',
          type: 'new',
          items: [
            'Dedicated Identity Governance page with two independent report sections: User Account Governance and Service Account Governance',
            'User governance reports: Password Not Required (PASSWD_NOTREQD), Accounts with No Manager, Accounts with Disabled Manager, Password Expired, Password Never Expires, Never Logged On',
            'Service account governance reports: Orphaned Service Accounts, Recently Created Orphaned Accounts (per domain, configurable days), Inactive Service Accounts (per domain, configurable days), Password Never Expires, Interactive Logon Detected',
            'All governance query cards display inline input fields for domain and day-threshold parameters where required',
            'Independent pagination and result state for each governance section — running one section does not affect the other',
          ]
        },
        {
          title: 'AD Forest Selector & Validation',
          type: 'new',
          items: [
            'Forest selector redesigned to show only AD forest roots — child domains are no longer selectable from the dropdown',
            'Per-domain report fields require manual domain entry and are validated against the active forest selection',
            'Cross-forest validation: entering a domain from a different forest (e.g., ad.viacom.com while CBS is selected) returns a descriptive error identifying the correct forest to switch to',
            'Validation logic uses DNS suffix matching — any child domain is automatically associated with its parent forest',
            'Forest data driven by server/config/domains.json — add forests without code changes',
          ]
        },
        {
          title: 'Navigation Bar',
          type: 'improved',
          items: [
            'Complete tab bar redesign: flat, modern enterprise style replacing the previous 3D raised button aesthetic',
            'All 16 navigation tabs now visible in a single row at standard viewport widths — Quick Links (Search, Logs, Help, License) no longer truncated',
            'Group category labels (IDENTITY, INFRASTRUCTURE, GOVERNANCE, QUICK LINKS) with per-group accent colours',
            'Active tab indicated by a coloured bottom-line underline and tinted background — consistent with Azure Portal and GitHub navigation patterns',
            'Hover states are subtle and uniform; no transform animations on inactive tabs',
            'Scrollbar hidden while maintaining horizontal scroll capability on narrow viewports',
          ]
        },
        {
          title: 'Users & Service Accounts',
          type: 'improved',
          items: [
            'Password Expired, Password Never Expires, and Never Logged On reports moved from Users to Identity Governance',
            'Contractors & Temps by Employee Type report restored to Domain-Specific Reports on the Users page',
            'Service Accounts page trimmed to core queries (All Forest-Wide, Per Domain) — governance-related queries consolidated under Governance tab',
            'Governance report cards redesigned: no emoji icons, professional left-border accent, clean typography',
          ]
        },
      ]
    },
    {
      version: '2.1.0',
      date: 'February 2026',
      codename: 'Sentinel',
      summary: 'Enterprise security reporting, lifecycle management, and professional UI overhaul.',
      sections: [
        {
          title: 'Security & Compliance',
          type: 'new',
          items: [
            'New Compliance page with 7 enterprise-grade security assessment reports',
            'AdminSDHolder protected users detection — identify accounts with elevated adminCount flags',
            'Unconstrained Kerberos delegation analysis — flag users and computers trusted for delegation (excluding DCs)',
            'Kerberos Pre-Authentication disabled report — detect accounts vulnerable to AS-REP Roasting',
            'Reversible encryption detection — identify accounts storing passwords with reversible encryption',
            'Nested privileged group membership analysis — trace indirect admin paths through group nesting',
            'Stale admin accounts report — surface inactive privileged accounts (configurable threshold)',
            'Disabled users still in groups — compliance report for accounts retaining group memberships after disablement',
          ]
        },
        {
          title: 'User Lifecycle Reports',
          type: 'new',
          items: [
            'Users Modified in X Days — track recent attribute changes across the directory',
            'Users with Missing Manager — identify enabled accounts with no manager assigned',
            'Users Expiring Soon — surface accounts approaching or past their expiration date',
            'Employee Type Count — standalone report for EmployeeType attribute distribution per domain',
            'EA6 Value Count — standalone report for extensionAttribute6 distribution per domain',
          ]
        },
        {
          title: 'User Interface',
          type: 'improved',
          items: [
            'Users page reorganized into Forest-Wide and Domain-Specific report sections',
            'Professional UI refresh — refined typography, spacing, and visual hierarchy across all pages',
            'Consistent pagination controls migrated from inline styles to CSS classes across all report pages',
            'Striped table rows, uppercase column headers, and sticky header support',
            'Refined button styles with active press states and subtle shadows',
            'Dashboard hero section redesigned with cleaner layout and accent gradient',
            'Query cards updated with grid layout, refined hover states, and border animations',
          ]
        },
        {
          title: 'Accessibility & Standards',
          type: 'improved',
          items: [
            'ARIA labels added to all modal close buttons, theme toggle, and navigation controls',
            'Keyboard navigation support for query cards (Enter/Space activation)',
            'prefers-reduced-motion media query — disables animations for users with motion sensitivity',
            'Focus-visible outlines on buttons and interactive elements for keyboard-only navigation',
          ]
        },
        {
          title: 'Bug Fixes',
          type: 'fixed',
          items: [
            'Account Type Count report now correctly extracts summary data from server response',
            'Domain input fields are now independent per query card — typing in one no longer affects others',
            'Created missing PowerShell scripts referenced by contacts routes',
          ]
        },
      ]
    },
    {
      version: '2.0.0',
      date: 'January 2026',
      codename: 'Horizon',
      summary: 'Global search, LDAP query builder, compliance reporting, and favorites system.',
      sections: [
        {
          title: 'Core Features',
          type: 'new',
          items: [
            'Global search across all AD object types — users, groups, computers, contacts, OUs',
            'Visual LDAP query builder with AND/OR logic, attribute selection, and raw LDAP mode',
            'Saved searches — persist and recall favourite queries with custom names',
            'Compliance reports — delegation analysis, orphaned accounts, and risk assessment',
            'Favorites system — bookmark frequently used reports with a star toggle on every query card',
            'Keyboard shortcuts — Ctrl+K for search, ? for help overlay, Escape to close modals',
            'Activity logging — all API requests tracked with user, action, target, status, and duration',
          ]
        },
        {
          title: 'Infrastructure',
          type: 'new',
          items: [
            'Forest/domain selector in the navigation bar for multi-domain targeting',
            'AD Topology page — forest info, domains, FSMO roles, trusts, replication status',
            'DC Resource Health — CPU, RAM, disk usage monitoring across domain controllers',
            'DC Services Status — service matrix (NTDS, DNS, Kdc, Netlogon, etc.) per DC',
            'Sites & Subnets — site links, subnet assignments, unassigned subnets, sites with no DC',
          ]
        },
        {
          title: 'Export & Data',
          type: 'improved',
          items: [
            'Export to Excel (.xlsx), CSV, JSON, and PDF (print) formats from any report',
            'Sortable table columns — click headers to sort ascending/descending',
            'Configurable pagination — 25, 50, or 100 results per page',
          ]
        },
      ]
    },
    {
      version: '1.0.0',
      date: 'December 2025',
      codename: 'Foundation',
      summary: 'Initial release — core identity and infrastructure reporting platform.',
      sections: [
        {
          title: 'Identity Reports',
          type: 'new',
          items: [
            'User reports — enabled/disabled, password status, creation date, lockout diagnostics',
            'Group reports — security, distribution, mail-enabled, empty groups, privileged group analysis',
            'Service account inventory — all accounts, orphaned, inactive, per-domain views',
            'Contact management — full contact listing and search',
          ]
        },
        {
          title: 'Infrastructure',
          type: 'new',
          items: [
            'Domain controller listing with site, IP, OS, and FSMO role information',
            'Computer inventory — enabled, disabled, never logged on, OS-based filtering',
            'Group Policy — all GPOs, unlinked, disabled, password policies',
            'OU container management with hierarchical tree view',
            'Printer inventory by domain with search',
          ]
        },
        {
          title: 'Platform',
          type: 'new',
          items: [
            'React 18 frontend with Node.js/Express backend and PowerShell AD integration',
            'Windows Integrated Authentication — no separate login required',
            'Light and dark theme support with localStorage persistence',
            'Real-time queries against Active Directory — no caching or stale data',
          ]
        },
      ]
    },
  ];

  // ─── FAQ ───────────────────────────────────────────────────────────────────
  const faqs = [
    {
      category: 'General',
      items: [
        {
          id: 'what-is',
          q: 'What is AD Report Hub?',
          a: 'AD Report Hub is an enterprise-grade Active Directory reporting and visibility platform developed for Paramount Global\'s Identity Architecture team. It provides real-time querying across identity objects (users, groups, service accounts), infrastructure components (domain controllers, AD sites, GPOs), governance posture (password hygiene, orphaned accounts, manager chain integrity), and compliance findings — all through a unified, browser-based interface. No additional AD tooling, RSAT installation, or domain admin credentials are required for standard reporting.'
        },
        {
          id: 'auth',
          q: 'How does authentication work?',
          a: 'AD Report Hub uses Windows Integrated Authentication (Kerberos/NTLM pass-through). The application automatically authenticates using the credentials of the Windows session that launched it — no separate login prompt is presented. The application inherits the Active Directory read permissions of the running user, which means the scope and detail of results depend on the account\'s delegated access. For reports that require elevated privileges (DC health, event log access), use the START_AS_ADMIN.bat launcher.'
        },
        {
          id: 'permissions',
          q: 'What permissions are required to run reports?',
          a: 'Standard reports require only authenticated domain user rights, which are granted to all domain-joined accounts by default. Elevated reports — including DC Resource Health, replication diagnostics, lockout event correlation (Event ID 4740), and security event log access — require Domain Admin membership or an equivalent delegated permission set. The START_AS_ADMIN.bat launcher is provided for these use cases. The activity log records the identity of every query for auditability.'
        },
        {
          id: 'real-time',
          q: 'Is the data real-time or cached?',
          a: 'All queries execute in real-time against Active Directory through PowerShell cmdlets invoked server-side. There is no caching layer; every report reflects the current directory state at the moment of execution. This guarantees accuracy but means forest-wide queries in large environments (100,000+ objects) may take 30–90 seconds. A loading indicator is displayed during execution, and the query is logged in Activity Logs with its duration.'
        },
        {
          id: 'forest-select',
          q: 'How does the AD Forest selector work?',
          a: 'The forest selector in the navigation bar controls the Active Directory forest context for all per-domain reports. Only forest root domains are presented (e.g., CBS — AD.cbs.net and Viacom/Paramount — AD.viacom.com). When you enter a specific domain in a per-domain report field, the application validates that the domain belongs to the selected forest before executing the query. Entering a domain from a different forest will return a descriptive error prompting you to switch the forest context first.'
        },
      ]
    },
    {
      category: 'Reports & Data',
      items: [
        {
          id: 'export',
          q: 'What export formats are supported?',
          a: 'All reports that return tabular data support four export formats: Excel (.xlsx) for spreadsheet analysis and sharing, CSV for data ingestion and automated processing, JSON for programmatic or API-style consumption, and PDF via the browser\'s native print dialog for formal documentation and audit records. The Export button appears automatically on any report panel containing results.'
        },
        {
          id: 'forest-vs-domain',
          q: 'What is the difference between Forest-Wide and Domain-Specific reports?',
          a: 'Forest-Wide reports enumerate all domains in the AD forest in a single pass and return a unified result set. They do not require a domain input and are suitable for getting an environment-wide picture. Domain-Specific reports execute against a single domain; you must enter the fully qualified domain name (FQDN) before the query runs. The forest selector sets the active forest context, and all domain entries are validated to belong to that forest before execution.'
        },
        {
          id: 'large-results',
          q: 'How are large result sets handled?',
          a: 'All data is loaded into the browser on query completion and paginated client-side. Page sizes are configurable at 25, 50, or 100 rows per page. Sorting and page navigation are instantaneous since they operate on the in-memory result set. For forest-wide queries in very large environments, the initial load may take up to 90 seconds — during which a loading indicator and the active spinner are displayed. The query is cancelable by navigating away, though the server-side PowerShell process will continue running to completion.'
        },
        {
          id: 'sort',
          q: 'Can I sort report results?',
          a: 'Yes — click any column header to toggle ascending/descending sort. A sort indicator arrow shows the active sort direction. On Service Accounts and other pages with the useSortableData hook, sorting is applied to the full result set before pagination, so the first-page results always reflect the top N records by the selected column. Multi-column sort is not currently supported.'
        },
        {
          id: 'favorites',
          q: 'How do Favorites work?',
          a: 'Every query card displays a star icon that toggles the report as a favourite. Favourited reports are stored in browser localStorage and appear in the Favourites panel on the Dashboard for one-click access. Favourites persist across sessions on the same browser profile but are not synced across devices or users. To remove a favourite, click the star icon on the query card or on the Dashboard panel.'
        },
      ]
    },
    {
      category: 'Identity Governance',
      items: [
        {
          id: 'gov-purpose',
          q: 'What is the purpose of the Identity Governance section?',
          a: 'The Identity Governance page surfaces identity hygiene issues that indicate configuration drift, policy violations, or operational risk within your AD environment. It is divided into two independent sections: User Account Governance (covering password policy compliance, manager chain integrity, and stale accounts) and Service Account Governance (covering orphaned, inactive, and misconfigured service accounts). These reports are designed to support periodic access reviews, audit evidence collection, and proactive remediation.'
        },
        {
          id: 'passwd-not-required',
          q: 'What does the "Password Not Required" report identify?',
          a: 'This report identifies accounts with the PASSWD_NOTREQD flag set in the UserAccountControl (UAC) attribute. These accounts are permitted to have an empty or blank password, regardless of the domain password policy. Enabled accounts with this flag are considered high risk — an attacker who locates such an account may be able to authenticate without knowing a password. The report shows the risk level (Enabled accounts flagged as High), last logon date, and password last set date to support prioritised remediation.'
        },
        {
          id: 'orphaned-svc',
          q: 'What defines an "Orphaned" service account?',
          a: 'A service account is considered orphaned when its Manager attribute is empty (null or not set). This means the account has no designated owner accountable for its lifecycle. Orphaned accounts represent a governance gap: they may remain active and credentialed indefinitely with no oversight. The Recently Created Orphaned Accounts report further narrows this to accounts created within a configurable window (up to 90 days), helping teams catch provisioning failures early before accounts become stale.'
        },
        {
          id: 'interactive-logon',
          q: 'Why is interactive logon on service accounts a concern?',
          a: 'Service accounts are designed for service-to-service authentication and should not be used for interactive desktop or RDP sessions. When a service account is used interactively, it indicates either operational misuse or a potential sign of lateral movement by a threat actor who has compromised the account. Interactive logon also leaves credential material on endpoints, increasing exposure. This report identifies service accounts with recent interactive logon activity so they can be investigated and access policies can be enforced.'
        },
      ]
    },
    {
      category: 'Troubleshooting',
      items: [
        {
          id: 'slow',
          q: 'Reports are running slowly. What can I do?',
          a: 'Forest-wide reports query every domain controller in the environment, which is inherently slow for large forests. Consider switching to Domain-Specific reports targeting a single domain for faster results. Ensure the host machine running AD Report Hub has reliable network connectivity and DNS resolution to domain controllers. If a report consistently times out, check the Activity Logs page for error details — common causes include unreachable DCs, DNS failures, or permission denials during PowerShell execution.'
        },
        {
          id: 'no-data',
          q: 'A report returns no results. What should I check?',
          a: 'Verify the following in order: (1) the domain name is entered correctly for domain-specific queries — use the FQDN exactly as it appears in AD; (2) the selected AD forest matches the domain you\'re querying; (3) your account has read permissions on the target domain and OU; (4) the Active Directory PowerShell module is installed on the server; (5) the target domain controller is reachable via ping and DNS. The Activity Logs page records all query attempts with error messages, which is the fastest path to root cause.'
        },
        {
          id: 'lockout',
          q: 'The Locked Out Users report shows the lockout state but no event details.',
          a: 'Event correlation for lockout source (caller computer, IP address, Event ID 4740) requires read access to the Security event log on domain controllers. If the running account lacks this permission, the report displays the AD lockout state from the PDC Emulator but cannot retrieve event data. To enable full lockout diagnostics, run the application using START_AS_ADMIN.bat, or request that a Domain Admin delegate "Read" access to the Security event log on the domain\'s domain controllers.'
        },
        {
          id: 'wrong-forest',
          q: 'I\'m getting a "wrong forest" validation error when entering a domain.',
          a: 'This error occurs when the domain you entered does not belong to the currently selected AD forest in the navigation bar. For example, entering ad.viacom.com while the CBS (AD.cbs.net) forest is selected will trigger this validation. To resolve: click the forest selector in the navigation bar, switch to the appropriate forest, then re-run the report. The validation uses DNS suffix matching — any domain ending with .ad.cbs.net is CBS, and any domain ending with .ad.viacom.com is Viacom/Paramount.'
        },
        {
          id: 'keyboard',
          q: 'What keyboard shortcuts are available?',
          a: 'Press ? (question mark) to open the keyboard shortcuts overlay from any page. Available shortcuts: Ctrl+K (or Cmd+K on Mac) opens global search, Escape closes any open modal or overlay, Alt+H navigates to the dashboard. Keyboard shortcuts are automatically suppressed when focus is inside a text input or textarea, so they do not interfere with typing.'
        },
      ]
    },
  ];

  // ─── RENDERERS ─────────────────────────────────────────────────────────────
  const renderAbout = () => (
    <div className="about-page">

      {/* Identity card */}
      <div className="about-hero card">
        <div className="about-hero-left">
          <div className="about-product-name">AD Report Hub</div>
          <div className="about-product-tagline">
            Active Directory reporting and analysis platform for enterprise environments
          </div>
          <div className="about-badges">
            <span className="about-badge">v2.3.0</span>
            <span className="about-badge about-badge-env">Internal Tool</span>
            <span className="about-badge about-badge-org">Paramount Global</span>
          </div>
        </div>
        <div className="about-hero-right">
          <div className="about-stat">
            <span className="about-stat-num">2</span>
            <span className="about-stat-label">AD Forests</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-num">30+</span>
            <span className="about-stat-label">Report Types</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-num">Real-Time</span>
            <span className="about-stat-label">No Caching</span>
          </div>
        </div>
      </div>

      {/* Latest release */}
      <div className="about-release card">
        <div className="about-release-left">
          <span className="about-release-badge">New in v2.3.0 — Meridian</span>
          <span className="about-release-text">
            Identity Governance module · AD forest-scoped selector with cross-forest validation · Professional navigation redesign
          </span>
        </div>
        <button className="about-release-link" onClick={() => setActiveTab('release-notes')}>
          Release notes →
        </button>
      </div>

      {/* Overview */}
      <div className="about-section card">
        <h2 className="about-section-title">Overview</h2>
        <p className="about-body">
          AD Report Hub is designed to streamline Active Directory reporting and analysis across
          enterprise environments. It provides a consistent and efficient interface for generating
          domain-level insights while maintaining strict alignment with selected forest boundaries.
        </p>
        <p className="about-body">
          The platform is built around four core principles:
        </p>
        <div className="about-principles-grid">
          <div className="about-principle">
            <div className="about-principle-title">Accuracy</div>
            <div className="about-principle-desc">Reports are executed only within the selected Active Directory forest, with real-time queries against live directory data.</div>
          </div>
          <div className="about-principle">
            <div className="about-principle-title">Flexibility</div>
            <div className="about-principle-desc">Supports manual domain input for targeted reporting scenarios alongside forest-wide enumeration.</div>
          </div>
          <div className="about-principle">
            <div className="about-principle-title">Consistency</div>
            <div className="about-principle-desc">Standardised workflows and cross-forest validation are applied uniformly across all reporting modules.</div>
          </div>
          <div className="about-principle">
            <div className="about-principle-title">Efficiency</div>
            <div className="about-principle-desc">Optimised for quick execution and minimal user friction. No additional tooling, RSAT installation, or elevated credentials required for standard reports.</div>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="about-section card">
        <h2 className="about-section-title">Architecture overview</h2>
        <div className="about-arch-grid">
          <div className="about-arch-layer">
            <div className="about-arch-label">Presentation</div>
            <div className="about-arch-tech">React 18</div>
            <div className="about-arch-desc">Single-page application with React Router v6, Context API for global state, and CSS custom properties for theming.</div>
          </div>
          <div className="about-arch-arrow">→</div>
          <div className="about-arch-layer">
            <div className="about-arch-label">API layer</div>
            <div className="about-arch-tech">Node.js / Express</div>
            <div className="about-arch-desc">REST API server running locally. Handles authentication pass-through, request routing, and PowerShell process management.</div>
          </div>
          <div className="about-arch-arrow">→</div>
          <div className="about-arch-layer">
            <div className="about-arch-label">AD integration</div>
            <div className="about-arch-tech">PowerShell + ADWS</div>
            <div className="about-arch-desc">PowerShell scripts query AD Web Services (ADWS) via the ActiveDirectory module. Results are JSON-serialised and returned to the API layer.</div>
          </div>
          <div className="about-arch-arrow">→</div>
          <div className="about-arch-layer">
            <div className="about-arch-label">Directory</div>
            <div className="about-arch-tech">Active Directory</div>
            <div className="about-arch-desc">CBS (AD.cbs.net) and Viacom/Paramount (AD.viacom.com) forests. Queries target individual domains or enumerate the full forest.</div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="about-section card">
        <h2 className="about-section-title">Capability summary</h2>
        <div className="about-caps-grid">
          {[
            { area: 'Identity reports', items: ['Enabled / disabled users', 'Password and expiry status', 'Manager chain integrity', 'Contractor and employee type distribution', 'Lockout diagnostics (Event 4740)', 'Recently created accounts'] },
            { area: 'Group management', items: ['Security and distribution groups', 'Privileged group membership', 'Nested group analysis', 'Empty and stale groups', 'Mail-enabled group inventory', 'Group member detail'] },
            { area: 'Identity governance', items: ['Password not required (PASSWD_NOTREQD)', 'Accounts with no or disabled manager', 'Password never expires (users and SAs)', 'Orphaned service accounts', 'Inactive service account detection', 'Interactive logon monitoring'] },
            { area: 'Infrastructure', items: ['Domain controller inventory', 'DC resource health (CPU / RAM / disk)', 'FSMO role holders', 'AD sites and site links', 'Subnet assignments', 'Replication health status'] },
            { area: 'Compliance and audit', items: ['Kerberos delegation analysis', 'AdminSDHolder detection', 'AS-REP Roasting exposure', 'Reversible encryption accounts', 'Stale privileged accounts', 'Disabled users in groups'] },
            { area: 'Platform', items: ['Real-time queries — no caching', 'Excel / CSV / JSON / PDF export', 'Activity logging and audit trail', 'Sortable, paginated result tables', 'Bookmarkable favourite reports', 'Light and dark theme support'] },
          ].map(cap => (
            <div key={cap.area} className="about-cap-card">
              <div className="about-cap-title">{cap.area}</div>
              <ul className="about-cap-list">
                {cap.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Ownership */}
      <div className="about-section card">
        <h2 className="about-section-title">Ownership &amp; support</h2>
        <div className="about-ownership-grid">
          <div className="about-ownership-block">
            <div className="about-ownership-label">Product owner</div>
            <div className="about-ownership-value">Identity Architecture Team</div>
            <div className="about-ownership-sub">Paramount Global — Enterprise Technology</div>
          </div>
          <div className="about-ownership-block">
            <div className="about-ownership-label">Deployment model</div>
            <div className="about-ownership-value">Local / on-premises</div>
            <div className="about-ownership-sub">Runs on the host machine; no cloud dependencies</div>
          </div>
          <div className="about-ownership-block">
            <div className="about-ownership-label">Authentication</div>
            <div className="about-ownership-value">Windows Integrated (Kerberos/NTLM)</div>
            <div className="about-ownership-sub">No separate credentials required for standard reports</div>
          </div>
          <div className="about-ownership-block">
            <div className="about-ownership-label">Data handling</div>
            <div className="about-ownership-value">No persistent storage of AD data</div>
            <div className="about-ownership-sub">Results exist in-memory only; not written to disk</div>
          </div>
        </div>
      </div>

      {/* Build info */}
      <div className="about-build-info">
        <span>AD Report Hub v2.3.0 — Meridian</span>
        <span className="about-build-sep">·</span>
        <span>Built April 2026</span>
        <span className="about-build-sep">·</span>
        <span>© {new Date().getFullYear()} Paramount Global. All rights reserved.</span>
      </div>
    </div>
  );

  const renderReleaseNotes = () => (
    <div className="release-notes">
      {releases.map((release) => (
        <div key={release.version} className="release-block">
          <div className="release-block-header">
            <div className="release-meta">
              <span className="release-badge">{release.version}</span>
              <span className="release-codename">{release.codename}</span>
              <span className="release-block-date">{release.date}</span>
            </div>
            <p className="release-summary">{release.summary}</p>
          </div>
          <div className="release-sections">
            {release.sections.map((section, si) => (
              <div key={si} className="release-section">
                <div className="release-section-header">
                  <span className={`release-section-tag tag-${section.type}`}>
                    {section.type === 'new' ? 'NEW' : section.type === 'improved' ? 'IMPROVED' : 'FIXED'}
                  </span>
                  <h4>{section.title}</h4>
                </div>
                <ul className="release-section-items">
                  {section.items.map((item, ii) => <li key={ii}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFaq = () => (
    <div className="faq-container">
      {faqs.map((category) => (
        <div key={category.category} className="faq-category">
          <h3 className="faq-category-title">{category.category}</h3>
          <div className="faq-items">
            {category.items.map((item) => (
              <div key={item.id} className={`faq-item ${expandedFaq === item.id ? 'expanded' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={expandedFaq === item.id}
                >
                  <span className="faq-q-text">{item.q}</span>
                  <span className="faq-chevron">{expandedFaq === item.id ? '−' : '+'}</span>
                </button>
                {expandedFaq === item.id && (
                  <div className="faq-answer"><p>{item.a}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderGettingStarted = () => (
    <div className="getting-started">
      {[
        {
          n: '01', title: 'Launch the Application',
          body: <>Run <code>START.bat</code> for standard user mode or <code>START_AS_ADMIN.bat</code> for elevated operations (DC health checks, Security event log access). The server starts automatically and the application opens at <code>http://localhost:3000</code> in your default browser. Do not close the terminal window while the application is in use.</>
        },
        {
          n: '02', title: 'Select Your AD Forest',
          body: <>Use the <strong>forest selector</strong> in the navigation bar to choose your target AD forest (CBS or Viacom/Paramount). This context is used to validate domain entries in per-domain report fields and persists across your session. For forest-wide reports, no domain selection is needed beyond setting the forest context.</>
        },
        {
          n: '03', title: 'Run Reports',
          body: <>Navigate to any report section using the top navigation tabs (Identity, Infrastructure, Governance, etc.). Forest-wide reports execute with a single click. Domain-specific reports require you to enter the domain FQDN in the input field before clicking Run — the domain is validated against your selected forest. Results appear in sortable, paginated tables below the query panel.</>
        },
        {
          n: '04', title: 'Export &amp; Analyse',
          body: <>Click <strong>Export All Results</strong> on any results panel to download data in Excel, CSV, JSON, or PDF format. Use the <strong>star icon</strong> on any query card to bookmark it as a favourite — favourites appear on the Dashboard for one-click access. The Activity Logs page records all queries with their duration and status for audit purposes.</>
        },
        {
          n: '05', title: 'Identity Governance Review',
          body: <>Visit the <strong>Governance</strong> tab for identity hygiene reports. The User Account Governance section surfaces password policy violations, missing manager chains, and stale accounts. The Service Account Governance section identifies orphaned, inactive, and misconfigured service accounts. Each section operates independently — results from one do not reset the other.</>
        },
        {
          n: '06', title: 'Compliance &amp; Audit',
          body: <>The <strong>Compliance</strong> tab provides deeper security assessment reports including Kerberos delegation analysis, AdminSDHolder detection, AS-REP Roasting exposure, and privileged access reviews. These reports require standard domain read access and produce exportable findings suitable for audit evidence or risk register entries.</>
        },
      ].map(step => (
        <div key={step.n} className="gs-section">
          <div className="gs-step-number">{step.n}</div>
          <div className="gs-step-content">
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        </div>
      ))}

      <div className="gs-shortcuts card">
        <h3>Keyboard Shortcuts</h3>
        <div className="gs-shortcut-grid">
          <div className="gs-shortcut"><kbd>Ctrl</kbd>+<kbd>K</kbd><span>Open Global Search</span></div>
          <div className="gs-shortcut"><kbd>?</kbd><span>Shortcuts Overlay</span></div>
          <div className="gs-shortcut"><kbd>Esc</kbd><span>Close Modal / Overlay</span></div>
          <div className="gs-shortcut"><kbd>Alt</kbd>+<kbd>H</kbd><span>Go to Dashboard</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="help-page">
      <h1>Help &amp; Documentation</h1>

      <div className="help-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`help-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="help-content">
        {activeTab === 'about'           && renderAbout()}
        {activeTab === 'getting-started' && renderGettingStarted()}
        {activeTab === 'faq'             && renderFaq()}
        {activeTab === 'release-notes'   && renderReleaseNotes()}
      </div>
    </div>
  );
};

export default Help;
