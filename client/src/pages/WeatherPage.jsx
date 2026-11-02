import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

export const WeatherPage = () => {
  const { t } = useTranslation();

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await api.get('/farms');
        if (res.data?.success && res.data.farms?.length > 0) {
          setFarms(res.data.farms);
          setSelectedFarmId(res.data.farms[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarms();
  }, []);

  const fetchWeather = async (farmId, forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const url = farmId
        ? `/weather?farmId=${farmId}${forceRefresh ? '&forceRefresh=true' : ''}`
        : `/weather${forceRefresh ? '?forceRefresh=true' : ''}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setWeather(res.data.weather);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve meteorological data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedFarmId);
  }, [selectedFarmId]);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('nav.weather')}</h2>
          <p className="text-muted small mb-0">Micro-climate meteorological forecasting, rain probability & agricultural spray conditions</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {farms.length > 0 && (
            <select
              className="form-select form-select-sm"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              style={{ width: '220px' }}
            >
              <option value="">Default Region</option>
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.farmName} ({f.address})
                </option>
              ))}
            </select>
          )}

          <button
            className="btn btn-sm btn-outline-forest"
            onClick={() => fetchWeather(selectedFarmId, true)}
            disabled={refreshing || loading}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${refreshing ? 'spin' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card card-agro p-5 skeleton" style={{ height: '350px' }}></div>
      ) : weather ? (
        <div>
          {/* Main Weather Card */}
          <div className="card card-agro p-4 border-0 shadow-sm mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-3">
              <div>
                <span className="badge bg-mint-subtle text-forest border border-success-subtle px-2 py-1 mb-2">
                  📍 {weather.locationName}
                </span>
                <h1 className="display-4 fw-bold text-dark mb-0">{weather.temperature}°C</h1>
                <p className="text-muted mb-0">
                  <span className="fw-semibold text-dark">{weather.weatherCondition}</span> — {weather.description}
                </p>
                <small className="text-muted">
                  Feels like {weather.feelsLike}°C • Min {weather.tempMin}°C / Max {weather.tempMax}°C
                </small>
              </div>

              <div className="text-end">
                <div className="mb-2">
                  {weather.isLiveFeed ? (
                    <span className="badge bg-success-subtle text-success border border-success p-2 small">
                      <i className="bi bi-broadcast me-1"></i> Live OpenWeather Provider
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-dark border border-warning p-2 small">
                      <i className="bi bi-info-circle me-1"></i> {weather.provider}
                    </span>
                  )}
                </div>
                <small className="d-block text-secondary" style={{ fontSize: '0.75rem' }}>
                  Snapshot Timestamp: {new Date(weather.forecastTimestamp || weather.createdAt).toLocaleString()}
                </small>
                <small className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                  Freshness: <span className="fw-semibold">{weather.dataFreshness}</span>
                </small>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="row g-3 text-center border-top pt-4">
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <i className="bi bi-droplet-half text-primary fs-3 d-block mb-1"></i>
                  <span className="d-block fw-bold fs-5 text-dark">{weather.humidity}%</span>
                  <span className="text-muted small">Relative Humidity</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <i className="bi bi-cloud-rain text-info fs-3 d-block mb-1"></i>
                  <span className="d-block fw-bold fs-5 text-dark">{weather.rainfall} mm</span>
                  <span className="text-muted small">Precipitation Volume</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <i className="bi bi-wind text-secondary fs-3 d-block mb-1"></i>
                  <span className="d-block fw-bold fs-5 text-dark">{weather.windSpeed} km/h</span>
                  <span className="text-muted small">Wind Speed ({weather.windDirection})</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <i className="bi bi-speedometer2 text-danger fs-3 d-block mb-1"></i>
                  <span className="d-block fw-bold fs-5 text-dark">{weather.pressure || 1012} hPa</span>
                  <span className="text-muted small">Atmospheric Pressure</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Extended Daily Forecast */}
          <div className="card card-agro p-4 border-0 shadow-sm mb-4">
            <h5 className="fw-bold text-forest mb-3">5-Day Agricultural Weather Forecast</h5>
            <div className="row g-3">
              {weather.forecast && weather.forecast.length > 0 ? (
                weather.forecast.map((f, i) => (
                  <div key={i} className="col">
                    <div className="card h-100 p-3 text-center bg-light border-0 shadow-sm rounded-3">
                      <span className="fw-bold text-dark small">{f.day}</span>
                      <small className="text-muted mb-2 d-block" style={{ fontSize: '0.7rem' }}>
                        {f.date}
                      </small>
                      <div className="fs-2 my-1">
                        {f.condition.includes('Rain') || f.condition.includes('Shower') ? '🌧️' : '⛅'}
                      </div>
                      <div className="fw-bold text-forest fs-6">
                        {f.tempMax}° / <span className="text-muted">{f.tempMin}°</span>
                      </div>
                      <div className="small text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                        <div>💧 {f.humidity}% humidity</div>
                        <div>☔ {f.rainProb}% rain prob</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted small">Extended daily forecast unavailable for this snapshot.</p>
              )}
            </div>
          </div>

          {/* Agricultural Spray & Field Work Windows */}
          <div className="card card-agro p-4 border-0 shadow-sm">
            <h5 className="fw-bold text-forest mb-2">
              <i className="bi bi-check2-circle text-success me-2"></i>
              Agricultural Advisory for Field Operations
            </h5>
            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <div className="p-3 bg-mint-subtle rounded-3 border border-success-subtle">
                  <h6 className="fw-bold text-forest small mb-1">Pesticide / Foliar Spray Window</h6>
                  <p className="small text-muted mb-0">
                    {weather.windSpeed < 15 && weather.rainfall === 0
                      ? 'Optimal conditions: Wind is under 15 km/h with no imminent rainfall. Safe for foliar applications.'
                      : 'Sub-optimal: Moderate winds or rain probability may lead to chemical drift or wash-off.'}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-mint-subtle rounded-3 border border-success-subtle">
                  <h6 className="fw-bold text-forest small mb-1">Evapotranspiration & Irrigation Need</h6>
                  <p className="small text-muted mb-0">
                    {weather.temperature > 28 && weather.humidity < 45
                      ? 'High evaporative demand detected. Recommended to irrigate during early morning or evening hours.'
                      : 'Moderate atmospheric moisture retention. Standard crop water requirement applies.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
