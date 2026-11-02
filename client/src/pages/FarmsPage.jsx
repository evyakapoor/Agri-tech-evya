import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

export const FarmsPage = () => {
  const { t } = useTranslation();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    farmName: '',
    address: '',
    region: '',
    totalArea: '',
    areaUnit: 'acres',
    soilType: 'Loamy',
    irrigationMethod: 'Drip',
    latitude: '',
    longitude: '',
  });

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farms');
      if (res.data?.success) {
        setFarms(res.data.farms || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch farms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const openCreateModal = () => {
    setEditingFarm(null);
    setFormData({
      farmName: '',
      address: '',
      region: '',
      totalArea: '',
      areaUnit: 'acres',
      soilType: 'Loamy',
      irrigationMethod: 'Drip',
      latitude: '',
      longitude: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFormData({
      farmName: farm.farmName,
      address: farm.address,
      region: farm.region || '',
      totalArea: farm.totalArea,
      areaUnit: farm.areaUnit || 'acres',
      soilType: farm.soilType || 'Loamy',
      irrigationMethod: farm.irrigationMethod || 'Drip',
      latitude: farm.coordinates?.latitude || '',
      longitude: farm.coordinates?.longitude || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      farmName: formData.farmName,
      address: formData.address,
      region: formData.region,
      totalArea: parseFloat(formData.totalArea),
      areaUnit: formData.areaUnit,
      soilType: formData.soilType,
      irrigationMethod: formData.irrigationMethod,
      coordinates: {
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      },
    };

    try {
      if (editingFarm) {
        await api.put(`/farms/${editingFarm._id}`, payload);
      } else {
        await api.post('/farms', payload);
      }
      setShowModal(false);
      fetchFarms();
    } catch (err) {
      setError(err.message || 'Error saving farm details.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/farms/${id}`);
      setDeleteConfirmId(null);
      fetchFarms();
    } catch (err) {
      setError(err.message || 'Failed to delete farm.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('farms.title')}</h2>
          <p className="text-muted small mb-0">Register, manage and inspect your agricultural parcels and irrigation setups</p>
        </div>
        <button className="btn btn-forest px-3 shadow-sm" onClick={openCreateModal}>
          <i className="bi bi-plus-circle me-2"></i> {t('farms.addNew')}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="row g-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="col-md-6 col-lg-4">
              <div className="card card-agro p-4 skeleton" style={{ height: '220px' }}></div>
            </div>
          ))}
        </div>
      ) : farms.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border card-agro p-5">
          <span className="fs-1 d-block mb-3">🚜</span>
          <h4 className="fw-bold text-forest">No Farms Registered Yet</h4>
          <p className="text-muted small mb-4">
            Add your primary agricultural plot to begin tracking crops, soil testing, and local weather.
          </p>
          <button className="btn btn-forest px-4" onClick={openCreateModal}>
            Register Your First Farm
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {farms.map((farm) => (
            <div key={farm._id} className="col-md-6 col-lg-4">
              <div className="card card-agro h-100 p-4 shadow-sm border-0 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-mint-subtle text-forest border border-success-subtle px-2 py-1 small">
                      {farm.soilType} Soil
                    </span>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-light border-0 p-1"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li>
                          <button className="dropdown-item small" onClick={() => openEditModal(farm)}>
                            <i className="bi bi-pencil me-2"></i> Edit Farm
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item small text-danger"
                            onClick={() => setDeleteConfirmId(farm._id)}
                          >
                            <i className="bi bi-trash me-2"></i> Delete Farm
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <h5 className="fw-bold text-forest mb-1">{farm.farmName}</h5>
                  <p className="text-muted small mb-3">
                    <i className="bi bi-geo-alt me-1 text-danger"></i>
                    {farm.address} {farm.region ? `(${farm.region})` : ''}
                  </p>

                  <div className="row g-2 mb-3 bg-light p-2 rounded-2 text-center small">
                    <div className="col-6 border-end">
                      <span className="d-block fw-bold text-dark">{farm.totalArea} {farm.areaUnit}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Total Area</span>
                    </div>
                    <div className="col-6">
                      <span className="d-block fw-bold text-dark">{farm.irrigationMethod}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Irrigation</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between small text-muted mb-2">
                    <span>Active Crops:</span>
                    <span className="badge bg-success-subtle text-success">{farm.cropCount || 0} Crops</span>
                  </div>
                </div>

                <div className="pt-3 border-top mt-3">
                  <Link to={`/farms/${farm._id}`} className="btn btn-sm btn-outline-forest w-100">
                    View Farm Operations &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">
                  {editingFarm ? 'Edit Farm Details' : 'Register New Farm'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Farm Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Green Valley Organic Agro"
                      required
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Address / Region *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Plot or Village Name, District"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold text-dark">Total Area *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        className="form-control"
                        placeholder="e.g. 15.5"
                        required
                        value={formData.totalArea}
                        onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-dark">Unit</label>
                      <select
                        className="form-select"
                        value={formData.areaUnit}
                        onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="bigha">Bigha</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Soil Classification</label>
                      <select
                        className="form-select"
                        value={formData.soilType}
                        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      >
                        <option value="Alluvial">Alluvial</option>
                        <option value="Black">Black Soil (Regur)</option>
                        <option value="Red">Red Soil</option>
                        <option value="Laterite">Laterite</option>
                        <option value="Loamy">Loamy</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Clayey">Clayey</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Irrigation Method</label>
                      <select
                        className="form-select"
                        value={formData.irrigationMethod}
                        onChange={(e) => setFormData({ ...formData, irrigationMethod: e.target.value })}
                      >
                        <option value="Drip">Drip Irrigation</option>
                        <option value="Sprinkler">Sprinkler</option>
                        <option value="Flood">Flood / Basin</option>
                        <option value="Rainfed">Rainfed</option>
                        <option value="Canal">Canal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Latitude (opt)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        placeholder="29.6857"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Longitude (opt)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        placeholder="76.9905"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    {editingFarm ? 'Update Farm' : 'Save Farm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-body text-center p-4">
                <i className="bi bi-exclamation-triangle text-danger display-4 d-block mb-3"></i>
                <h5 className="fw-bold text-dark">Delete Farm Record?</h5>
                <p className="text-muted small">
                  {t('common.confirmDelete')} Associated crops and test logs will also be permanently deleted.
                </p>
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <button className="btn btn-light px-4 border" onClick={() => setDeleteConfirmId(null)}>
                    {t('common.cancel')}
                  </button>
                  <button className="btn btn-danger px-4" onClick={() => handleDelete(deleteConfirmId)}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
