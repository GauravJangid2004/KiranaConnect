import { useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import ProductImage from './ui/ProductImage';
import StockBar from './ui/StockBar';

const STATUS_META = {
  pending:    { label: 'Pending',    cls: 'badge-warning', icon: '⏳' },
  batched:    { label: 'Batched',    cls: 'badge-info',    icon: '📦' },
  dispatched: { label: 'Dispatched', cls: 'badge-primary', icon: '🚚' },
  delivered:  { label: 'Delivered',  cls: 'badge-success', icon: '✅' },
};

/* ─── WHOLESALER ORDERS ─── */
export function WholesalerOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [newOrderFlash, setNewOrderFlash] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/wholesaler/orders');
      setOrders(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;
    const onNew = (order) => {
      setNewOrderFlash(order);
      setTimeout(() => setNewOrderFlash(null), 4000);
      fetchOrders();
    };
    sock.on('newOrder', onNew);
    sock.on('batchReady', fetchOrders);
    return () => { sock.off('newOrder', onNew); sock.off('batchReady', fetchOrders); };
  }, []);

  const dispatchOrder = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/wholesaler/orders/${id}/dispatch`);
      fetchOrders();
    } catch {} finally { setActionLoading(null); }
  };

  const deliverOrder = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/wholesaler/orders/${id}/deliver`);
      fetchOrders();
    } catch {} finally { setActionLoading(null); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    batched:    orders.filter(o => o.status === 'batched').length,
    dispatched: orders.filter(o => o.status === 'dispatched').length,
    revenue:    orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0),
  };

  const getProductDetail = (order, productId) => {
    if (!order.productDetails) return null;
    const idStr = typeof productId === 'object' ? productId.toString() : productId;
    return order.productDetails.find(p => p._id.toString() === idStr || p._id === idStr);
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      {newOrderFlash && (
        <div className="animate-right" style={{
          position: 'fixed', top: 70, right: 24,
          background: 'var(--bg-elevated)', border: '1px solid var(--saffron)',
          borderRadius: 12, padding: '16px 20px', fontSize: 14,
          boxShadow: '0 8px 32px var(--saffron-glow)', zIndex: 200,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--saffron)' }}>🔔 New Order!</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {newOrderFlash.shopName} · ₹{newOrderFlash.totalAmount?.toLocaleString('en-IN')}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Orders',   value: stats.total,      color: 'var(--text-primary)' },
          { label: 'Pending',        value: stats.pending,    color: 'var(--gold)' },
          { label: 'Batched',        value: stats.batched,    color: 'var(--ice)' },
          { label: 'Dispatched',     value: stats.dispatched, color: 'var(--saffron)' },
          { label: 'Gross Revenue',  value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'var(--emerald)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                          letterSpacing: '.1em', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: 22, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all','pending','batched','dispatched','delivered'].map(f => (
          <button key={f} className="btn" onClick={() => setFilter(f)} style={{
            fontSize: 11, padding: '6px 14px', textTransform: 'capitalize',
            background: filter === f ? 'var(--saffron-dim)' : 'var(--bg-surface)',
            color: filter === f ? 'var(--saffron)' : 'var(--text-secondary)',
            border: `1px solid ${filter === f ? 'rgba(255,107,53,.3)' : 'var(--border)'}`,
            borderRadius: 8,
          }}>{f === 'all' ? `All (${stats.total})` : `${f} (${orders.filter(o=>o.status===f).length})`}</button>
        ))}
      </div>

      {/* Orders header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15 }}>📥 Retailer Orders</h3>
        <button className="btn btn-ghost" onClick={fetchOrders} style={{ fontSize: 11, padding: '5px 12px' }}>↻</button>
      </div>

      {loading ? (
        [...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 70, marginBottom: 10, animationDelay: `${i * .1}s` }} />
        ))
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div>No orders found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(order => {
            const meta = STATUS_META[order.status] || STATUS_META.pending;
            const isOpen = expanded === order._id;
            return (
              <div key={order._id} className="card" style={{ overflow: 'hidden', transition: 'border-color .15s' }}
                   onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hi)'}
                   onMouseLeave={e => e.currentTarget.style.borderColor = ''}>

                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                     onClick={() => setExpanded(isOpen ? null : order._id)}>
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {order.shopOwner?.shopName}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                        {order.shopOwner?.phone}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleString('en-IN')} · {order.items?.length} items
                    </div>
                  </div>
                  <span className={`badge ${meta.cls}`}>{meta.label}</span>

                  {/* Action buttons */}
                  {(order.status === 'pending' || order.status === 'batched') && (
                    <button className="btn" disabled={actionLoading === order._id}
                      onClick={e => { e.stopPropagation(); dispatchOrder(order._id); }}
                      style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8,
                               background: 'linear-gradient(135deg, #FF6B35, #d94f1c)',
                               color: '#fff', border: 'none', fontWeight: 700 }}>
                      {actionLoading === order._id ? '⟳' : '🚚 Dispatch'}
                    </button>
                  )}
                  {order.status === 'dispatched' && (
                    <button className="btn" disabled={actionLoading === order._id}
                      onClick={e => { e.stopPropagation(); deliverOrder(order._id); }}
                      style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8,
                               background: 'linear-gradient(135deg, #20D68F, #17a86e)',
                               color: '#fff', border: 'none', fontWeight: 700 }}>
                      {actionLoading === order._id ? '⟳' : '✅ Delivered'}
                    </button>
                  )}

                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 16,
                                color: 'var(--saffron)', minWidth: 90, textAlign: 'right' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14, transform: isOpen ? 'rotate(90deg)' : 'none',
                                 transition: 'transform .2s', display: 'inline-block' }}>›</span>
                </div>

                {/* Expanded detail — order items */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px',
                                background: 'rgba(12,16,26,0.6)', fontSize: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', marginBottom: 10,
                                  textTransform: 'uppercase', letterSpacing: '.08em' }}>Order Items</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {order.items?.map((item, i) => {
                        const prod = getProductDetail(order, item.productId);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '8px 12px', borderRadius: 10,
                                                background: 'rgba(18,24,38,0.7)', border: '1px solid var(--border)' }}>
                            <ProductImage imageUrl={prod?.imageUrl} imageEmoji={prod?.imageEmoji} size={36} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                                {prod?.name || 'Product'}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {prod?.category} · {prod?.unit}
                              </div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>× {item.quantity}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>₹{item.priceAtOrder}/unit</div>
                            </div>
                            <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--saffron)', minWidth: 70, textAlign: 'right' }}>
                              ₹{(item.priceAtOrder * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {order.shopOwner?.address && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(18,24,38,0.5)',
                                    borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        📍 {order.shopOwner.address}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── WHOLESALER BATCHES ─── */
export function WholesalerBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const { data } = await api.get('/wholesaler/batches');
      setBatches(data);
    } catch {} finally { setLoading(false); }
  };

  const dispatch = async (id) => {
    try {
      await api.patch(`/wholesaler/batches/${id}/dispatch`);
      fetchBatches();
    } catch {}
  };

  useEffect(() => { fetchBatches(); }, []);

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;
    sock.on('batchReady', fetchBatches);
    return () => sock.off('batchReady', fetchBatches);
  }, []);

  return (
    <div style={{ padding: '20px 24px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 18 }}>📦 Dispatch Batches</h2>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Cron: every 6h · idempotent via batchWindow key
        </div>
      </div>

      {loading ? (
        [...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80, marginBottom: 10 }} />
        ))
      ) : batches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div>No batches yet. Orders batch every 6 hours.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {batches.map(batch => (
            <div key={batch._id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    Batch Window: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--saffron)',
                                                  fontSize: 12 }}>{batch.batchWindow}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>{batch.totalOrders} orders</span>
                    <span>Created: {new Date(batch.createdAt).toLocaleString('en-IN')}</span>
                    {batch.dispatchedAt && <span>Dispatched: {new Date(batch.dispatchedAt).toLocaleString('en-IN')}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className={`badge ${batch.status === 'dispatched' ? 'badge-success' : 'badge-info'}`}>
                    {batch.status === 'dispatched' ? '✅ Dispatched' : '📦 Aggregating'}
                  </span>
                  {batch.status === 'aggregating' && (
                    <button className="btn btn-emerald" style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => dispatch(batch._id)}>
                      🚚 Mark Dispatched
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── WHOLESALER PRODUCTS ─── */
export function WholesalerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockLoading, setRestockLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'Grains', unit: 'kg', stock: '', maxStock: '2000', moq: '', basePrice: '', imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/wholesaler/products');
      setProducts(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post('/products', {
        ...form, stock: +form.stock, maxStock: +form.maxStock, moq: +form.moq, basePrice: +form.basePrice, tiers: [],
      });
      setShowForm(false);
      setForm({ name: '', category: 'Grains', unit: 'kg', stock: '', maxStock: '2000', moq: '', basePrice: '', imageUrl: '' });
      fetchProducts();
    } catch {}
    finally { setSubmitting(false); }
  };

  const handleRestock = async (productId) => {
    if (!restockQty || +restockQty <= 0) return;
    setRestockLoading(true);
    try {
      await api.patch(`/wholesaler/products/${productId}/restock`, { addStock: +restockQty });
      setRestockId(null);
      setRestockQty('');
      fetchProducts();
    } catch {}
    finally { setRestockLoading(false); }
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 18 }}>🏷️ My Product Listings</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <input className="input" placeholder="Product name" value={form.name}
                   onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <select className="input" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ cursor: 'pointer' }}>
              {['Grains','Pulses','Oils','Sweeteners','Condiments'].map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="input" placeholder="Unit (kg, liter…)" value={form.unit}
                   onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            <input className="input" type="number" placeholder="Stock qty" value={form.stock}
                   onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            <input className="input" type="number" placeholder="Max capacity" value={form.maxStock}
                   onChange={e => setForm(f => ({ ...f, maxStock: e.target.value }))} />
            <input className="input" type="number" placeholder="MOQ" value={form.moq}
                   onChange={e => setForm(f => ({ ...f, moq: e.target.value }))} />
            <input className="input" type="number" placeholder="Base price ₹" value={form.basePrice}
                   onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} />
            <input className="input" placeholder="Image URL (optional)" value={form.imageUrl}
                   onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                   style={{ gridColumn: 'span 2' }} />
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={submitting}>
            {submitting ? '⟳ Adding…' : '✓ Add Product'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
          {products.map(p => (
            <div key={p._id} className="card" style={{ padding: 18, transition: 'border-color .15s' }}
                 onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hi)'}
                 onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <ProductImage imageUrl={p.imageUrl} imageEmoji={p.imageEmoji} size={52} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                  <span className="badge badge-info" style={{ marginTop: 3 }}>{p.category}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--saffron)', fontSize: 16 }}>
                    ₹{p.basePrice}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>per {p.unit}</div>
                </div>
              </div>

              {/* Stock bar */}
              <StockBar stock={p.stock} maxStock={p.maxStock || 2000} unit={p.unit} />

              <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                  MOQ: {p.moq} {p.unit}
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  {restockId === p._id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="number" placeholder="Qty" value={restockQty}
                             onChange={e => setRestockQty(e.target.value)}
                             style={{ width: 80, padding: '5px 8px', borderRadius: 6, fontSize: 12,
                                      background: 'rgba(18,24,38,0.9)', border: '1px solid var(--border)',
                                      color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
                      <button className="btn" disabled={restockLoading}
                        onClick={() => handleRestock(p._id)}
                        style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6,
                                 background: 'linear-gradient(135deg, #20D68F, #17a86e)',
                                 color: '#fff', border: 'none', fontWeight: 700 }}>
                        {restockLoading ? '⟳' : '✓'}
                      </button>
                      <button className="btn" onClick={() => { setRestockId(null); setRestockQty(''); }}
                        style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6,
                                 background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button className="btn" onClick={() => setRestockId(p._id)}
                      style={{ fontSize: 11, padding: '5px 12px', borderRadius: 8,
                               background: 'rgba(32,214,143,0.1)', color: 'var(--emerald)',
                               border: '1px solid rgba(32,214,143,0.2)', fontWeight: 700 }}>
                      + Refill Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
