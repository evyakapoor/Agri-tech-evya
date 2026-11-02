import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

export const NotificationsPage = () => {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      setError(err.message || 'Error loading notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('nav.notifications')}</h2>
          <p className="text-muted small mb-0">System alerts, agronomy replies, order status changes, and critical pest updates</p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button className="btn btn-sm btn-outline-forest" onClick={handleMarkAllAsRead}>
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card card-agro p-4 skeleton" style={{ height: '80px' }}></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card card-agro p-5 text-center bg-white border-0 shadow-sm">
          <i className="bi bi-bell-slash fs-1 d-block mb-3 text-secondary opacity-50"></i>
          <h5 className="fw-bold text-forest">No Notifications</h5>
          <p className="text-muted small">You are fully caught up with all farm notices and expert responses.</p>
        </div>
      ) : (
        <div className="card card-agro border-0 shadow-sm overflow-hidden">
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`list-group-item p-3 d-flex flex-wrap justify-content-between align-items-center gap-2 ${
                  !n.read ? 'bg-mint-subtle' : ''
                }`}
              >
                <div className="d-flex align-items-start gap-3">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center p-2 text-white ${
                      n.type === 'Pest Alert'
                        ? 'bg-danger'
                        : n.type === 'Consultation Reply'
                        ? 'bg-success'
                        : n.type === 'Order Update'
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }`}
                    style={{ width: '38px', height: '38px' }}
                  >
                    <i
                      className={`bi ${
                        n.type === 'Pest Alert'
                          ? 'bi-shield-exclamation'
                          : n.type === 'Consultation Reply'
                          ? 'bi-chat-dots'
                          : n.type === 'Order Update'
                          ? 'bi-box-seam'
                          : 'bi-bell'
                      } fs-6`}
                    ></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0 fw-bold text-dark small">{n.title}</h6>
                      <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                        {n.type}
                      </span>
                      {!n.read && (
                        <span className="badge bg-success" style={{ fontSize: '0.6rem' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mb-1 text-muted small mt-1">{n.message}</p>
                    <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 ms-auto">
                  {n.link && (
                    <Link to={n.link} className="btn btn-sm btn-outline-forest py-1 px-3">
                      View
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      className="btn btn-sm btn-light border py-1 px-2"
                      title="Mark as read"
                      onClick={() => handleMarkAsRead(n._id)}
                    >
                      <i className="bi bi-check2"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
