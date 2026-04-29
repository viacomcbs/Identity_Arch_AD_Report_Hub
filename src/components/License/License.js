import React from 'react';
import './License.css';

const License = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="license-page">
      <h1>License &amp; Legal Information</h1>

      {/* Copyright */}
      <div className="lic-section card">
        <div className="lic-section-header">
          <h2 className="lic-section-title">Copyright</h2>
        </div>
        <div className="lic-body">
          <div className="lic-copyright-block">
            Copyright &copy; {currentYear} Paramount Global. All rights reserved.
          </div>
          <p>
            AD Report Hub (the "Software") is proprietary software developed by and for Paramount
            Global and its affiliated entities. All intellectual property rights — including but not
            limited to copyrights, trade secrets, and know-how embodied in the Software — are owned
            exclusively by Paramount Global.
          </p>
          <p>
            Reproduction, distribution, transmission, modification, adaptation, or creation of
            derivative works of the Software, in whole or in part, by any means or in any form, is
            strictly prohibited without the prior express written consent of Paramount Global's Legal
            and Information Security departments.
          </p>
          <p>
            Authorised use is limited to Paramount Global employees, contractors operating under a
            current Master Services Agreement, and affiliated entities with an active technology
            services agreement. Access grants are personal and non-transferable.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="lic-section card">
        <div className="lic-section-header">
          <h2 className="lic-section-title">Disclaimer of Warranties</h2>
        </div>
        <div className="lic-body">
          <div className="lic-warranty-block">
            THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PARAMOUNT GLOBAL
            EXPRESSLY DISCLAIMS ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            NON-INFRINGEMENT, AND ACCURACY OF INFORMATION.
          </div>
          <p>
            AD Report Hub performs real-time queries against Active Directory. Query results reflect
            the state of the directory at the time of execution. Paramount Global makes no
            representation that query results are complete, accurate, or suitable for any specific
            legal, compliance, or audit purpose without independent verification.
          </p>
          <p>
            In no event shall Paramount Global, its officers, directors, employees, or contractors
            be liable for any indirect, incidental, special, consequential, or punitive damages
            arising out of or related to the use or inability to use the Software, even if advised
            of the possibility of such damages.
          </p>
        </div>
      </div>

      {/* Data Privacy */}
      <div className="lic-section card">
        <div className="lic-section-header">
          <h2 className="lic-section-title">Data Privacy &amp; Handling</h2>
        </div>
        <div className="lic-body">
          <p>
            AD Report Hub queries and displays Active Directory data that may include personally
            identifiable information (PII) such as display names, email addresses, employment
            attributes, and account status. The following obligations apply to all users of the
            Software:
          </p>
          <ul className="lic-list">
            <li>Query results must be handled in accordance with Paramount Global's Data Protection Policy and applicable data protection regulations (including GDPR, CCPA, and CPRA as relevant to the jurisdiction of operation).</li>
            <li>Exported data files (.xlsx, .csv, .json) containing employee or contractor attributes must be stored on approved, access-controlled systems only. Storing exports on personal devices or unapproved cloud services is prohibited.</li>
            <li>AD Report Hub does not transmit any queried data to external systems. All query results exist in-memory only for the duration of the browser session; no AD data is persisted to disk by the application.</li>
            <li>Activity logs record the identity of the executing user, the query performed, and the timestamp. These logs are retained for a minimum of 90 days for security and audit purposes and are accessible to Identity Architecture and Information Security personnel.</li>
            <li>Data should not be retained beyond the period required for the specific operational or audit task for which it was queried. Bulk exports of directory data require documented business justification.</li>
          </ul>
          <p>
            Questions regarding data classification or handling obligations should be directed to
            Paramount Global's Privacy Office or Information Security team.
          </p>
        </div>
      </div>

      {/* Acceptable Use */}
      <div className="lic-section card">
        <div className="lic-section-header">
          <h2 className="lic-section-title">Acceptable Use Policy</h2>
        </div>
        <div className="lic-body">
          <p>
            The Software may only be used for authorised operational, administrative, or audit
            activities within Paramount Global's IT environment. The following uses are expressly
            prohibited:
          </p>
          <ul className="lic-list">
            <li>Automated or scripted bulk enumeration of directory objects for purposes outside of approved IT operations or security assessments.</li>
            <li>Sharing exported data with individuals who are not authorised to access Active Directory information in their role.</li>
            <li>Using the Software to gather information in support of social engineering, phishing, or any other malicious activity.</li>
            <li>Attempting to circumvent authentication controls, modify application behaviour, or access APIs directly without authorisation.</li>
            <li>Running the Software against Active Directory forests or domains outside of Paramount Global's managed environment without explicit written approval from Information Security.</li>
          </ul>
          <p>
            Violations of this policy may result in revocation of access, disciplinary action, or
            referral to legal counsel, in accordance with Paramount Global's Code of Conduct and
            Acceptable Use Policy.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="lic-footer">
        <span>AD Report Hub v2.3.0</span>
        <span className="lic-footer-sep">·</span>
        <span>Paramount Global — Identity Architecture</span>
        <span className="lic-footer-sep">·</span>
        <span>© {currentYear} Paramount Global. All rights reserved.</span>
      </div>
    </div>
  );
};

export default License;
