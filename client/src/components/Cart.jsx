import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import ProductImage from './ui/ProductImage';

export default function Cart({ onOrderPlaced }) {
  const { items, totals, updateQty, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState('');
  const [success, setSuccess] = useState(null);

  const placeOrder = async () => {
    if (items.length === 0) return;
    setLoading(true); setError('');
    try {
      // Group by wholesaler (MVP: assume single wholesaler per cart)
      const wholesalerId = items[0].product.wholesalerId;
      const payload = {
        wholesalerId,
        items: items.map(({ product, quantity }) => ({
          productId: product._id,
          quantity,
        })),
      };
      const { data } = await api.post('/orders', payload);
      setSuccess(data);
      clearCart();
      onOrderPlaced?.();
    } catch (e) {
      setError(e.error || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Order Placed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            Your order is pending. It will be batched at the next 6-hour dispatch window.
          </p>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 12, padding: '20px', marginBottom: 20,
                        fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
              <span style={{ color: 'var(--saffron)', fontSize: 10 }}>{success._id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total</span>
              <span style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: 16 }}>
                ₹{success.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className="badge badge-warning">Pending Batch</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setSuccess(null)}>
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Your cart is empty</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Add products from the Catalogue tab</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 18 }}>🛒 Cart Review</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            useMemo totals — recalculated only when items change
          </span>
          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={clearCart}>Clear</button>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {items.map(({ product, quantity }, idx) => {
          const breakdown = totals.breakdown[idx];
          return (
            <div key={product._id} className="card" style={{ padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14 }}>
              <ProductImage imageUrl={product.imageUrl} imageEmoji={product.imageEmoji} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{product.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {product.wholesaler?.shopName} · {product.unit}
                </div>
              </div>

              {breakdown?.hasTier && (
                <span className="badge badge-success">Tier Price ↓</span>
              )}

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'right', minWidth: 80 }}>
                <div style={{ color: 'var(--text-muted)' }}>₹{breakdown?.unitPrice}/{product.unit}</div>
              </div>

              {/* Qty control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                            background: 'var(--bg-base)', border: '1px solid var(--border)',
                            borderRadius: 7, overflow: 'hidden' }}>
                <button onClick={() => updateQty(product._id, quantity - product.moq)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)',
                           padding: '5px 10px', cursor: 'pointer', fontSize: 15 }}>−</button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, minWidth: 32,
                               textAlign: 'center', color: 'var(--text-primary)' }}>{quantity}</span>
                <button onClick={() => updateQty(product._id, quantity + product.moq)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)',
                           padding: '5px 10px', cursor: 'pointer', fontSize: 15 }}>+</button>
              </div>

              <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 15,
                            color: 'var(--saffron)', minWidth: 80, textAlign: 'right' }}>
                ₹{breakdown?.lineTotal?.toLocaleString('en-IN')}
              </div>

              <button onClick={() => removeItem(product._id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)',
                         cursor: 'pointer', fontSize: 16, padding: '4px 6px',
                         borderRadius: 4, transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--ruby)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>✕</button>
            </div>
          );
        })}
      </div>

      {/* Order summary */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{totals.itemCount} product types · {totals.totalItems} units</span>
          <span style={{ fontWeight: 800, fontSize: 22, fontFamily: 'var(--font-mono)', color: 'var(--saffron)' }}>
            ₹{totals.subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16,
                      fontFamily: 'var(--font-mono)', padding: '8px 10px',
                      background: 'var(--bg-base)', borderRadius: 6 }}>
          ⚙ This order will be aggregated into the next 6-hour dispatch batch.
          Atomic stock lock applied on submission — no overselling possible.
        </div>

        {error && (
          <div style={{ background: 'var(--ruby-dim)', border: '1px solid rgba(255,23,68,.2)',
                        borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--ruby)', marginBottom: 12 }}>
            ⚠ {error}
          </div>
        )}

        <button className="btn btn-primary" onClick={placeOrder} disabled={loading}
          style={{ width: '100%', padding: '13px 0', fontSize: 15 }}>
          {loading ? '⟳ Placing order...' : `🛒 Place Order · ₹${totals.subtotal.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  );
}
