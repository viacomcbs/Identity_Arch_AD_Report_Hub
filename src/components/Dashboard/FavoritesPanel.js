import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './FavoritesPanel.css';

const sectionAccents = {
  '/users': '#2563eb',
  '/groups': '#2563eb',
  '/service-accounts': '#2563eb',
  '/contacts': '#2563eb',
  '/domain-controllers': '#059669',
  '/computers': '#059669',
  '/sites-subnets': '#059669',
  '/topology': '#059669',
  '/gpos': '#059669',
  '/containers': '#059669',
  '/printers': '#059669',
  '/compliance': '#0e7490',
  '/governance': '#0e7490',
  '/search': '#64748b',
  '/activity-logs': '#64748b',
  '/help': '#64748b',
  '/license': '#64748b',
};

const FavoritesPanel = () => {
  const { favorites, removeFavorite } = useApp();
  const navigate = useNavigate();

  return (
    <div className="fav-section">
      <div className="fav-header">
        <span className="fav-title">Favourites</span>
        <span className="fav-count">{favorites.length}</span>
      </div>
      {favorites.length === 0 ? (
        <div className="fav-empty">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>No favourites yet. Star any report card to pin it here.</span>
        </div>
      ) : (
        <div className="fav-grid">
          {favorites.map(fav => (
            <div
              key={fav.id}
              className="fav-card"
              style={{ '--fa': sectionAccents[fav.page] || 'var(--accent-primary)' }}
              onClick={() => navigate(fav.page)}
            >
              <div className="fav-card-label">{fav.label}</div>
              <div className="fav-card-page">{fav.page.replace('/', '')}</div>
              <button
                className="fav-card-remove"
                onClick={e => { e.stopPropagation(); removeFavorite(fav.page, fav.queryId); }}
                title="Remove"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;
