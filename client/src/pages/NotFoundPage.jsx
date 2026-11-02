import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center my-auto">
      <div className="py-5">
        <span className="display-1 d-block mb-3">🌱</span>
        <h1 className="fw-bold text-forest">404 - Page Not Found</h1>
        <p className="text-muted lead mb-4">
          The requested page does not exist or has been moved to another field sector.
        </p>
        <Link to="/" className="btn btn-forest px-4 py-2">
          Return to Home
        </Link>
      </div>
    </div>
  );
};
