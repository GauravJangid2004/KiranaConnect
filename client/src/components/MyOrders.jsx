import { useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';

const STATUS_META = {
  pending:    { label: 'Pending',    cls: 'badge-warning', icon: '⏳' },
  batched:    { label: 'Batched',    cls: 'badge-info',    icon: '📦' },
  dispatched: { label: 'Dispatched', cls: 'badge-primary', icon: '🚚' },
  delivered:  { label: 'Delivered',  cls: 'badge-success', icon: '✅' },
  cancelled:  { label: 'Cancelled',  cls: 'badge-danger',  icon: '❌' },
};

export default function MyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  // Real-time status updates
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;
    const onBatch = () => fetch(); // refetch when a batch fires
    const onUpdate = () => fetch(); // refetch when order status changes
    sock.on('batchReady', onBatch);
    sock.on('orderDispatched', onUpdate);
    sock.on('orderDelivered', onUpdate);
    return () => {
      sock.off('batchReady', onBatch);
      sock.off('orderDispatched', onUpdate);
      sock.off('orderDelivered', onUpdate);
    };
  }, []);

  if (loading) return (
    <div style={{ padding: 24 }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 80, marginBottom: 10, animationDelay: `${i * .1}s` }} />
      ))}
    </div>
  );

  return (
    <div style={{ padding: '20px 24px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 18 }}>📋 My Orders</h2>
        <button className="btn btn-ghost" onClick={fetch} style={{ fontSize: 11, padding: '5px 12px' }}>
          ↻ Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No orders yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map(order => {
            const meta = STATUS_META[order.status] || STATUS_META.pending;
            const isOpen = expanded === order._id;
            return (
              <div key={order._id} className="card animate-in"
                   style={{ overflow: 'hidden', transition: 'border-color .15s' }}
                   onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hi)'}
                   onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                
                {/* Row */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center',
                              gap: 14, cursor: 'pointer' }}
                     onClick={() => setExpanded(isOpen ? null : order._id)}>
                  <span style={{ fontSize: 22 }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{order.wholesaler?.shopName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleString('en-IN')} · {order.items?.length} items
                    </div>
                  </div>
                  <span className={`badge ${meta.cls}`}>{meta.label}</span>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 16,
                                color: 'var(--saffron)', minWidth: 80, textAlign: 'right' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, transform: isOpen ? 'rotate(90deg)' : 'none',
                                 transition: 'transform .2s', display: 'inline-block' }}>›</span>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px',
                                background: 'var(--bg-base)', fontSize: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                                              fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {item.productId?.name || item.productId} × {item.quantity}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            ₹{(item.priceAtOrder * item.quantity).toLocaleString('en-IN')}
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                              {' '}(₹{item.priceAtOrder}/unit)
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.batch?.[0] && (
                      <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-surface)',
                                    borderRadius: 6, fontSize: 11, color: 'var(--text-muted)',
                                    fontFamily: 'var(--font-mono)' }}>
                        Batch: {order.batch[0]._id} · {order.batch[0].status}
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
