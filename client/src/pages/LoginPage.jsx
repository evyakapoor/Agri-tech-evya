import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';
  const isSessionExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card card-agro p-4 shadow-sm border-0">
            <div className="text-center mb-4">
              <span className="fs-1">🌱</span>
              <h3 className="fw-bold text-forest mt-2">Welcome Back</h3>
              <p className="text-muted small">Sign in to manage your crops, soil health & farm operations</p>
            </div>

            {isSessionExpired && (
              <div className="alert alert-warning small py-2 d-flex align-items-center" role="alert">
                <i className="bi bi-clock-history me-2 fs-5"></i>
                Your session has expired. Please sign in again.
              </div>
            )}

            {error && (
              <div className="alert alert-danger small py-2 d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="farmer@agritech.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-semibold text-dark mb-1">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-light border border-start-0 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-forest w-100 py-2 fw-semibold mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Testing */}
            <div className="mt-4 pt-3 border-top">
              <small className="text-muted text-uppercase fw-bold d-block text-center mb-2" style={{ fontSize: '0.7rem' }}>
                Quick Demo Accounts
              </small>
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success flex-fill"
                  onClick={() => fillCredentials('farmer@agritech.com', 'Farmer@123456')}
                >
                  🌾 Farmer Demo
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary flex-fill"
                  onClick={() => fillCredentials('admin@agritech.com', 'Admin@123456')}
                >
                  🛡️ Admin Demo
                </button>
              </div>
            </div>

            <p className="text-center text-muted small mt-4 mb-0">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-forest fw-semibold text-decoration-none">
                Register Free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
