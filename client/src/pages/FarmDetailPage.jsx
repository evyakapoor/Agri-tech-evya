import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';

export const FarmDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('crops');

  useEffect(() => {
    const fetchFarmDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/farms/${id}`);
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load farm details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted small">Loading farm records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || 'Farm not found.'}
        <div className="mt-2">
          <Link to="/farms" className="btn btn-sm btn-outline-danger">Back to Farms</Link>
        </div>
      </div>
    );
  }

  const { farm, crops = [], soilReports = [], pestAlerts = [], activities = [] } = data;

  return (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 small">
              <li className="breadcrumb-item"><Link to="/farms" className="text-decoration-none text-forest">Farms</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{farm.farmName}</li>
            </ol>
          </nav>
          <h2 className="fw-bold text-forest mb-0">{farm.farmName}</h2>
          <p className="text-muted small mb-0">
            <i className="bi bi-geo-alt me-1 text-danger"></i> {farm.address}
          </p>
        </div>
        <Link to="/farms" className="btn btn-sm btn-outline-secondary">
          &larr; Back to Farms
        </Link>
      </div>

      {/* Farm Overview Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card card-agro p-3 bg-white border-0 shadow-sm text-center">
            <small className="text-muted text-uppercase fw-semibold">Acreage</small>
            <h4 className="fw-bold text-forest mt-1 mb-0">{farm.totalArea} {farm.areaUnit}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-agro p-3 bg-white border-0 shadow-sm text-center">
            <small className="text-muted text-uppercase fw-semibold">Soil Classification</small>
            <h4 className="fw-bold text-forest mt-1 mb-0">{farm.soilType}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-agro p-3 bg-white border-0 shadow-sm text-center">
            <small className="text-muted text-uppercase fw-semibold">Irrigation Type</small>
            <h4 className="fw-bold text-forest mt-1 mb-0">{farm.irrigationMethod}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-agro p-3 bg-white border-0 shadow-sm text-center">
            <small className="text-muted text-uppercase fw-semibold">Crops Cultivated</small>
            <h4 className="fw-bold text-forest mt-1 mb-0">{crops.length} Active</h4>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card card-agro border-0 shadow-sm p-4">
        <ul className="nav nav-pills mb-4 border-bottom pb-3 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'crops' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('crops')}
            >
              🌱 Active Crops ({crops.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'soil' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('soil')}
            >
              🧪 Soil Tests ({soilReports.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'pest' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('pest')}
            >
              🐛 Pest Alerts ({pestAlerts.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'activities' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('activities')}
            >
              📋 Activity History ({activities.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Crops */}
        {activeTab === 'crops' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-forest mb-0">Crops on this Plot</h6>
              <Link to="/crops" className="btn btn-sm btn-forest">Register Crop on this Farm</Link>
            </div>
            {crops.length === 0 ? (
              <p className="text-muted small py-3">No crops registered on this farm parcel yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-agro align-middle">
                  <thead>
                    <tr>
                      <th>Crop & Variety</th>
                      <th>Area</th>
                      <th>Stage</th>
                      <th>Health</th>
                      <th>Expected Harvest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <span className="fw-bold text-dark">{c.cropName}</span>
                          <small className="d-block text-muted">{c.variety || 'Standard'}</small>
                        </td>
                        <td>{c.fieldArea} {farm.areaUnit}</td>
                        <td><span className="badge bg-success-subtle text-success">{c.growthStage}</span></td>
                        <td><span className="badge bg-primary-subtle text-primary">{c.healthStatus}</span></td>
                        <td className="small text-secondary">{new Date(c.expectedHarvestDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Soil */}
        {activeTab === 'soil' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-forest mb-0">Soil Health Tests</h6>
              <Link to="/soil" className="btn btn-sm btn-forest">Record Soil Test</Link>
            </div>
            {soilReports.length === 0 ? (
              <p className="text-muted small py-3">No soil analysis reports recorded yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-agro align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>pH</th>
                      <th>NPK (kg/ha)</th>
                      <th>Moisture</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soilReports.map((s) => (
                      <tr key={s._id}>
                        <td>{new Date(s.testDate).toLocaleDateString()}</td>
                        <td className="fw-bold">{s.pH}</td>
                        <td className="small">{s.nitrogen}N - {s.phosphorus}P - {s.potassium}K</td>
                        <td>{s.moisture}%</td>
                        <td>
                          <span className={`badge ${s.sourceOfMeasurements === 'laboratory' ? 'bg-primary' : 'bg-secondary'}`}>
                            {s.sourceOfMeasurements}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pest */}
        {activeTab === 'pest' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-forest mb-0">Pest & Disease Observations</h6>
              <Link to="/pest-alerts" className="btn btn-sm btn-forest">Log Pest Observation</Link>
            </div>
            {pestAlerts.length === 0 ? (
              <p className="text-muted small py-3">No active pest observations on this parcel.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pestAlerts.map((p) => (
                  <div key={p._id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-bold text-dark mb-1">{p.pestOrDiseaseName}</h6>
                        <p className="small text-muted mb-2">{p.description}</p>
                      </div>
                      <span className={`badge ${p.severity === 'Critical' ? 'bg-danger' : p.severity === 'High' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                        {p.severity} Severity
                      </span>
                    </div>
                    {p.recommendedActions?.length > 0 && (
                      <div className="small text-forest bg-white p-2 rounded border mt-2">
                        <strong>Recommended IPM Action:</strong> {p.recommendedActions[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Activities */}
        {activeTab === 'activities' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-forest mb-0">Field Log Chronology</h6>
              <Link to="/activities" className="btn btn-sm btn-forest">Add Activity</Link>
            </div>
            {activities.length === 0 ? (
              <p className="text-muted small py-3">No activity logs recorded yet.</p>
            ) : (
              <div className="list-group list-group-flush">
                {activities.map((a) => (
                  <div key={a._id} className="list-group-item p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-success-subtle text-success me-2">{a.activityType}</span>
                      <span className="small text-dark fw-semibold">{a.description}</span>
                    </div>
                    <small className="text-muted">{new Date(a.date).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
