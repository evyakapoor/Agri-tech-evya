import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../api/client.js';

export const SoilAnalysisPage = () => {
  const { t } = useTranslation();

  const [reports, setReports] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [formData, setFormData] = useState({
    farm: '',
    crop: '',
    pH: '6.8',
    nitrogen: '250',
    phosphorus: '22',
    potassium: '200',
    moisture: '45',
    organicMatter: '1.8',
    sourceOfMeasurements: 'manual',
    laboratoryName: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, farmsRes, cropsRes] = await Promise.all([
        api.get('/soil-reports'),
        api.get('/farms'),
        api.get('/crops'),
      ]);
      if (reportsRes.data?.success) {
        setReports(reportsRes.data.reports || []);
        if (reportsRes.data.reports?.length > 0) {
          setSelectedReport(reportsRes.data.reports[0]);
        }
      }
      if (farmsRes.data?.success) setFarms(farmsRes.data.farms || []);
      if (cropsRes.data?.success) setCrops(cropsRes.data.crops || []);
    } catch (err) {
      setError(err.message || 'Error fetching soil analysis.');
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
      pH: '6.8',
      nitrogen: '250',
      phosphorus: '22',
      potassium: '200',
      moisture: '45',
      organicMatter: '1.8',
      sourceOfMeasurements: 'manual',
      laboratoryName: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phVal = parseFloat(formData.pH);
    if (phVal < 0 || phVal > 14) {
      setError('pH must be between 0 and 14.');
      return;
    }

    try {
      const res = await api.post('/soil-reports', {
        ...formData,
        pH: phVal,
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        moisture: parseFloat(formData.moisture),
        organicMatter: parseFloat(formData.organicMatter),
      });

      if (res.data?.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Failed to save soil test report.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this soil report?')) return;
    try {
      await api.delete(`/soil-reports/${id}`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete report.');
    }
  };

  // NPK Comparison Data for Chart
  const chartData = reports.slice(0, 5).map((r) => ({
    name: r.farm?.farmName || 'Farm',
    Nitrogen: r.nitrogen,
    Phosphorus: r.phosphorus,
    Potassium: r.potassium,
    Moisture: r.moisture,
  }));

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('soil.title')}</h2>
          <p className="text-muted small mb-0">Record chemical macronutrients, soil pH, field moisture & view rule-based agronomic advice</p>
        </div>
        <button
          className="btn btn-forest px-3 shadow-sm"
          onClick={openCreateModal}
          disabled={farms.length === 0}
        >
          <i className="bi bi-plus-circle me-2"></i> {t('soil.logTest')}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {/* Top Banner Notice explaining source verification */}
      <div className="card card-agro p-3 bg-light border-0 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle bg-white p-2 text-success shadow-sm">
            <i className="bi bi-shield-check fs-4"></i>
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark small">Agronomic Measurement Provenance Guarantee</h6>
            <p className="mb-0 text-muted small">
              Our system explicitly segregates <span className="badge bg-primary">Laboratory Certified</span> results from{' '}
              <span className="badge bg-secondary">Manual Farmer Observations</span> and <span className="badge bg-info text-dark">Simulated Demo Data</span> to maintain analytical integrity.
            </p>
          </div>
        </div>
      </div>

      {/* NPK Visual Chart */}
      {reports.length > 0 && (
        <div className="card card-agro p-4 border-0 shadow-sm mb-4">
          <h5 className="fw-bold text-forest mb-3">Macronutrient Profile (N-P-K in kg/ha)</h5>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Nitrogen" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Phosphorus" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Potassium" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Recommendations & Table */}
      <div className="row g-4 mb-4">
        {/* Selected Soil Test Advisory */}
        <div className="col-lg-5">
          <div className="card card-agro p-4 border-0 shadow-sm h-100">
            <h5 className="fw-bold text-forest mb-3">
              <i className="bi bi-clipboard2-pulse me-2 text-success"></i>
              Agronomic Advisory
            </h5>

            {selectedReport ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                  <div>
                    <span className="fw-bold text-dark small">{selectedReport.farm?.farmName}</span>
                    <small className="d-block text-muted">{new Date(selectedReport.testDate).toLocaleDateString()}</small>
                  </div>
                  <span
                    className={`badge ${
                      selectedReport.sourceOfMeasurements === 'laboratory' ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    {selectedReport.sourceOfMeasurements === 'laboratory'
                      ? `Lab: ${selectedReport.laboratoryName || 'Certified'}`
                      : 'Manual Entry'}
                  </span>
                </div>

                <div className="row g-2 mb-3 text-center small">
                  <div className="col-4 p-2 bg-mint-subtle rounded">
                    <span className="d-block fw-bold text-forest fs-5">{selectedReport.pH}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>pH Balance</span>
                  </div>
                  <div className="col-4 p-2 bg-mint-subtle rounded">
                    <span className="d-block fw-bold text-forest fs-5">{selectedReport.moisture}%</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Soil Moisture</span>
                  </div>
                  <div className="col-4 p-2 bg-mint-subtle rounded">
                    <span className="d-block fw-bold text-forest fs-5">{selectedReport.organicMatter}%</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Organic Carbon</span>
                  </div>
                </div>

                <h6 className="fw-bold text-dark small mb-2">Rule-Based Extension Recommendations:</h6>
                <div className="d-flex flex-column gap-2">
                  {selectedReport.recommendations?.map((rec, i) => (
                    <div key={i} className="p-2 bg-light border-start border-3 border-success rounded small text-dark">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted small">Select a report from the table to view its agronomic advisory.</p>
            )}
          </div>
        </div>

        {/* Soil Reports History Table */}
        <div className="col-lg-7">
          <div className="card card-agro p-4 border-0 shadow-sm h-100">
            <h5 className="fw-bold text-forest mb-3">Historical Soil Logs</h5>

            {reports.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-moisture fs-1 d-block mb-2 text-secondary opacity-50"></i>
                <p className="small mb-2">No soil measurements saved yet.</p>
                {farms.length > 0 && (
                  <button className="btn btn-sm btn-forest" onClick={openCreateModal}>
                    Record First Test
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-agro align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Farm</th>
                      <th>pH</th>
                      <th>N-P-K</th>
                      <th>Source</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r._id}
                        className={selectedReport?._id === r._id ? 'table-active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedReport(r)}
                      >
                        <td className="small text-secondary">{new Date(r.testDate).toLocaleDateString()}</td>
                        <td className="fw-semibold text-dark small">{r.farm?.farmName || 'Farm'}</td>
                        <td className="fw-bold text-forest">{r.pH}</td>
                        <td className="small">{r.nitrogen} - {r.phosphorus} - {r.potassium}</td>
                        <td>
                          <span
                            className={`badge ${
                              r.sourceOfMeasurements === 'laboratory'
                                ? 'bg-primary'
                                : r.sourceOfMeasurements === 'simulated_demo'
                                ? 'bg-info text-dark'
                                : 'bg-secondary'
                            }`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {r.sourceOfMeasurements}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger py-0 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(r._id);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Soil Test Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">Record Soil Health Test</h5>
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
                          {f.farmName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Measurement Source</label>
                      <select
                        className="form-select"
                        value={formData.sourceOfMeasurements}
                        onChange={(e) => setFormData({ ...formData, sourceOfMeasurements: e.target.value })}
                      >
                        <option value="manual">Manual / Handheld Sensor</option>
                        <option value="laboratory">Certified Soil Laboratory</option>
                        <option value="simulated_demo">Simulated Demo Data</option>
                      </select>
                    </div>
                    {formData.sourceOfMeasurements === 'laboratory' && (
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark">Laboratory Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. State Agricultural Lab"
                          value={formData.laboratoryName}
                          onChange={(e) => setFormData({ ...formData, laboratoryName: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">pH (0 - 14) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        className="form-control"
                        required
                        value={formData.pH}
                        onChange={(e) => setFormData({ ...formData, pH: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Moisture (%) *</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        className="form-control"
                        required
                        value={formData.moisture}
                        onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Organic Matter (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="form-control"
                        value={formData.organicMatter}
                        onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-2">
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-dark">Nitrogen (N)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="kg/ha"
                        required
                        value={formData.nitrogen}
                        onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-dark">Phosphorus (P)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="kg/ha"
                        required
                        value={formData.phosphorus}
                        onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-dark">Potassium (K)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="kg/ha"
                        required
                        value={formData.potassium}
                        onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    Save & Generate Recommendations
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
