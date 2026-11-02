import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import { StatCard } from '../components/StatCard.jsx';

export const AdminDashboardPage = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'marketplace', 'orders', 'moderation'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [resources, setResources] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Product State
  const [showAddResource, setShowAddResource] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    category: 'Seeds',
    description: '',
    price: '',
    unit: '1 kg packet',
    stockQuantity: '50',
    imageUrl: '',
    approvalStatus: 'Approved',
  });

  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, ordersRes, resourcesRes, postsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/orders/all'),
        api.get('/resources?approvalStatus=All'),
        api.get('/community?limit=30'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.users || []);
      if (ordersRes.data?.success) setOrders(ordersRes.data.orders || []);
      if (resourcesRes.data?.success) setResources(resourcesRes.data.resources || []);
      if (postsRes.data?.success) setPosts(postsRes.data.posts || []);
    } catch (err) {
      setError(err.message || 'Error loading administrator control data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'farmer' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccessMsg(`User role updated to ${newRole}.`);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setDeleteConfirmUser(null);
      setSuccessMsg('User and associated data permanently removed.');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setSuccessMsg(`Order updated to ${status}.`);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    }
  };

  const handleModeratePost = async (postId, moderationStatus) => {
    try {
      await api.put(`/admin/posts/${postId}/moderate`, { moderationStatus });
      setSuccessMsg(`Post status set to ${moderationStatus}.`);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to moderate post.');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/resources', resourceForm);
      setShowAddResource(false);
      setSuccessMsg('New agricultural input cataloged successfully!');
      setResourceForm({
        name: '',
        category: 'Seeds',
        description: '',
        price: '',
        unit: '1 kg packet',
        stockQuantity: '50',
        imageUrl: '',
        approvalStatus: 'Approved',
      });
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to create resource.');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Remove this product permanently from marketplace?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setSuccessMsg('Product removed from catalog.');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 mb-2">
          🛡️ Administrator & Research Authority
        </span>
        <h2 className="fw-bold text-forest mb-1">{t('nav.admin')}</h2>
        <p className="text-muted small mb-0">Platform-wide statistics, user authority, catalog pricing, order fulfillment, and community moderation</p>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {/* Admin Stats Overview */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Registered Users" value={stats.totalUsers} icon="people" color="primary" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Total Farms" value={stats.totalFarms} icon="geo-alt" color="success" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Fulfilled Orders" value={stats.totalOrders} icon="receipt" color="warning" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard title="Gross Marketplace Volume" value={`₹${stats.totalRevenue}`} icon="cash-stack" color="forest" />
          </div>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="card card-agro border-0 shadow-sm p-4">
        <ul className="nav nav-pills mb-4 border-bottom pb-3 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'users' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('users')}
            >
              👥 User Management ({users.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'marketplace' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('marketplace')}
            >
              📦 Marketplace Inventory ({resources.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'orders' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Order Fulfillment ({orders.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link py-2 px-3 fw-semibold rounded-pill ${activeTab === 'moderation' ? 'active bg-forest text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('moderation')}
            >
              🛡️ Forum Moderation ({posts.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div>
            <div className="table-responsive">
              <table className="table table-hover table-agro align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name & Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>District</th>
                    <th>Joined</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <span className="fw-bold text-dark small">{u.name}</span>
                        <small className="text-muted d-block">{u.email}</small>
                      </td>
                      <td className="small text-muted">{u.phone || '—'}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="small text-secondary">{u.location?.district || 'India'}</td>
                      <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            title="Toggle Role"
                            onClick={() => handleRoleToggle(u._id, u.role)}
                          >
                            {u.role === 'admin' ? 'Demote to Farmer' : 'Promote to Admin'}
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Delete User"
                            onClick={() => setDeleteConfirmUser(u)}
                          >
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

        {/* Tab 2: Marketplace Inventory */}
        {activeTab === 'marketplace' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-forest mb-0">Agricultural Catalog Inventory</h6>
              <button className="btn btn-sm btn-forest" onClick={() => setShowAddResource(true)}>
                <i className="bi bi-plus-circle me-1"></i> Add Catalog Product
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover table-agro align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((res) => (
                    <tr key={res._id}>
                      <td>
                        <span className="fw-bold text-dark small">{res.name}</span>
                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '240px' }}>
                          {res.description}
                        </small>
                      </td>
                      <td><span className="badge bg-light text-forest border">{res.category}</span></td>
                      <td className="fw-bold text-forest small">₹{res.price} / {res.unit}</td>
                      <td>
                        <span className={`fw-semibold small ${res.stockQuantity > 5 ? 'text-success' : 'text-danger'}`}>
                          {res.stockQuantity}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${res.approvalStatus === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {res.approvalStatus}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger py-0 px-2"
                          onClick={() => handleDeleteResource(res._id)}
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

        {/* Tab 3: Order Management */}
        {activeTab === 'orders' && (
          <div>
            <div className="table-responsive">
              <table className="table table-hover table-agro align-middle mb-0">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="fw-bold small text-dark">#{o._id.slice(-6)}</td>
                      <td>
                        <span className="small fw-semibold text-dark">{o.user?.name || 'Customer'}</span>
                        <small className="d-block text-muted">{o.deliveryDetails?.phone}</small>
                      </td>
                      <td className="small">
                        {o.orderItems.map((item, idx) => (
                          <div key={idx}>
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="fw-bold text-forest small">₹{o.total}</td>
                      <td>
                        <span
                          className={`badge ${
                            o.status === 'Delivered'
                              ? 'bg-success'
                              : o.status === 'Shipped'
                              ? 'bg-primary'
                              : o.status === 'Cancelled'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block"
                          style={{ width: '130px' }}
                          value={o.status}
                          onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Forum Moderation */}
        {activeTab === 'moderation' && (
          <div>
            <div className="table-responsive">
              <table className="table table-hover table-agro align-middle mb-0">
                <thead>
                  <tr>
                    <th>Post Title & Author</th>
                    <th>Category</th>
                    <th>Comments</th>
                    <th>Status</th>
                    <th className="text-end">Moderation Action</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <span className="fw-bold text-dark small">{p.title}</span>
                        <small className="text-muted d-block">
                          By: {p.author?.name || 'User'} ({new Date(p.createdAt).toLocaleDateString()})
                        </small>
                      </td>
                      <td><span className="badge bg-light text-forest border">{p.category}</span></td>
                      <td className="small">{p.comments?.length || 0}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.moderationStatus === 'Published'
                              ? 'bg-success'
                              : p.moderationStatus === 'Flagged'
                              ? 'bg-warning text-dark'
                              : 'bg-danger'
                          }`}
                        >
                          {p.moderationStatus}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleModeratePost(p._id, 'Published')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => handleModeratePost(p._id, 'Flagged')}
                          >
                            Flag
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleModeratePost(p._id, 'Removed')}
                          >
                            Remove
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
      </div>

      {/* Add Product Modal */}
      {showAddResource && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">Add Catalog Product</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddResource(false)}></button>
              </div>
              <form onSubmit={handleCreateResource}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Product Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Certified Bio-Enriched Vermicompost"
                      required
                      value={resourceForm.name}
                      onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Category</label>
                      <select
                        className="form-select"
                        value={resourceForm.category}
                        onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                      >
                        <option value="Seeds">Seeds</option>
                        <option value="Fertilizers">Fertilizers</option>
                        <option value="Pesticides">Pesticides</option>
                        <option value="Tools & Equipment">Tools & Equipment</option>
                        <option value="Irrigation">Irrigation</option>
                        <option value="Bio-Protectants">Bio-Protectants</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Packaging Unit</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 50 kg bag, 1 Litre"
                        value={resourceForm.unit}
                        onChange={(e) => setResourceForm({ ...resourceForm, unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        required
                        value={resourceForm.price}
                        onChange={(e) => setResourceForm({ ...resourceForm, price: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Initial Stock *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        required
                        value={resourceForm.stockQuantity}
                        onChange={(e) => setResourceForm({ ...resourceForm, stockQuantity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Image URL (opt)</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://images.unsplash.com/..."
                      value={resourceForm.imageUrl}
                      onChange={(e) => setResourceForm({ ...resourceForm, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-dark">Product Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddResource(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-forest px-4">
                    Save to Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deleteConfirmUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-body text-center p-4">
                <i className="bi bi-person-x text-danger display-4 d-block mb-3"></i>
                <h5 className="fw-bold text-dark">Permanently Delete User?</h5>
                <p className="text-muted small">
                  Are you sure you want to delete user <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})?
                  All associated farms, crops, and order history will be deleted.
                </p>
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <button className="btn btn-light px-4 border" onClick={() => setDeleteConfirmUser(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger px-4" onClick={() => handleDeleteUser(deleteConfirmUser._id)}>
                    Yes, Delete Permanently
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
