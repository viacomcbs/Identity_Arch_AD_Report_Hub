import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const ForestDomainSelector = () => {
  const { forestData, forestLoading, selectedDomain, changeSelectedDomain } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const forests = forestData?.forests || [];

  const selectedForest = forests.find(
    f => f.root.toLowerCase() === (selectedDomain || '').toLowerCase()
  );

  const handleSelect = (forestRoot) => {
    changeSelectedDomain(forestRoot);
    setIsOpen(false);
  };

  const displayLabel = selectedForest ? selectedForest.label : 'Select Forest';

  if (forestLoading) {
    return (
      <div style={selectorStyle}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading forests...</span>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} style={selectorStyle}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
        title="Select target AD forest for reports"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{displayLabel}</span>
        <span style={{ fontSize: '10px', marginLeft: '2px', opacity: 0.6 }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <div style={dropdownHeaderStyle}>AD Forest</div>
          {forests.map((forest) => {
            const isSelected = selectedForest?.id === forest.id;
            return (
              <div
                key={forest.id}
                onClick={() => handleSelect(forest.root)}
                style={{
                  ...itemStyle,
                  backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                  fontWeight: isSelected ? 600 : 400,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {forest.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {forest.description}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>✓</span>
                )}
              </div>
            );
          })}

          {forests.length === 0 && (
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
              No forests configured. Edit server/config/domains.json.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const selectorStyle = {
  position: 'relative',
  display: 'inline-flex',
};

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '4px',
  width: '300px',
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  zIndex: 1000,
  overflow: 'hidden',
};

const dropdownHeaderStyle = {
  padding: '8px 16px 6px',
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  borderBottom: '1px solid var(--border-color)',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  transition: 'background-color 0.1s ease',
};

export default ForestDomainSelector;
