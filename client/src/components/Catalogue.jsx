import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import BatchTimer from './BatchTimer';
import ProductImage from './ui/ProductImage';
import StockBar from './ui/StockBar';

const CATEGORIES = ['All', 'Grains', 'Pulses', 'Oils', 'Sweeteners', 'Condiments'];

function CacheIndicator({ meta }) {
  if (!meta) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                  background: meta.hit ? 'var(--emerald-dim)' : 'var(--gold-dim)',
                  border: `1px solid ${meta.hit ? 'rgba(0,230,118,.2)' : 'rgba(255,184,0,.2)'}`,
                  borderRadius: 6, padding: '5px 10px', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
      <span className="live-dot" style={{ background: meta.hit ? 'var(--emerald)' : 'var(--gold)' }} />
      <span style={{ color: meta.hit ? 'var(--emerald)' : 'var(--gold)' }}>
        Redis {meta.hit ? 'HIT' : 'MISS'}
      </span>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <span style={{ color: 'var(--text-secondary)' }}>{meta.latency}ms</span>
      {!meta.hit && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>↳ cached now (24h TTL)</span>}
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const [qty, setQty] = useState(product.moq);
  const { addToCart } = useCart();

  const activeTier = useMemo(() => {
    return product.tiers
      ?.filter(t => qty >= t.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];
  }, [product.tiers, qty]);

  const unitPrice  = activeTier?.pricePerUnit ?? product.basePrice;
  const savings    = product.basePrice - unitPrice;
  const lowStock   = product.stock < product.moq * 3;

  return (
    <div className="card animate-in" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
                                              transition: 'border-color .2s', cursor: 'default' }}
         onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hi)'}
         onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ProductImage imageUrl={product.imageUrl} imageEmoji={product.imageEmoji} size={52} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{product.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {product.wholesaler?.shopName}
            </div>
          </div>
        </div>
        <span className={`badge ${lowStock ? 'badge-danger' : 'badge-success'}`}>
          {lowStock ? '⚠ Low Stock' : '● In Stock'}
        </span>
      </div>

      {/* Stock bar */}
      <StockBar stock={product.stock} maxStock={product.maxStock || 2000} unit={product.unit} />

      {/* Pricing tiers */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <div style={{
          background: !activeTier ? 'var(--saffron-dim)' : 'var(--bg-base)',
          border: `1px solid ${!activeTier ? 'rgba(255,107,53,.25)' : 'var(--border)'}`,
          borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Base </span>
          <span style={{ color: !activeTier ? 'var(--saffron)' : 'var(--text-primary)', fontWeight: 700 }}>
            ₹{product.basePrice}/{product.unit}
          </span>
        </div>
        {product.tiers?.map(tier => {
          const isActive = activeTier?.minQty === tier.minQty;
          return (
            <div key={tier.minQty} style={{
              background: isActive ? 'var(--emerald-dim)' : 'var(--bg-base)',
              border: `1px solid ${isActive ? 'rgba(0,230,118,.25)' : 'var(--border)'}`,
              borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>{tier.minQty}+ </span>
              <span style={{ color: isActive ? 'var(--emerald)' : 'var(--text-primary)', fontWeight: 700 }}>
                ₹{tier.pricePerUnit}
              </span>
            </div>
          );
        })}
      </div>

      {/* Qty selector + Add to Cart */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                      background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setQty(q => Math.max(product.moq, q - product.moq))}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)',
                     padding: '6px 12px', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>−</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '0 4px',
                         color: 'var(--text-primary)', minWidth: 36, textAlign: 'center' }}>
            {qty}
          </span>
          <button onClick={() => setQty(q => q + product.moq)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)',
                     padding: '6px 12px', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
        </div>

        <div style={{ flex: 1, textAlign: 'right', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Total </span>
          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--saffron)' }}>
            ₹{(unitPrice * qty).toLocaleString('en-IN')}
          </span>
          {savings > 0 && (
            <div style={{ fontSize: 10, color: 'var(--emerald)' }}>
              ↓ Save ₹{savings}/{product.unit}
            </div>
          )}
        </div>

        <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12 }}
          onClick={() => { addToCart(product, qty); onAdd(product.name); }}
          disabled={qty > product.stock}>
          + Cart
        </button>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        MOQ: {product.moq} {product.unit} · {product.wholesaler?.district}
      </div>
    </div>
  );
}

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [cacheMeta, setCacheMeta] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data.products);
        setCacheMeta(data._cache);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => products.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [products, category, search]);

  const showToast = (name) => {
    setToast(`${name} added to cart`);
    setTimeout(() => setToast(''), 2000);
  };

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(p => {
      const k = p.wholesalerId;
      if (!map[k]) map[k] = { wholesaler: p.wholesaler, products: [] };
      map[k].products.push(p);
    });
    return Object.values(map);
  }, [filtered]);

  return (
    <div style={{ padding: '20px 24px' }}>
      {/* Timer + cache status */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 300 }}><BatchTimer /></div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <CacheIndicator meta={cacheMeta} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" placeholder="🔍 Search products…" value={search}
               onChange={e => setSearch(e.target.value)}
               style={{ maxWidth: 240 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="btn" style={{
                fontSize: 11, padding: '5px 12px',
                background: category === cat ? 'var(--saffron-dim)' : 'var(--bg-surface)',
                color: category === cat ? 'var(--saffron)' : 'var(--text-secondary)',
                border: `1px solid ${category === cat ? 'rgba(255,107,53,.3)' : 'var(--border)'}`,
              }}>
              {cat}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)',
                       fontFamily: 'var(--font-mono)' }}>
          {filtered.length} products
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 280, animationDelay: `${i * .1}s` }} />
          ))}
        </div>
      ) : (
        grouped.map(({ wholesaler, products: ps }) => (
          <div key={wholesaler?._id} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🏭</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{wholesaler?.shopName}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {wholesaler?.district}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                             marginLeft: 'auto' }}>{ps.length} items</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {ps.map(p => <ProductCard key={p._id} product={p} onAdd={showToast} />)}
            </div>
          </div>
        ))
      )}

      {/* Toast */}
      {toast && (
        <div className="animate-right" style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--bg-elevated)', border: '1px solid var(--emerald)',
          borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600,
          color: 'var(--emerald)', boxShadow: '0 8px 24px rgba(0,0,0,.5)',
          zIndex: 200,
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
