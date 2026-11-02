import React from 'react';

export const StatCard = ({ title, value, icon, color = 'success', subtitle, badgeText }) => {
  return (
    <div className="card card-stat shadow-sm border-0 h-100">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted small fw-semibold text-uppercase tracking-wider">{title}</span>
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center bg-${color}-subtle text-${color}`}
            style={{ width: '42px', height: '42px' }}
          >
            <i className={`bi bi-${icon} fs-5`}></i>
          </div>
        </div>
        <div className="d-flex align-items-baseline justify-content-between">
          <h3 className="mb-0 fw-bold text-dark">{value}</h3>
          {badgeText && (
            <span className={`badge bg-${color}-subtle text-${color} rounded-pill px-2 py-1 small fw-semibold`}>
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && <p className="text-muted small mb-0 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};
