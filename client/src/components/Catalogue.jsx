import { useEffect, useState, useCallback } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import api from '../services/api.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function getBestPrice(tiers, qty) {
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  const match  = sorted.find((t) => qty >= t.minQty);
  return match ? match.price : tiers[0].price;
}

const CATEGORIES = ['All', 'Grains', 'Pulses', 'Oils', 'Essentials'];

// ─── sub-components ──────────────────────────────────────────────────────────

function CacheBadge({ cache }) {
  if (!cache) return null;
  return (
    <span
      className={`badge ${cache.hit ? 'badge-green' : 'badge-amber'}`}
      title={`Response in ${cache.latency}ms`}
    >
      {cache.hit ? '⚡ Cache hit' : '🔄 Cache miss'} · {cache.latency}ms
    </span>
  );
}

function TierTable({ tiers }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', marginTop: 8 }}>
      <thead>
        <tr style={{ color: 'var(--gray-400)', textAlign: 'left' }}>
          <th style={{ paddingBottom: 2 }}>Min qty</th>
          <th style={{ paddingBottom: 2, textAlign: 'right' }}>Price/unit</th>
        </tr>
      </thead>
      <tbody>
        {tiers.map((t, i) => (
          <tr key={i} style={{ borderTop: '1px solid var(--gray-100)' }}>
            <td style={{ padding: '3px 0' }}>{t.minQty}+</td>
            <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 500 }}>₹{t.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductCard({ product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(product.minOrderQty);

  const price    = getBestPrice(product.tiers, qty);
  const inStock  = product.stock >= qty;

  function handleQtyChange(e) {
    const v = Math.max(product.minOrderQty, parseInt(e.target.value) || product.minOrderQty);
    setQty(v);
  }

  function handleAdd() {
    addItem({ ...product, quantity: qty, unitPrice: price });
  }

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ marginBottom: 2 }}>{product.name}</h3>
          <span className="text-muted">{product.wholesaler.shopName}</span>
        </div>
        <span className="badge badge-blue">{product.category}</span>
      </div>

      {/* stock */}
      <div className="flex items-center gap-2">
        <span
          className={`badge ${product.stock > 0 ? 'badge-green' : 'badge-red'}`}
          style={{ fontSize: '0.7rem' }}
        >
          {product.stock > 0 ? `${product.stock} ${product.unit} left` : 'Out of stock'}
        </span>
        <span className="text-muted">Min: {product.minOrderQty} {product.unit}</span>
      </div>

      {/* tiers */}
      <TierTable tiers={product.tiers} />

      {/* qty + add */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          type="number"
          min={product.minOrderQty}
          value={qty}
          onChange={handleQtyChange}
          style={{ width: 80 }}
          aria-label="Quantity"
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', alignSelf: 'center', flex: 1 }}>
          ₹{price}/{product.unit} · <strong>₹{(price * qty).toLocaleString()}</strong>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleAdd}
        disabled={!inStock}
        style={{ marginTop: 4 }}
      >
        {inStock ? '+ Add to cart' : 'Out of stock'}
      </button>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function Catalogue() {
  const [products,  setProducts]  = useState([]);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [category,  setCategory]  = useState('All');
  const [search,    setSearch]    = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/products');
      setProducts(data.data);
      setCacheInfo(data._cache);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load catalogue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchCat    = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      <div className="container">
        {/* header row */}
        <div className="page-header">
          <div>
            <h1>Product Catalogue</h1>
            <div className="flex items-center gap-2 mt-1">
              <CacheBadge cache={cacheInfo} />
            </div>
          </div>
          <button className="btn btn-secondary" onClick={fetchProducts} disabled={loading}>
            ↻ Refresh
          </button>
        </div>

        {/* filters */}
        <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="btn"
              style={{
                padding: '6px 12px',
                background: category === c ? 'var(--green)' : 'var(--gray-100)',
                color:      category === c ? '#fff'        : 'var(--gray-800)',
                border:     '1px solid var(--gray-200)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* states */}
        {loading && <div className="spinner" />}

        {error && (
          <div className="card" style={{ padding: 16, color: 'var(--red)', border: '1px solid var(--red-light)' }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <p>No products found</p>
          </div>
        )}

        {/* grid */}
        {!loading && !error && filtered.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
