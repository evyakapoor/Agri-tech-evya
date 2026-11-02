import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

export const CropsPage = () => {
  const { t } = useTranslation();

  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    farm: '',
    cropName: '',
    variety: '',
    plantingDate: '',
    expectedHarvestDate: '',
    fieldArea: '',
    growthStage: 'Sowing',
    healthStatus: 'Good',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsRes, farmsRes] = await Promise.all([
        api.get('/crops'),
        api.get('/farms'),
      ]);
      if (cropsRes.data?.success) setCrops(cropsRes.data.crops || []);
      if (farmsRes.data?.success) setFarms(farmsRes.data.farms || []);
    } catch (err) {
      setError(err.message || 'Error loading crops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingCrop(null);
    setFormData({
      farm: farms[0]?._id || '',
      cropName: '',
      variety: '',
      plantingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fieldArea: '',
      growthStage: 'Sowing',
      healthStatus: 'Good',
      notes: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setFormData({
      farm: crop.farm?._id || crop.farm,
      cropName: crop.cropName,
      variety: crop.variety || '',
      plantingDate: crop.plantingDate ? new Date(crop.plantingDate).toISOString().split('T')[0] : '',
      expectedHarvestDate: crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toISOString().split('T')[0] : '',
      fieldArea: crop.fieldArea,
      growthStage: crop.growthStage || 'Sowing',
      healthStatus: crop.healthStatus || 'Good',
      notes: crop.notes || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      farm: formData.farm,
      cropName: formData.cropName,
      variety: formData.variety,
      plantingDate: formData.plantingDate,
      expectedHarvestDate: formData.expectedHarvestDate,
      fieldArea: parseFloat(formData.fieldArea),
      growthStage: formData.growthStage,
      healthStatus: formData.healthStatus,
      notes: formData.notes,
    };

    try {
      if (editingCrop) {
        await api.put(`/crops/${editingCrop._id}`, payload);
      } else {
        await api.post('/crops', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Error saving crop.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/crops/${id}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to remove crop.');
    }
  };

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(search.toLowerCase()) ||
      (crop.variety && crop.variety.toLowerCase().includes(search.toLowerCase()));
    const matchesFarm = farmFilter ? crop.farm?._id === farmFilter : true;
    const matchesStage = stageFilter ? crop.growthStage === stageFilter : true;
    return matchesSearch && matchesFarm && matchesStage;
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('crops.title')}</h2>
          <p className="text-muted small mb-0">Track planting dates, phenological stages, and projected harvest windows</p>
        </div>
        <button
          className="btn btn-forest px-3 shadow-sm"
          onClick={openCreateModal}
          disabled={farms.length === 0}
        >
          <i className="bi bi-plus-circle me-2"></i> {t('crops.addNew')}
        </button>
      </div>

      {farms.length === 0 && !loading && (
        <div className="alert alert-warning small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-info-circle-fill me-2 fs-5"></i>
          Please register at least one farm first before adding crops.
        </div>
      )}

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card card-agro p-3 mb-4 border-0 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search crop or variety..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
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
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="">All Growth Stages</option>
              <option value="Sowing">Sowing</option>
              <option value="Germination">Germination</option>
              <option value="Vegetative">Vegetative</option>
              <option value="Flowering">Flowering</option>
              <option value="Fruiting">Fruiting</option>
              <option value="Maturity">Maturity</option>
              <option value="Harvested">Harvested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crops Table */}
      {loading ? (
        <div className="card card-agro p-5 skeleton" style={{ height: '300px' }}></div>
      ) : filteredCrops.length === 0 ? (
        <div className="card card-agro p-5 text-center bg-white border-0 shadow-sm">
          <span className="fs-1 d-block mb-3">🌾</span>
          <h5 className="fw-bold text-forest">No Crops Found</h5>
          <p className="text-muted small mb-3">
            {crops.length === 0
              ? 'Start by recording your active crop cycle to unlock smart growth stage recommendations.'
              : 'No crops match the selected filter criteria.'}
          </p>
          {farms.length > 0 && crops.length === 0 && (
            <button className="btn btn-forest px-4 mx-auto" onClick={openCreateModal}>
              Register Your First Crop
            </button>
          )}
        </div>
      ) : (
        <div className="card card-agro border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover table-agro align-middle mb-0">
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Farm</th>
                  <th>Growth Stage</th>
                  <th>Area</th>
                  <th>Health Status</th>
                  <th>Harvest Target</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="fw-bold text-forest">{c.cropName}</div>
                      <small className="text-muted">{c.variety || 'Standard Variety'}</small>
                    </td>
                    <td>
                      <span className="small text-dark fw-semibold">{c.farm?.farmName || 'Farm'}</span>
                    </td>
                    <td>
                      <span
                        className={`badge px-2 py-1 small fw-semibold ${
                          c.growthStage === 'Flowering'
                            ? 'bg-warning text-dark'
                            : c.growthStage === 'Fruiting'
                            ? 'bg-info text-dark'
                            : c.growthStage === 'Maturity'
                            ? 'bg-primary'
                            : c.growthStage === 'Harvested'
                            ? 'bg-secondary'
                            : 'bg-success'
                        }`}
                      >
                        {c.growthStage}
                      </span>
                    </td>
                    <td>
                      <span className="small text-dark fw-semibold">{c.fieldArea} Acres</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.healthStatus === 'Excellent' || c.healthStatus === 'Good'
                            ? 'bg-success-subtle text-success'
                            : 'bg-warning-subtle text-warning'
                        }`}
                      >
                        {c.healthStatus}
                      </span>
                    </td>
                    <td>
                      <span className="small text-dark fw-semibold">
                        {new Date(c.expectedHarvestDate).toLocaleDateString()}
                      </span>
                      <small className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                        Planted: {new Date(c.plantingDate).toLocaleDateString()}
                      </small>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => openEditModal(c)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => setDeleteConfirmId(c._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">
                  {editingCrop ? 'Edit Crop Record' : 'Register New Crop'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Target Farm *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.farm}
                      onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                    >
                      {farms.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.farmName} ({f.totalArea} {f.areaUnit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold text-dark">Crop Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Wheat, Basmati Rice"
                        required
                        value={formData.cropName}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-dark">Variety / Cultivar</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. HD-2967"
                        value={formData.variety}
                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Planting Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.plantingDate}
                        onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Expected Harvest Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.expectedHarvestDate}
                        onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Area (Acres) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="form-control"
                        required
                        value={formData.fieldArea}
                        onChange={(e) => setFormData({ ...formData, fieldArea: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Growth Stage</label>
                      <select
                        className="form-select"
                        value={formData.growthStage}
                        onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                      >
                        <option value="Sowing">Sowing</option>
                        <option value="Germination">Germination</option>
                        <option value="Vegetative">Vegetative</option>
                        <option value="Flowering">Flowering</option>
                        <option value="Fruiting">Fruiting</option>
                        <option value="Maturity">Maturity</option>
                        <option value="Harvested">Harvested</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Health Status</label>
                      <select
                        className="form-select"
                        value={formData.healthStatus}
                        onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Stressed">Stressed</option>
                        <option value="Diseased">Diseased</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-dark">Notes / Observations</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Add any soil moisture or seed treatment notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    {editingCrop ? 'Update Crop' : 'Save Crop'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-body text-center p-4">
                <i className="bi bi-trash text-danger display-4 d-block mb-3"></i>
                <h5 className="fw-bold text-dark">Delete Crop Entry?</h5>
                <p className="text-muted small">
                  {t('common.confirmDelete')}
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
