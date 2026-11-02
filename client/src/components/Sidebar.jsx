import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'grid-1x2' },
    { to: '/farms', label: t('nav.farms'), icon: 'geo-alt' },
    { to: '/crops', label: t('nav.crops'), icon: 'flower1' },
    { to: '/soil', label: t('nav.soil'), icon: 'moisture' },
    { to: '/weather', label: t('nav.weather'), icon: 'cloud-sun' },
    { to: '/pest-alerts', label: t('nav.pest'), icon: 'shield-exclamation' },
    { to: '/marketplace', label: t('nav.marketplace'), icon: 'shop' },
    { to: '/consultations', label: t('nav.consultations'), icon: 'chat-heart' },
    { to: '/community', label: t('nav.community'), icon: 'people' },
    { to: '/activities', label: t('nav.activities'), icon: 'journal-check' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
          style={{ zIndex: 90 }}
          onClick={onClose}
        />
      )}

      <aside className={`agro-sidebar ${isOpen ? 'show' : ''}`}>
        <div className="px-2 mb-3">
          <small className="text-uppercase text-muted fw-bold tracking-wider" style={{ fontSize: '0.7rem' }}>
            Smart Farm Management
          </small>
        </div>

        <nav className="nav flex-column mb-auto">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <i className={`bi bi-${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="px-2 mt-4 mb-2">
                <small className="text-uppercase text-danger fw-bold tracking-wider" style={{ fontSize: '0.7rem' }}>
                  Administration
                </small>
              </div>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `sidebar-nav-item text-danger ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <i className="bi bi-shield-lock"></i>
                <span>{t('nav.admin')}</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="mt-4 pt-3 border-top px-2">
          <div className="p-2 bg-light rounded-3 d-flex align-items-center">
            <span className="fs-4 me-2">🚜</span>
            <div className="overflow-hidden">
              <p className="mb-0 fw-bold small text-truncate">{user?.name}</p>
              <small className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>
                {user?.role}
              </small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
