import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export const MarketplacePage = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'orders'
  const [resources, setResources] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');

  // Delivery Form
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.location?.address || 'Plot 4, Farm Road',
    city: user?.location?.district || 'Central District',
    postalCode: '110001',
    notes: '',
  });

  const categories = [
    'All',
    'Seeds',
    'Fertilizers',
    'Pesticides',
    'Tools & Equipment',
    'Irrigation',
    'Bio-Protectants',
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources');
      if (res.data?.success) {
        setResources(res.data.resources || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load agricultural products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data?.success) {
        setMyOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchOrders();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert(`Cannot add more: only ${product.stockQuantity} in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQuantity) {
              alert(`Maximum available stock is ${item.product.stockQuantity}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) return;

    try {
      const itemsPayload = cart.map((item) => ({
        resourceId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
      }));

      const res = await api.post('/orders', {
        items: itemsPayload,
        deliveryDetails,
      });

      if (res.data?.success) {
        setOrderSuccess(`Order placed successfully! Order ID: #${res.data.order._id.slice(-6)}`);
        setCart([]);
        setShowCartModal(false);
        fetchResources(); // Refresh updated stock
        fetchOrders();
        setActiveTab('orders');
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please verify stock availability.');
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-forest mb-1">{t('marketplace.title')}</h2>
          <p className="text-muted small mb-0">Browse certified seeds, organic bio-fertilizers, IPM traps & precision tools</p>
        </div>

        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${activeTab === 'catalog' ? 'btn-forest' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('catalog')}
          >
            <i className="bi bi-grid me-1"></i> Products Catalog
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-forest' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-receipt me-1"></i> My Orders ({myOrders.length})
          </button>
          {cart.length > 0 && (
            <button className="btn btn-sm btn-success px-3" onClick={() => setShowCartModal(true)}>
              <i className="bi bi-cart3 me-1"></i> Cart ({cart.reduce((a, b) => a + b.quantity, 0)}) • ₹{cartTotal}
            </button>
          )}
        </div>
      </div>

      {orderSuccess && (
        <div className="alert alert-success alert-dismissible fade show small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{orderSuccess}</div>
          <button type="button" className="btn-close" onClick={() => setOrderSuccess('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
          {error}
        </div>
      )}

      {activeTab === 'catalog' ? (
        <div>
          {/* Category & Search Filter */}
          <div className="card card-agro p-3 mb-4 border-0 shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search inputs, fertilizers, seeds..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-8">
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

          {/* Catalog Grid */}
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="col-md-4">
                  <div className="card card-agro p-4 skeleton" style={{ height: '300px' }}></div>
                </div>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="card card-agro p-5 text-center bg-white border-0 shadow-sm">
              <span className="fs-1 d-block mb-2">🛍️</span>
              <h5 className="fw-bold text-forest">No Products Found</h5>
              <p className="text-muted small">Try modifying your search or selecting a different category.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredResources.map((res) => (
                <div key={res._id} className="col-md-6 col-lg-4">
                  <div className="card card-agro h-100 border-0 shadow-sm overflow-hidden d-flex flex-column justify-content-between">
                    <div>
                      {res.imageUrl ? (
                        <img
                          src={res.imageUrl}
                          alt={res.name}
                          className="w-100"
                          style={{ height: '180px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="w-100 bg-mint-subtle d-flex align-items-center justify-content-center text-forest"
                          style={{ height: '180px' }}
                        >
                          <i className="bi bi-box-seam fs-1"></i>
                        </div>
                      )}

                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge bg-light text-forest border small">
                            {res.category}
                          </span>
                          <span
                            className={`small fw-semibold ${
                              res.stockQuantity > 5 ? 'text-success' : res.stockQuantity > 0 ? 'text-warning' : 'text-danger'
                            }`}
                          >
                            {res.stockQuantity > 0 ? `${res.stockQuantity} in stock` : 'Out of Stock'}
                          </span>
                        </div>

                        <h6 className="fw-bold text-dark mt-2 mb-1">{res.name}</h6>
                        <p className="text-muted small mb-3 text-truncate-2" style={{ height: '40px' }}>
                          {res.description}
                        </p>

                        <div className="d-flex justify-content-between align-items-baseline">
                          <div>
                            <span className="fs-5 fw-bold text-forest">₹{res.price}</span>
                            <small className="text-muted ms-1">/ {res.unit || 'unit'}</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 pt-0 border-0">
                      <button
                        className="btn btn-sm btn-forest w-100 py-2"
                        onClick={() => addToCart(res)}
                        disabled={res.stockQuantity <= 0}
                      >
                        <i className="bi bi-cart-plus me-1"></i>
                        {res.stockQuantity > 0 ? 'Add to Cart' : 'Currently Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Orders Tab */
        <div className="card card-agro border-0 shadow-sm p-4">
          <h5 className="fw-bold text-forest mb-3">Order History & Tracking</h5>
          {myOrders.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-receipt fs-1 d-block mb-2 text-secondary opacity-50"></i>
              <p className="small mb-2">You haven't placed any orders yet.</p>
              <button className="btn btn-sm btn-forest" onClick={() => setActiveTab('catalog')}>
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {myOrders.map((o) => (
                <div key={o._id} className="p-3 bg-light rounded-3 border">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                    <div>
                      <span className="fw-bold text-dark me-2">Order #{o._id.slice(-6)}</span>
                      <small className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</small>
                    </div>
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
                  </div>

                  <div className="small text-muted mb-2">
                    Payment Method: <span className="fw-semibold text-dark">{o.paymentMethod}</span>
                  </div>

                  <ul className="list-group list-group-flush mb-2 rounded bg-white border">
                    {o.orderItems.map((item, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2">
                        <span className="small text-dark">
                          {item.name} <span className="text-muted">× {item.quantity}</span>
                        </span>
                        <span className="small fw-bold text-forest">₹{item.subtotal}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <small className="text-muted">
                      Delivery to: {o.deliveryDetails?.fullName}, {o.deliveryDetails?.city}
                    </small>
                    <span className="fw-bold text-forest">Total: ₹{o.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart & Checkout Modal */}
      {showCartModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-forest">
                  <i className="bi bi-cart3 me-2"></i> Review Cart & Checkout
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCartModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="table-responsive mb-3">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product._id}>
                          <td>
                            <span className="fw-bold text-dark small">{item.product.name}</span>
                          </td>
                          <td className="small">₹{item.product.price}</td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-secondary py-0 px-2"
                                onClick={() => updateCartQuantity(item.product._id, -1)}
                              >
                                -
                              </button>
                              <span className="btn btn-light py-0 px-2 disabled">{item.quantity}</span>
                              <button
                                className="btn btn-outline-secondary py-0 px-2"
                                onClick={() => updateCartQuantity(item.product._id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-end fw-bold text-forest small">
                            ₹{item.product.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 bg-mint-subtle rounded-3 mb-4">
                  <span className="fw-bold text-forest">Order Grand Total:</span>
                  <span className="display-6 fs-4 fw-bold text-forest">₹{cartTotal}</span>
                </div>

                <form onSubmit={handleCheckout}>
                  <h6 className="fw-bold text-forest mb-3">Delivery Information</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Recipient Full Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={deliveryDetails.fullName}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, fullName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Contact Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        required
                        value={deliveryDetails.phone}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Delivery Address (Farm Plot / House) *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={deliveryDetails.address}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">City / District *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={deliveryDetails.city}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">PIN / Postal Code *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={deliveryDetails.postalCode}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, postalCode: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Payment Disclaimer */}
                  <div className="alert alert-secondary small py-2 mb-3" role="alert">
                    <i className="bi bi-info-circle me-1"></i>
                    <strong>Payment Workflow Notice:</strong> All agricultural orders are processed via standard{' '}
                    <strong>Cash on Delivery (Standard Verification)</strong>. No payment card is required today.
                  </div>

                  <div className="modal-footer bg-light border-top px-0 pb-0">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCartModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-forest px-4">
                      Place Order (Cash on Delivery)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
