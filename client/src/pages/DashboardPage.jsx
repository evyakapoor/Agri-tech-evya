import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import api from '../api/client.js';
import { StatCard } from '../components/StatCard.jsx';

export const DashboardPage = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [soilReports, setSoilReports] = useState([]);
  const [pestAlerts, setPestAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [farmsRes, cropsRes, soilRes, pestRes, actRes, weatherRes] = await Promise.all([
          api.get('/farms').catch(() => ({ data: { farms: [] } })),
          api.get('/crops').catch(() => ({ data: { crops: [] } })),
          api.get('/soil-reports').catch(() => ({ data: { reports: [] } })),
          api.get('/pest-alerts?status=Active').catch(() => ({ data: { alerts: [] } })),
          api.get('/activities?limit=5').catch(() => ({ data: { activities: [] } })),
          api.get('/weather').catch(() => ({ data: { weather: null } })),
        ]);

        setFarms(farmsRes.data?.farms || []);
        setCrops(cropsRes.data?.crops || []);
        setSoilReports(soilRes.data?.reports || []);
        setPestAlerts(pestRes.data?.alerts || []);
        setActivities(actRes.data?.activities || []);
        setWeather(weatherRes.data?.weather || null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Upcoming harvest calculations
  const activeCrops = crops.filter((c) => c.growthStage !== 'Harvested');
  const sortedUpcoming = [...activeCrops].sort(
    (a, b) => new Date(a.expectedHarvestDate) - new Date(b.expectedHarvestDate)
  );
  const nextHarvest = sortedUpcoming[0] || null;

  let daysToNextHarvest = null;
  if (nextHarvest) {
    const diffTime = new Date(nextHarvest.expectedHarvestDate) - new Date();
    daysToNextHarvest = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Crop growth stage chart data
  const stages = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];
  const stageCounts = stages.map((stage) => ({
    stage,
    count: crops.filter((c) => c.growthStage === stage).length,
  }));

  const STAGE_COLORS = ['#84cc16', '#22c55e', '#16a34a', '#eab308', '#f97316', '#0ea5e9'];

  // Latest Soil Report summary
  const latestSoil = soilReports[0] || null;

  // Real agronomic recommendations aggregated from user's active crops & soil tests
  const dynamicRecommendations = [];
  if (crops.length === 0) {
    dynamicRecommendations.push('Add your first crop to receive tailored stage-by-stage agronomic advisories.');
  } else {
    const floweringCrops = crops.filter((c) => c.growthStage === 'Flowering');
    if (floweringCrops.length > 0) {
      dynamicRecommendations.push(
        `Critical water period: ${floweringCrops.map((c) => c.cropName).join(', ')} is currently in flowering. Avoid moisture stress.`
      );
    }
  }

  if (latestSoil) {
    if (latestSoil.pH < 6.0) {
      dynamicRecommendations.push(`Soil pH (${latestSoil.pH}) on ${latestSoil.farm?.farmName || 'your farm'} is acidic. Consider lime application.`);
    } else if (latestSoil.pH > 7.8) {
      dynamicRecommendations.push(`Soil pH (${latestSoil.pH}) is alkaline. Monitor zinc and micronutrient uptake.`);
    }
    if (latestSoil.moisture < 35) {
      dynamicRecommendations.push(`Low soil moisture (${latestSoil.moisture}%) detected on recent test. Check irrigation scheduling.`);
    }
  }

  if (pestAlerts.length > 0) {
    dynamicRecommendations.push(
      `Active pest alert: ${pestAlerts[0].pestOrDiseaseName} (${pestAlerts[0].severity} severity). Deploy safe IPM controls immediately.`
    );
  }

  if (dynamicRecommendations.length === 0) {
    dynamicRecommendations.push('All soil, moisture, and crop health metrics are in optimal vegetative ranges. Maintain balanced irrigation.');
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('dashboard.title')}</h2>
          <p className="text-muted small mb-0">{t('dashboard.subtitle')}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/farms" className="btn btn-sm btn-outline-forest">
            <i className="bi bi-plus-lg me-1"></i> Register Farm
          </Link>
          <Link to="/crops" className="btn btn-sm btn-forest">
            <i className="bi bi-flower1 me-1"></i> Add Crop
          </Link>
        </div>
      </div>

      {/* 4 Top Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title={t('dashboard.totalFarms')}
            value={farms.length}
            icon="geo-alt"
            color="success"
            subtitle={`${farms.reduce((acc, f) => acc + (f.totalArea || 0), 0).toFixed(1)} total acres`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title={t('dashboard.activeCrops')}
            value={activeCrops.length}
            icon="flower1"
            color="primary"
            subtitle={`${crops.filter((c) => c.healthStatus === 'Excellent' || c.healthStatus === 'Good').length} in prime health`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title={t('dashboard.soilReports')}
            value={soilReports.length}
            icon="moisture"
            color="info"
            subtitle={latestSoil ? `Latest pH: ${latestSoil.pH}` : 'No soil test logged'}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title={t('dashboard.activeAlerts')}
            value={pestAlerts.length}
            icon="shield-exclamation"
            color={pestAlerts.length > 0 ? 'danger' : 'success'}
            subtitle={pestAlerts.length > 0 ? `${pestAlerts[0].pestOrDiseaseName}` : 'Zero active infestations'}
          />
        </div>
      </div>

      {/* Middle Row: Next Harvest & Weather Summary */}
      <div className="row g-4 mb-4">
        {/* Next Harvest */}
        <div className="col-lg-6">
          <div className="card card-agro h-100 p-4 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-forest mb-0">
                <i className="bi bi-calendar2-check me-2 text-success"></i>
                {t('dashboard.nextHarvest')}
              </h5>
              <Link to="/crops" className="btn btn-sm btn-link text-decoration-none text-forest">
                View all crops &rarr;
              </Link>
            </div>

            {nextHarvest ? (
              <div className="p-3 bg-mint-subtle rounded-3 border border-success-subtle">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-forest mb-1">{nextHarvest.cropName}</h4>
                    <p className="text-muted small mb-0">
                      Variety: <span className="fw-semibold text-dark">{nextHarvest.variety || 'Standard'}</span> • Farm:{' '}
                      <span className="fw-semibold text-dark">{nextHarvest.farm?.farmName || 'Primary Farm'}</span>
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-forest px-3 py-2 fs-6 rounded-pill">
                      {daysToNextHarvest} days
                    </span>
                    <small className="d-block text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                      Est. {new Date(nextHarvest.expectedHarvestDate).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-top border-success-subtle d-flex justify-content-between align-items-center small">
                  <span>Growth Stage: <span className="fw-semibold text-forest">{nextHarvest.growthStage}</span></span>
                  <span>Health: <span className="badge bg-success">{nextHarvest.healthStatus}</span></span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-calendar-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                <p className="mb-2">No active harvest scheduled.</p>
                <Link to="/crops" className="btn btn-sm btn-forest">Register a Crop</Link>
              </div>
            )}
          </div>
        </div>

        {/* Live Weather Card */}
        <div className="col-lg-6">
          <div className="card card-agro h-100 p-4 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-forest mb-0">
                <i className="bi bi-cloud-sun me-2 text-warning"></i>
                {t('dashboard.weatherSummary')}
              </h5>
              <Link to="/weather" className="btn btn-sm btn-link text-decoration-none text-forest">
                5-Day Forecast &rarr;
              </Link>
            </div>

            {weather ? (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h2 className="display-6 fw-bold text-dark mb-0">{weather.temperature}°C</h2>
                    <p className="text-muted small mb-0">
                      {weather.weatherCondition} • Feels like {weather.feelsLike}°C
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-light text-dark border p-2 small">
                      📍 {weather.locationName}
                    </span>
                    <small className="d-block text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                      {weather.dataFreshness === 'live' ? '🟢 Live API Feed' : '🟡 Agronomic Sample Feed'}
                    </small>
                  </div>
                </div>

                <div className="row g-2 text-center text-muted small border-top pt-3">
                  <div className="col-4">
                    <span className="d-block text-dark fw-bold">{weather.humidity}%</span>
                    <span>Humidity</span>
                  </div>
                  <div className="col-4">
                    <span className="d-block text-dark fw-bold">{weather.rainfall} mm</span>
                    <span>Precipitation</span>
                  </div>
                  <div className="col-4">
                    <span className="d-block text-dark fw-bold">{weather.windSpeed} km/h</span>
                    <span>Wind Speed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border text-success spinner-border-sm mb-2" role="status"></div>
                <p className="small mb-0">Fetching local meteorological feed...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Growth Charts & Dynamic Recommendations */}
      <div className="row g-4 mb-4">
        {/* Growth Distribution Chart */}
        <div className="col-lg-7">
          <div className="card card-agro p-4 shadow-sm border-0 h-100">
            <h5 className="fw-bold text-forest mb-3">
              <i className="bi bi-bar-chart-line me-2 text-primary"></i>
              {t('dashboard.growthDistribution')}
            </h5>

            {crops.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageCounts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stageCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-bar-chart fs-1 d-block mb-2 text-secondary opacity-50"></i>
                <p className="small mb-2">No crops recorded yet to plot stage distribution.</p>
                <Link to="/crops" className="btn btn-sm btn-outline-forest">Add Crop</Link>
              </div>
            )}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="col-lg-5">
          <div className="card card-agro p-4 shadow-sm border-0 h-100">
            <h5 className="fw-bold text-forest mb-3">
              <i className="bi bi-lightbulb me-2 text-warning"></i>
              {t('dashboard.smartRecommendations')}
            </h5>

            <div className="d-flex flex-column gap-2">
              {dynamicRecommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-light rounded-3 border-start border-4 border-success d-flex align-items-start gap-2">
                  <i className="bi bi-check2-circle text-success fs-5 mt-n1"></i>
                  <span className="small text-dark">{rec}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-top">
              <Link to="/consultations" className="btn btn-sm btn-outline-forest w-100">
                <i className="bi bi-chat-dots me-1"></i> Ask Agronomist Any Question
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Farm Activities */}
      <div className="card card-agro p-4 shadow-sm border-0 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-forest mb-0">
            <i className="bi bi-journal-check me-2 text-forest"></i>
            {t('dashboard.recentActivities')}
          </h5>
          <Link to="/activities" className="btn btn-sm btn-link text-decoration-none text-forest">
            View full log &rarr;
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-agro align-middle mb-0">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Farm & Crop</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act._id}>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-semibold">
                        {act.activityType}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{act.farm?.farmName || 'Farm'}</span>
                      {act.crop && <small className="text-muted d-block">{act.crop.cropName}</small>}
                    </td>
                    <td className="small text-muted">{act.description}</td>
                    <td className="small text-secondary">
                      {new Date(act.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <p className="small mb-2">No farm operations logged yet.</p>
            <Link to="/activities" className="btn btn-sm btn-outline-forest">Log First Activity</Link>
          </div>
        )}
      </div>
    </div>
  );
};
