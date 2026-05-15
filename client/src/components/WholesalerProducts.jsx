/**
 * WHOLESALER PRODUCTS — Member 2
 * Allows wholesalers to add products and update stock.
 * Demonstrates cache invalidation: every write calls del(CACHE_KEY) on the server.
 */
import { useState, useEffect } from 'react';
import api from '../services/api';

const CATEGORIES = ['Grains', 'Pulses', 'Oils', 'Sweeteners', 'Condiments'];

export default function WholesalerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'Grains', unit: 'kg', stock: 100, moq: 10,
    basePrice: 50, imageEmoji: '📦',
    tiers: [{ minQty: 25, pricePerUnit: 45 }, { minQty: 50, pricePerUnit: 40 }],
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addProduct = async () => {
    setSaving(true);
    try {
      await api.post('/products', form);
      setShowForm(false);
      setForm({ name: '', category: 'Grains', unit: 'kg', stock: 100, moq: 10,
                basePrice: 50, imageEmoji: '📦',
                tiers: [{ minQty: 25, pricePerUnit: 45 }, { minQty: 50, pricePerUnit: 40 }] });
      setToast('Product added — cache invalidated ✓');
      setTimeout(() => setToast(''), 3000);
      await fetchProducts();
    } catch (e) { setToast('Error: ' + (e.error || 'Failed')); setTimeout(() => setToast(''), 3000); }
    finally { setSaving(false); }
  };

  const updateStock = async (id, newStock) => {
    try {
      await api.patch(`/products/${id}/stock`, { stock: newStock });
      setToast('Stock updated — cache invalidated ✓');
      setTimeout(() => setToast(''), 3000);
      await fetchProducts();
    } catch (e) { setToast('Error: ' + (e.error || 'Failed')); setTimeout(() => setToast(''), 3000); }
  };

  const EMOJIS = ['📦','🍚','🌾','🫘','🟡','🫙','🛢️','🍬','🧂','🥜','🫒','🍯'];

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>My Products</h2>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {products.length} listed
        </span>
        <button className="btn btn-primary" style={{ marginLeft: 'auto', fontSize: 12, padding: '6px 14px' }}
          onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>New Product</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input className="input" placeholder="Product name" value={form.name}
              onChange={e => set('name', e.target.value)} />
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Unit (kg/liter)" value={form.unit}
                onChange={e => set('unit', e.target.value)} style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => set('imageEmoji', e)}
                    style={{ fontSize: 18, background: form.imageEmoji === e ? 'var(--saffron-dim)' : 'transparent',
                             border: form.imageEmoji === e ? '1px solid var(--saffron)' : '1px solid transparent',
                             borderRadius: 6, padding: '2px 4px', cursor: 'pointer' }}>{e}</button>
                ))}
              </div>
            </div>
            <input className="input" type="number" placeholder="Stock" value={form.stock}
              onChange={e => set('stock', Number(e.target.value))} />
            <input className="input" type="number" placeholder="MOQ" value={form.moq}
              onChange={e => set('moq', Number(e.target.value))} />
            <input className="input" type="number" placeholder="Base Price (₹)" value={form.basePrice}
              onChange={e => set('basePrice', Number(e.target.value))} />
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            Tier 1: {form.tiers[0].minQty}+ units → ₹{form.tiers[0].pricePerUnit} · 
            Tier 2: {form.tiers[1].minQty}+ units → ₹{form.tiers[1].pricePerUnit}
          </div>
          <button className="btn btn-primary" onClick={addProduct} disabled={saving || !form.name}
            style={{ marginTop: 14, padding: '10px 24px' }}>
            {saving ? '⟳ Saving...' : 'Add Product →'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No products listed yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Click "Add Product" to list your first item
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {products.map(p => (
            <div key={p._id} className="card animate-in" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>{p.imageEmoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ₹{p.basePrice}/{p.unit} · MOQ: {p.moq}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  Tiers: {p.tiers?.map(t => `${t.minQty}+→₹${t.pricePerUnit}`).join(' · ')}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                               color: p.stock < p.moq * 3 ? 'var(--ruby)' : 'var(--emerald)' }}>
                  {p.stock}
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 10 }}
                    onClick={() => updateStock(p._id, p.stock + 100)}>+100</button>
                  <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 10 }}
                    onClick={() => updateStock(p._id, p.stock + 500)}>+500</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="animate-right" style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--bg-elevated)', border: '1px solid var(--emerald)',
          borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600,
          color: 'var(--emerald)', boxShadow: '0 8px 24px rgba(0,0,0,.5)', zIndex: 200,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
