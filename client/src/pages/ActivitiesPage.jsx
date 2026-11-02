import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

export const ActivitiesPage = () => {
  const { t } = useTranslation();

  const [activities, setActivities] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farm: '',
    crop: '',
    activityType: 'Irrigation',
    description: '',
    date: new Date().toISOString().split('T')[0],
    cost: '0',
  });

  const activityTypes = [
    'All',
    'Planting',
    'Irrigation',
    'Fertilization',
    'Spraying',
    'Soil Testing',
    'Inspection',
    'Weeding',
    'Harvesting',
    'Pruning',
    'Other',
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actRes, farmsRes, cropsRes] = await Promise.all([
        api.get('/activities'),
        api.get('/farms'),
        api.get('/crops'),
      ]);
      if (actRes.data?.success) setActivities(actRes.data.activities || []);
      if (farmsRes.data?.success) setFarms(farmsRes.data.farms || []);
      if (cropsRes.data?.success) setCrops(cropsRes.data.crops || []);
    } catch (err) {
      setError(err.message || 'Error loading activities.');
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
      crop: '',
      activityType: 'Irrigation',
      description: '',
      date: new Date().toISOString().split('T')[0],
      cost: '0',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/activities', {
        ...formData,
        cost: parseFloat(formData.cost || 0),
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to record farm activity.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity entry?')) return;
    try {
      await api.delete(`/activities/${id}`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete activity.');
    }
  };

  const filteredActivities = activities.filter((a) => {
    const matchesFarm = farmFilter ? a.farm?._id === farmFilter : true;
    const matchesType = typeFilter && typeFilter !== 'All' ? a.activityType === typeFilter : true;
    return matchesFarm && matchesType;
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('nav.activities')}</h2>
          <p className="text-muted small mb-0">Chronological farm operational journal: irrigation, fertilizing, weeding, and spraying</p>
        </div>

        <button
          className="btn btn-forest px-3 shadow-sm"
          onClick={openCreateModal}
          disabled={farms.length === 0}
        >
          <i className="bi bi-plus-circle me-2"></i> Log Activity
        </button>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card card-agro p-3 mb-4 border-0 shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <select
              className="form-select form-select-sm"
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
            >
              <option value="">All Farms</option>
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.farmName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Activity Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities Timeline */}
      {loading ? (
        <div className="card card-agro p-5 skeleton" style={{ height: '300px' }}></div>
      ) : filteredActivities.length === 0 ? (
        <div className="card card-agro p-5 text-center bg-white border-0 shadow-sm">
          <span className="fs-1 d-block mb-3">📋</span>
          <h5 className="fw-bold text-forest">No Operations Logged</h5>
          <p className="text-muted small mb-3">Keep a verified field journal of labor, irrigation runs, and fertilizer applications.</p>
          {farms.length > 0 && (
            <button className="btn btn-forest px-4 mx-auto" onClick={openCreateModal}>
              Record First Activity
            </button>
          )}
        </div>
      ) : (
        <div className="card card-agro border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-agro align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity Type</th>
                  <th>Farm & Crop</th>
                  <th>Operational Description</th>
                  <th>Cost (₹)</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => (
                  <tr key={act._id}>
                    <td className="small text-secondary fw-semibold">
                      {new Date(act.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success px-2 py-1 fw-semibold">
                        {act.activityType}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark small">{act.farm?.farmName || 'Farm'}</span>
                      {act.crop && <small className="text-muted d-block">{act.crop.cropName}</small>}
                    </td>
                    <td className="small text-dark">{act.description}</td>
                    <td className="small fw-semibold text-forest">
                      {act.cost > 0 ? `₹${act.cost}` : '—'}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => handleDelete(act._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">Log Field Operation</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Target Farm *</label>
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
                      <label className="form-label small fw-semibold text-dark">Associated Crop (opt)</label>
                      <select
                        className="form-select"
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      >
                        <option value="">General Field</option>
                        {crops.map((c) => (
                          <option key={c._id} value={c._id}>{c.cropName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Activity Category *</label>
                      <select
                        className="form-select"
                        value={formData.activityType}
                        onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                      >
                        <option value="Irrigation">Irrigation</option>
                        <option value="Fertilization">Fertilization</option>
                        <option value="Spraying">Foliar Spraying</option>
                        <option value="Planting">Planting / Sowing</option>
                        <option value="Soil Testing">Soil Sampling</option>
                        <option value="Weeding">Weeding & Tillage</option>
                        <option value="Harvesting">Harvesting</option>
                        <option value="Inspection">Canopy Inspection</option>
                        <option value="Other">Other Maintenance</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Date Completed *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Applied 45 kg neem-coated urea dissolved with irrigation cycle #2"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-dark">Associated Expense / Labor Cost (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    Save Activity Entry
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
