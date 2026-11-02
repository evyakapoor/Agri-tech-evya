import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    preferredLanguage: 'en',
    district: '',
    state: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        preferredLanguage: formData.preferredLanguage,
        location: {
          district: formData.district,
          state: formData.state,
          country: 'India',
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card card-agro p-4 shadow-sm border-0">
            <div className="text-center mb-4">
              <span className="fs-1">🌱</span>
              <h3 className="fw-bold text-forest mt-2">Join Agri-Tech</h3>
              <p className="text-muted small">Create an account to digitize and optimize your farm operations</p>
            </div>

            {error && (
              <div className="alert alert-danger small py-2 d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Ramesh Sharma"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="ramesh@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Mobile / Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Password * (min 6 characters)</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-control border-end-0"
                      placeholder="Create a strong password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
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

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">District / Region</label>
                  <input
                    type="text"
                    name="district"
                    className="form-control"
                    placeholder="e.g. Karnal"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="e.g. Haryana"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Preferred Interface Language</label>
                  <select
                    name="preferredLanguage"
                    className="form-select"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                  >
                    <option value="en">English (UK / US)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 text-muted small">
                <i className="bi bi-shield-check text-success me-1"></i>
                By registering, you gain free access to farmer crop monitoring and soil diagnostics.
              </div>

              <button
                type="submit"
                className="btn btn-forest w-100 py-2 fw-semibold mt-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>

            <p className="text-center text-muted small mt-4 mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-forest fw-semibold text-decoration-none">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
