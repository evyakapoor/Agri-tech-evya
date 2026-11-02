import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <div className="container-fluid px-4">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <span className="fw-bold text-forest me-2">🌱 Agri-Tech</span>
            <span className="text-muted small">
              © {new Date().getFullYear()} Agri-Tech Platform. Smart Precision Agriculture. All rights reserved.
            </span>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-inline-flex align-items-center gap-3 small text-muted">
              <span className="d-inline-flex align-items-center text-success">
                <span className="badge bg-success rounded-circle p-1 me-1"></span> Systems Operational
              </span>
              <Link to="/marketplace" className="text-decoration-none text-muted">Marketplace</Link>
              <Link to="/community" className="text-decoration-none text-muted">Community</Link>
              <Link to="/consultations" className="text-decoration-none text-muted">Agronomist Help</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
