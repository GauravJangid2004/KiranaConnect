/**
 * CATALOGUE COMPONENT — Member 2 (Redis Cache + Product Catalogue)
 *
 * Displays the product catalogue fetched from GET /api/products.
 * Shows a live Redis HIT/MISS badge with latency — this is the visual proof
 * of caching. First load = MISS (~150ms), subsequent loads = HIT (~2ms).
 *
 * Uses useMemo for filtered product list (only recalculates when deps change).
 */
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

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

function ProductCard({ product }) {
  const [qty, setQty] = useState(product.moq);

  const activeTier = useMemo(() => {
    return product.tiers
      ?.filter(t => qty >= t.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];
  }, [product.tiers, qty]);

  const unitPrice  = activeTier?.pricePerUnit ?? product.basePrice;
  const savings    = product.basePrice - unitPrice;
  const stockPct   = Math.min(100, (product.stock / 2000) * 100);
  const lowStock   = product.stock < product.moq * 3;

  return (
    <div className="card animate-in" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
                                              transition: 'border-color .2s', cursor: 'default' }}
         onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hi)'}
         onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{product.imageEmoji}</span>
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

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>STOCK</span>
          <span style={{ fontSize: 10, color: lowStock ? 'var(--ruby)' : 'var(--text-secondary)',
                         fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {product.stock} {product.unit}
          </span>
        </div>
        <div className="stock-bar">
          <div className="stock-bar-fill" style={{
            width: `${stockPct}%`,
            background: stockPct > 50 ? 'var(--emerald)' : stockPct > 20 ? 'var(--gold)' : 'var(--ruby)',
          }} />
        </div>
      </div>

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
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <CacheIndicator meta={cacheMeta} />
        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }}
          onClick={async () => {
            setLoading(true);
            try {
              const { data } = await api.get('/products');
              setProducts(data.products);
              setCacheMeta(data._cache);
            } catch {}
            finally { setLoading(false); }
          }}>
          ⟳ Refresh
        </button>
      </div>

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
            <div key={i} className="skeleton" style={{ height: 240, animationDelay: `${i * .1}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No products yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Login as a wholesaler to add products to the catalogue
          </div>
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
              {ps.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
