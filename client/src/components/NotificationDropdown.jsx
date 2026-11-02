import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dropdown position-relative">
      <button
        className="btn btn-light position-relative rounded-circle p-2 shadow-sm border"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-expanded={isOpen}
      >
        <i className="bi bi-bell text-secondary fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown-menu dropdown-menu-end show shadow-lg border-0 p-0"
          style={{ width: '320px', maxHeight: '420px', overflowY: 'auto', zIndex: 1050 }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <h6 className="mb-0 fw-bold text-forest">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link text-decoration-none p-0 text-success fw-semibold"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="list-group list-group-flush">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">
                <i className="bi bi-bell-slash fs-3 d-block mb-1 text-secondary opacity-50"></i>
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <div
                  key={n._id}
                  className={`list-group-item list-group-item-action p-3 border-bottom ${
                    !n.read ? 'bg-mint-subtle' : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="badge bg-secondary rounded-pill small" style={{ fontSize: '0.65rem' }}>
                      {n.type}
                    </span>
                    {!n.read && (
                      <button
                        className="btn btn-sm p-0 text-muted ms-2"
                        title="Mark read"
                        onClick={(e) => handleMarkAsRead(n._id, e)}
                      >
                        <i className="bi bi-check2"></i>
                      </button>
                    )}
                  </div>
                  <h6 className="mb-1 fw-bold text-dark small">{n.title}</h6>
                  <p className="mb-1 text-muted small text-truncate-2" style={{ fontSize: '0.8rem' }}>
                    {n.message}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="text-decoration-none text-success small fw-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        View &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 text-center border-top bg-light">
            <Link
              to="/notifications"
              className="btn btn-sm btn-link text-decoration-none text-forest fw-semibold"
              onClick={() => setIsOpen(false)}
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
