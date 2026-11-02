import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

export const PestAlertsPage = () => {
  const { t } = useTranslation();

  const [alerts, setAlerts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [formData, setFormData] = useState({
    farm: '',
    crop: '',
    pestOrDiseaseName: '',
    severity: 'Moderate',
    description: '',
    symptoms: '',
    source: 'Farmer Observation',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, farmsRes, cropsRes] = await Promise.all([
        api.get('/pest-alerts'),
        api.get('/farms'),
        api.get('/crops'),
      ]);
      if (alertsRes.data?.success) setAlerts(alertsRes.data.alerts || []);
      if (farmsRes.data?.success) setFarms(farmsRes.data.farms || []);
      if (cropsRes.data?.success) setCrops(cropsRes.data.crops || []);
    } catch (err) {
      setError(err.message || 'Error loading pest observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setFormData({
      farm: farms[0]?._id || '',
      crop: crops[0]?._id || '',
      pestOrDiseaseName: '',
      severity: 'Moderate',
      description: '',
      symptoms: '',
      source: 'Farmer Observation',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const symptomsList = formData.symptoms
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await api.post('/pest-alerts', {
        ...formData,
        symptoms: symptomsList,
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to submit pest observation.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/pest-alerts/${id}`, { status });
      fetchData();
    } catch (err) {
      setError(err.message || 'Error updating status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this observation log?')) return;
    try {
      await api.delete(`/pest-alerts/${id}`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete alert.');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    const matchesSeverity = severityFilter ? a.severity === severityFilter : true;
    return matchesStatus && matchesSeverity;
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('nav.pest')}</h2>
          <p className="text-muted small mb-0">Record biological pathogen sightings, severity ratings & access safe IPM protocols</p>
        </div>
        <button
          className="btn btn-forest px-3 shadow-sm"
          onClick={openCreateModal}
          disabled={farms.length === 0}
        >
          <i className="bi bi-plus-circle me-2"></i> Log Pest Sighting
        </button>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {/* Advisory Banner */}
      <div className="card card-agro p-3 bg-light border-0 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle bg-white p-2 text-warning shadow-sm">
            <i className="bi bi-info-circle-fill fs-4 text-warning"></i>
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark small">Integrated Pest Management (IPM) & Extension Advisory</h6>
            <p className="mb-0 text-muted small">
              Our recommendations promote biological agents (Neem, Trichoderma, pheromone traps) before chemical interventions. For uncertain symptoms or widespread epidemics, consult your local district Krishi Vigyan Kendra (KVK).
            </p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card card-agro p-3 mb-4 border-0 shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses (Active, Under Control, Resolved)</option>
              <option value="Active">Active</option>
              <option value="Under Control">Under Control</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-6">
            <select
              className="form-select form-select-sm"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div className="row g-4">
          {[1, 2].map((n) => (
            <div key={n} className="col-md-6">
              <div className="card card-agro p-4 skeleton" style={{ height: '240px' }}></div>
            </div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card card-agro p-5 text-center bg-white border-0 shadow-sm">
          <span className="fs-1 d-block mb-3">🛡️</span>
          <h5 className="fw-bold text-forest">No Active Pest Threats</h5>
          <p className="text-muted small mb-3">Your recorded fields currently report healthy vegetation and no critical pest observations.</p>
          {farms.length > 0 && (
            <button className="btn btn-forest px-4 mx-auto" onClick={openCreateModal}>
              Record Observation
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {filteredAlerts.map((a) => (
            <div key={a._id} className="col-lg-6">
              <div className="card card-agro h-100 p-4 border-0 shadow-sm d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span
                      className={`badge px-2 py-1 small fw-semibold ${
                        a.severity === 'Critical'
                          ? 'bg-danger text-white'
                          : a.severity === 'High'
                          ? 'bg-warning text-dark'
                          : a.severity === 'Moderate'
                          ? 'bg-info text-dark'
                          : 'bg-secondary'
                      }`}
                    >
                      {a.severity} Severity
                    </span>

                    <div className="btn-group btn-group-sm">
                      <select
                        className="form-select form-select-sm py-0"
                        style={{ fontSize: '0.75rem', width: 'auto' }}
                        value={a.status}
                        onChange={(e) => handleStatusChange(a._id, e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Under Control">Under Control</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <button
                        className="btn btn-sm btn-outline-danger ms-1"
                        onClick={() => handleDelete(a._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <h5 className="fw-bold text-forest mb-1">{a.pestOrDiseaseName}</h5>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-geo-alt text-danger me-1"></i>
                    {a.farm?.farmName} {a.crop ? `• Crop: ${a.crop.cropName}` : ''}
                  </p>

                  <p className="small text-dark mb-3">{a.description}</p>

                  {a.symptoms && a.symptoms.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted d-block fw-semibold mb-1">Identified Symptoms:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {a.symptoms.map((s, idx) => (
                          <span key={idx} className="badge bg-light text-dark border small">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {a.recommendedActions && a.recommendedActions.length > 0 && (
                    <div className="p-3 bg-mint-subtle rounded-3 border border-success-subtle mt-2">
                      <h6 className="fw-bold text-forest small mb-2">
                        <i className="bi bi-shield-check text-success me-1"></i>
                        Safe Integrated Pest Management (IPM) Guidance:
                      </h6>
                      <ul className="mb-0 small text-dark ps-3">
                        {a.recommendedActions.slice(0, 3).map((act, i) => (
                          <li key={i} className="mb-1">{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top small text-muted">
                  <span>Source: {a.source}</span>
                  <span>Recorded: {new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Observation Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">Record Pest or Disease Sighting</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Affected Farm *</label>
                      <select
                        className="form-select"
                        required
                        value={formData.farm}
                        onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                      >
                        {farms.map((f) => (
                          <option key={f._id} value={f._id}>{f.farmName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Affected Crop (opt)</label>
                      <select
                        className="form-select"
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      >
                        <option value="">None / Farm-wide</option>
                        {crops.map((c) => (
                          <option key={c._id} value={c._id}>{c.cropName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold text-dark">Pest or Disease Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Aphids, Yellow Rust, Fruit Borer"
                        required
                        value={formData.pestOrDiseaseName}
                        onChange={(e) => setFormData({ ...formData, pestOrDiseaseName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-dark">Observed Severity</label>
                      <select
                        className="form-select"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Observed Symptoms (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Leaf yellowing, curled margins, white powder"
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-dark">Field Description & Details *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Describe location on the plant, percentage of canopy infected..."
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    Submit Observation & Get IPM Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
