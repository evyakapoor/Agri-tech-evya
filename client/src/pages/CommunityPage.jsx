import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export const CommunityPage = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General Discussion',
    content: '',
  });

  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const categories = [
    'All',
    'General Discussion',
    'Farming Tips',
    'Market Trends',
    'Tech in Farming',
    'Pest Warnings',
    'Success Stories',
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const categoryParam = categoryFilter !== 'All' ? `category=${categoryFilter}` : '';
      const searchParam = search ? `search=${encodeURIComponent(search)}` : '';
      const query = [categoryParam, searchParam].filter(Boolean).join('&');

      const res = await api.get(`/community?${query}`);
      if (res.data?.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      setError(err.message || 'Error loading discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/community', formData);
      setShowModal(false);
      setFormData({ title: '', category: 'General Discussion', content: '' });
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to publish post.');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this community post?')) return;
    try {
      await api.delete(`/community/${id}`);
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/community/${postId}/comment`, { comment: text.trim() });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (err) {
      alert(err.message || 'Error adding comment.');
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId],
    });
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('nav.community')}</h2>
          <p className="text-muted small mb-0">Share regional farming experiences, tips, pest warnings, and market intelligence</p>
        </div>

        <button className="btn btn-forest px-3 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-pencil-square me-2"></i> New Discussion
        </button>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="card card-agro p-3 mb-4 border-0 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search discussion topics or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-forest">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>
          <div className="col-md-7">
            <div className="d-flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm rounded-pill px-3 ${
                    categoryFilter === cat ? 'btn-forest' : 'btn-light border'
                  }`}
                  onClick={() => setCategoryFilter(cat)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post Stream */}
      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2].map((n) => (
            <div key={n} className="card card-agro p-4 skeleton" style={{ height: '180px' }}></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card card-agro p-5 text-center bg-white border-0 shadow-sm">
          <span className="fs-1 d-block mb-3">🌾</span>
          <h5 className="fw-bold text-forest">No Discussions in this Category</h5>
          <p className="text-muted small mb-3">Be the first farmer to start a conversation in this topic.</p>
          <button className="btn btn-forest px-4 mx-auto" onClick={() => setShowModal(true)}>
            Start a Discussion
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {posts.map((post) => (
            <div key={post._id} className="card card-agro p-4 border-0 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-mint-subtle text-forest fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                  >
                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark small">
                      {post.author?.name || 'Farmer'}
                      {post.author?.role === 'admin' && (
                        <span className="badge bg-danger-subtle text-danger ms-2 small" style={{ fontSize: '0.65rem' }}>
                          Agronomist / Admin
                        </span>
                      )}
                    </h6>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(post.createdAt).toLocaleDateString()} • {post.category}
                    </small>
                  </div>
                </div>

                {(post.author?._id === user?._id || isAdmin) && (
                  <button
                    className="btn btn-sm btn-outline-danger py-0 px-2"
                    title="Delete post"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>

              <h5 className="fw-bold text-forest mt-2 mb-2">{post.title}</h5>
              <p className="small text-dark mb-3" style={{ whiteSpace: 'pre-line' }}>
                {post.content}
              </p>

              {/* Comments Toggle & Counter */}
              <div className="d-flex align-items-center justify-content-between border-top pt-2 mt-2">
                <button
                  className="btn btn-sm btn-link text-decoration-none text-forest p-0"
                  onClick={() => toggleComments(post._id)}
                >
                  <i className="bi bi-chat-dots me-1"></i>
                  {post.comments?.length || 0} Comments {expandedComments[post._id] ? '▲' : '▼'}
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[post._id] && (
                <div className="mt-3 pt-3 border-top bg-light p-3 rounded-3">
                  <div className="d-flex flex-column gap-2 mb-3">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((c, i) => (
                        <div key={i} className="p-2 bg-white rounded border small">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-dark">{c.authorName || 'Farmer'}</span>
                            <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
                              {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                            </small>
                          </div>
                          <p className="mb-0 text-muted">{c.comment}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted small fst-italic">No comments yet. Start the reply thread!</span>
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Write your constructive agricultural comment..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post._id);
                      }}
                    />
                    <button
                      className="btn btn-forest"
                      type="button"
                      onClick={() => handleAddComment(post._id)}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Discussion Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">Start a Discussion Post</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreatePost}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Discussion Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Best results with organic mulching in semi-arid zones"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="General Discussion">General Discussion</option>
                      <option value="Farming Tips">Farming Tips</option>
                      <option value="Market Trends">Market Trends & Prices</option>
                      <option value="Tech in Farming">Tech & Sensors in Farming</option>
                      <option value="Pest Warnings">Pest & Disease Warnings</option>
                      <option value="Success Stories">Farmer Success Stories</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-dark">Content *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Share your practical observation, question, or guidance for fellow growers..."
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    Publish Post
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
