import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LandingPage = () => {
  const { t } = useTranslation();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-5 bg-mint-subtle border-bottom">
        <div className="container py-lg-4">
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold mb-3">
                🌱 Precision Agriculture & IoT Farm Intelligence
              </span>
              <h1 className="display-4 fw-extrabold text-forest tracking-tight mb-3">
                Empowering Farmers with <span className="text-success">Data-Driven</span> Crop Intelligence.
              </h1>
              <p className="lead text-muted mb-4">
                Agri-Tech bridges ground-level agronomy and intelligent software. Track crop lifecycles, monitor precision soil chemistry, receive IPM pest alerts, and order certified farm inputs — all in one unified platform.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-forest btn-lg px-4 shadow-sm">
                  Start Managing Your Farm <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/login" className="btn btn-outline-forest btn-lg px-4">
                  Sign In to Dashboard
                </Link>
              </div>
              <div className="d-flex align-items-center gap-4 mt-4 pt-2 text-muted small">
                <span><i className="bi bi-check-circle-fill text-success me-1"></i> Multi-farm support</span>
                <span><i className="bi bi-check-circle-fill text-success me-1"></i> Transparent soil diagnostics</span>
                <span><i className="bi bi-check-circle-fill text-success me-1"></i> English & Hindi</span>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop"
                  alt="Modern Smart Farm"
                  className="img-fluid rounded-4 shadow-lg border"
                  style={{ objectFit: 'cover', maxHeight: '420px', width: '100%' }}
                />
                <div
                  className="position-absolute bottom-0 start-0 m-3 p-3 bg-white rounded-3 shadow-sm border d-flex align-items-center gap-3"
                  style={{ maxWidth: '280px' }}
                >
                  <div className="rounded-circle bg-success text-white p-2">
                    <i className="bi bi-shield-check fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark small">Verified Agronomy</h6>
                    <small className="text-muted">Rule-based Soil NPK diagnostics</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="row text-center gy-3">
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-forest mb-0">15,000+</h3>
              <small className="text-muted text-uppercase fw-semibold">Acres Digitized</small>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-forest mb-0">99.2%</h3>
              <small className="text-muted text-uppercase fw-semibold">Harvest Accuracy</small>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-forest mb-0">30%</h3>
              <small className="text-muted text-uppercase fw-semibold">Fertilizer Waste Saved</small>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-forest mb-0">24 / 7</h3>
              <small className="text-muted text-uppercase fw-semibold">Agronomist Advisory</small>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-5 bg-light">
        <div className="container py-lg-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-success fw-bold text-uppercase small tracking-wider">Comprehensive Ecosystem</span>
            <h2 className="fw-bold text-forest mt-1">Everything You Need for High-Yield Precision Farming</h2>
            <p className="text-muted">Built from the ground up for individual growers, cooperatives, and commercial farming enterprises.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card card-agro h-100 p-3">
                <div className="rounded-3 bg-mint-subtle text-forest p-3 d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-flower1 fs-3"></i>
                </div>
                <h5 className="fw-bold text-forest">Crop Lifecycle Tracking</h5>
                <p className="text-muted small">
                  Monitor every phase from sowing to maturity. Track estimated harvest dates, record variety parameters, and view stage-specific advisories.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-agro h-100 p-3">
                <div className="rounded-3 bg-mint-subtle text-forest p-3 d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-moisture fs-3"></i>
                </div>
                <h5 className="fw-bold text-forest">Precision Soil Chemistry</h5>
                <p className="text-muted small">
                  Save laboratory and manual soil test measurements. Receive automated, rule-based agronomic recommendations for N-P-K, pH correction, and organic matter.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-agro h-100 p-3">
                <div className="rounded-3 bg-mint-subtle text-forest p-3 d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-cloud-sun fs-3"></i>
                </div>
                <h5 className="fw-bold text-forest">Hyper-Local Weather Forecast</h5>
                <p className="text-muted small">
                  Integrated with live meteorological providers. View 5-day precipitation probabilities, wind speeds, and temperature windows to time field operations.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-agro h-100 p-3">
                <div className="rounded-3 bg-mint-subtle text-forest p-3 d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-shield-exclamation fs-3"></i>
                </div>
                <h5 className="fw-bold text-forest">IPM Pest & Disease Alerts</h5>
                <p className="text-muted small">
                  Log symptoms, track severity, and access verified Integrated Pest Management protocols using safe biological controls before resorting to chemicals.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-agro h-100 p-3">
                <div className="rounded-3 bg-mint-subtle text-forest p-3 d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-shop fs-3"></i>
                </div>
                <h5 className="fw-bold text-forest">Agricultural Marketplace</h5>
                <p className="text-muted small">
                  Browse certified seed cultivars, bio-fertilizers, irrigation kits, and tools with verified atomic inventory management and Cash on Delivery fulfillment.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-agro h-100 p-3">
                <div className="rounded-3 bg-mint-subtle text-forest p-3 d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-chat-heart fs-3"></i>
                </div>
                <h5 className="fw-bold text-forest">Expert Agronomist Q&A</h5>
                <p className="text-muted small">
                  Direct inquiry submission to agricultural researchers and agronomists. Get transparent, documented answers for difficult crop health questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-5 bg-white border-top">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="text-success fw-bold text-uppercase small">Simple Onboarding</span>
            <h2 className="fw-bold text-forest mt-1">Get Started in 3 Simple Steps</h2>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <div className="rounded-circle bg-forest text-white fw-bold d-inline-flex align-items-center justify-content-center mb-3 fs-4" style={{ width: '56px', height: '56px' }}>
                  1
                </div>
                <h5 className="fw-bold text-dark">Register Your Farm</h5>
                <p className="text-muted small">Enter your farm location, acreage, soil classification, and irrigation setup.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="rounded-circle bg-forest text-white fw-bold d-inline-flex align-items-center justify-content-center mb-3 fs-4" style={{ width: '56px', height: '56px' }}>
                  2
                </div>
                <h5 className="fw-bold text-dark">Add Your Crops & Soil Data</h5>
                <p className="text-muted small">Log active plantings, growth stages, and record soil health measurements.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="rounded-circle bg-forest text-white fw-bold d-inline-flex align-items-center justify-content-center mb-3 fs-4" style={{ width: '56px', height: '56px' }}>
                  3
                </div>
                <h5 className="fw-bold text-dark">Harvest Data & Insights</h5>
                <p className="text-muted small">Receive automatic recommendations, weather updates, and manage your daily activities.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link to="/register" className="btn btn-forest px-4 py-2">
              Create Your Free Account Now
            </Link>
          </div>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section className="py-5 bg-light border-top">
        <div className="container py-lg-4">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6">
              <h2 className="fw-bold text-forest mb-3">Questions about Agri-Tech?</h2>
              <p className="text-muted mb-4">
                Our support team and certified agricultural extension officers are here to help farmers, agri-enterprises, and researchers get the most out of smart agriculture.
              </p>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-white border p-2 text-success shadow-sm">
                    <i className="bi bi-geo-alt fs-5"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark small">Regional Headquarters</h6>
                    <small className="text-muted">Pusa Agricultural Research Center, New Delhi, India</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-white border p-2 text-success shadow-sm">
                    <i className="bi bi-envelope fs-5"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark small">Email Inquiries</h6>
                    <small className="text-muted">support@agritech-evya.org</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-white border p-2 text-success shadow-sm">
                    <i className="bi bi-telephone fs-5"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark small">Farmer Helpdesk Hotline</h6>
                    <small className="text-muted">+91 1800 233 4567 (Toll-Free, 9 AM - 6 PM)</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-agro p-4 shadow-sm border-0">
                <h5 className="fw-bold text-forest mb-3">Send Us a Direct Message</h5>
                {contactSubmitted ? (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <i className="bi bi-check-circle-fill fs-4 me-2"></i>
                    <div>
                      <strong>Thank you!</strong> Your message has been received. Our extension officer will contact you shortly.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Farmer Ramesh"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="ramesh@example.com"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Message / Question</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Tell us about your farm or ask an agronomy question..."
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-forest w-100 py-2">
                      Send Inquiries
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
