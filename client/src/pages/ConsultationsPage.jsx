import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ConsultationsPage = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [replyModalId, setReplyModalId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    category: 'General Farming',
    question: '',
  });

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? '/consultations/all' : '/consultations/my';
      const res = await api.get(url);
      if (res.data?.success) {
        setConsultations(res.data.consultations || []);
      }
    } catch (err) {
      setError(err.message || 'Error loading inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [isAdmin]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/consultations', formData);
      setShowModal(false);
      setFormData({ subject: '', category: 'General Farming', question: '' });
      fetchConsultations();
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry.');
    }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await api.put(`/consultations/${replyModalId}/respond`, {
        response: replyText,
        status: 'Answered',
      });
      setReplyModalId(null);
      setReplyText('');
      fetchConsultations();
    } catch (err) {
      setError(err.message || 'Failed to submit response.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('nav.consultations')}</h2>
          <p className="text-muted small mb-0">
            {isAdmin
              ? 'Agronomist Control Portal — Answer inquiries from regional farmers'
              : 'Direct communication line with certified agronomists and soil scientists'}
          </p>
        </div>

        {!isAdmin && (
          <button className="btn btn-forest px-3 shadow-sm" onClick={() => setShowModal(true)}>
            <i className="bi bi-question-circle me-2"></i> Ask an Agronomist
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {/* Notice */}
      <div className="card card-agro p-3 bg-light border-0 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle bg-white p-2 text-forest shadow-sm">
            <i className="bi bi-shield-check fs-4"></i>
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark small">Authentic Expert Responses</h6>
            <p className="mb-0 text-muted small">
              Responses are provided exclusively by verified agronomists and research officers. Questions in progress display their authentic pending status without synthetic answers.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2].map((n) => (
            <div key={n} className="card card-agro p-4 skeleton" style={{ height: '160px' }}></div>
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <div className="card card-agro p-5 text-center bg-white border-0 shadow-sm">
          <span className="fs-1 d-block mb-3">💬</span>
          <h5 className="fw-bold text-forest">No Consultations Yet</h5>
          <p className="text-muted small mb-3">
            Have a question about pest damage, fertilizer ratios, or seed treatment? Submit your inquiry.
          </p>
          {!isAdmin && (
            <button className="btn btn-forest px-4 mx-auto" onClick={() => setShowModal(true)}>
              Ask First Question
            </button>
          )}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {consultations.map((c) => (
            <div key={c._id} className="card card-agro p-4 border-0 shadow-sm">
              <div className="d-flex flex-wrap justify-content-between align-items-start mb-2 gap-2">
                <div>
                  <span className="badge bg-mint-subtle text-forest border border-success-subtle me-2">
                    {c.category}
                  </span>
                  <span
                    className={`badge ${
                      c.status === 'Answered'
                        ? 'bg-success'
                        : c.status === 'In Progress'
                        ? 'bg-primary'
                        : 'bg-warning text-dark'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <small className="text-muted">
                  Submitted {new Date(c.createdAt).toLocaleDateString()}
                  {isAdmin && c.farmer && ` by ${c.farmer.name} (${c.farmer.location?.district || 'Farmer'})`}
                </small>
              </div>

              <h5 className="fw-bold text-forest mt-1 mb-2">{c.subject}</h5>
              <p className="text-dark small mb-3">{c.question}</p>

              {c.response ? (
                <div className="p-3 bg-mint-subtle rounded-3 border border-success-subtle mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-forest small">
                      <i className="bi bi-patch-check-fill text-success me-1"></i>
                      Agronomist Response:
                    </span>
                    {c.respondedAt && (
                      <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Answered on {new Date(c.respondedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                  <p className="small text-dark mb-0">{c.response}</p>
                </div>
              ) : (
                <div className="p-3 bg-light rounded-3 border mt-2 d-flex justify-content-between align-items-center">
                  <span className="small text-muted fst-italic">
                    <i className="bi bi-hourglass-split me-1"></i>
                    Awaiting official response from our regional agronomy specialist.
                  </span>
                  {isAdmin && (
                    <button
                      className="btn btn-sm btn-forest"
                      onClick={() => {
                        setReplyModalId(c._id);
                        setReplyText('');
                      }}
                    >
                      Answer Question
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">Submit Agronomic Question</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitQuestion}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Subject / Topic *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Intercropping mustard with chickpea ratios"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="General Farming">General Farming</option>
                      <option value="Crop Health">Crop Health & Pathology</option>
                      <option value="Soil Fertility">Soil Fertility & Micronutrients</option>
                      <option value="Pest Control">Pest Control & IPM</option>
                      <option value="Irrigation">Irrigation Scheduling</option>
                      <option value="Market & Storage">Harvest Storage & Markets</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-dark">Your Detailed Question *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Describe crop variety, days after sowing, field symptoms, soil type..."
                      required
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    Submit Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reply Modal */}
      {replyModalId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">Provide Official Agronomist Response</h5>
                <button type="button" className="btn-close" onClick={() => setReplyModalId(null)}></button>
              </div>
              <form onSubmit={handleAdminReply}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Expert Recommendation *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Provide agronomic rationale, recommended dosage, cultural practices..."
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setReplyModalId(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    Send Response to Farmer
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
