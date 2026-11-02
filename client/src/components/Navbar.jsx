import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { LanguageSwitcher } from './LanguageSwitcher.jsx';
import { NotificationDropdown } from './NotificationDropdown.jsx';

export const Navbar = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm py-2 px-3">
      <div className="container-fluid px-0">
        <div className="d-flex align-items-center">
          {isAuthenticated && (
            <button
              className="btn btn-outline-secondary d-lg-none me-2 py-1 px-2"
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
          )}

          <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-brand d-flex align-items-center text-forest fw-bold m-0 fs-4">
            <span className="me-2 fs-3">🌱</span>
            <span className="tracking-tight">Agri<span className="text-success">Tech</span></span>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              <NotificationDropdown />

              <div className="dropdown">
                <button
                  className="btn btn-light d-flex align-items-center gap-2 border py-1 px-2 rounded-pill shadow-sm"
                  type="button"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle bg-forest text-white fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="d-none d-md-inline fw-semibold text-dark small">
                    {user?.name}
                  </span>
                  <i className="bi bi-chevron-down small text-muted"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userMenuButton">
                  <li className="px-3 py-2 border-bottom">
                    <p className="mb-0 fw-bold small text-dark">{user?.name}</p>
                    <small className="text-muted">{user?.email}</small>
                    <span className="badge bg-success-subtle text-success text-capitalize ms-2">
                      {user?.role}
                    </span>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      <i className="bi bi-person me-2 text-secondary"></i> {t('nav.profile')}
                    </Link>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item py-2 text-primary" to="/admin">
                        <i className="bi bi-shield-check me-2"></i> {t('nav.admin')}
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> {t('nav.logout')}
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-outline-forest px-3">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-sm btn-forest px-3">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
