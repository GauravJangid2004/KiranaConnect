import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DISTRICTS = ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Sikar'];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode]     = useState('login');
  const [role, setRole]     = useState('shopOwner');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({
    phone: '', password: '', name: '', shopName: '', district: 'Jaipur', gstNumber: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.phone, form.password);
      } else {
        await register({ ...form, role });
      }
    } catch (e) { setError(e.error || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
         className="grid-bg">
      <div style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 900, minHeight: 580, borderRadius: 18,
                    border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.7)' }}>

        {/* Left brand panel */}
        <div style={{ flex: 1, background: 'linear-gradient(160deg, #0D0D1C 0%, #09090F 100%)',
                      padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      borderRight: '1px solid var(--border)', minWidth: 280 }}>
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.2 }}>
              KiranaConnect
            </h1>
            <p style={{ color: 'var(--saffron)', fontSize: 11, fontFamily: 'var(--font-mono)',
                        letterSpacing: '.12em', marginTop: 4, textTransform: 'uppercase' }}>
              Mandi Terminal · Jaipur District
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: '⚡', label: 'Live Wholesale Prices', sub: 'Tiered slab pricing' },
              { icon: '🔄', label: '6-Hour Dispatch Batches', sub: 'Aggregated, never missed' },
              { icon: '⚛️',  label: 'Redis-Cached Catalogue', sub: '24h TTL, sub-ms reads' },
              { icon: '🔒', label: 'Atomic Stock Control',   sub: 'No overselling, ever' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, lineHeight: 1.4 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Register as wholesaler to add products
          </div>
        </div>

        {/* Right form panel */}
        <div style={{ flex: 1, background: 'var(--bg-surface)', padding: '40px 36px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 28,
                        background: 'var(--bg-base)', borderRadius: 8, padding: 4 }}>
            {['login', 'register'].map(m => (
              <button key={m} className="btn" onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, fontSize: 12, padding: '7px 0', borderRadius: 6,
                         background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                         color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                         border: mode === m ? '1px solid var(--border-hi)' : '1px solid transparent' }}>
                {m === 'login' ? '🔑 Sign In' : '📝 Register'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase',
                              letterSpacing: '.08em', marginBottom: 6, display: 'block' }}>I am a</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { val: 'shopOwner',  emoji: '🏪', label: 'Shop Owner' },
                  { val: 'wholesaler', emoji: '🏭', label: 'Wholesaler' },
                ].map(({ val, emoji, label }) => (
                  <button key={val} className="btn" onClick={() => setRole(val)}
                    style={{ flex: 1, fontSize: 13, padding: '10px 0', borderRadius: 8,
                             background: role === val ? 'var(--saffron-dim)' : 'var(--bg-base)',
                             color: role === val ? 'var(--saffron)' : 'var(--text-secondary)',
                             border: `1px solid ${role === val ? 'rgba(255,107,53,.3)' : 'var(--border)'}` }}>
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'register' && (
              <>
                <input className="input" placeholder="Full name" value={form.name}
                       onChange={e => set('name', e.target.value)} />
                <input className="input" placeholder="Shop / Business name" value={form.shopName}
                       onChange={e => set('shopName', e.target.value)} />
                <select className="input" value={form.district} onChange={e => set('district', e.target.value)}
                  style={{ cursor: 'pointer' }}>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {role === 'wholesaler' && (
                  <input className="input" placeholder="GST Number (optional)" value={form.gstNumber}
                         onChange={e => set('gstNumber', e.target.value)} />
                )}
              </>
            )}
            <input className="input" placeholder="Phone number" value={form.phone}
                   onChange={e => set('phone', e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={form.password}
                   onChange={e => set('password', e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && submit()} />

            {error && (
              <div style={{ background: 'var(--ruby-dim)', border: '1px solid rgba(255,23,68,.2)',
                            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--ruby)' }}>
                ⚠ {error}
              </div>
            )}

            <button className="btn btn-primary" onClick={submit} disabled={loading}
              style={{ marginTop: 4, padding: '12px 0', fontSize: 14 }}>
              {loading ? '⟳ Please wait...' : mode === 'login' ? 'Enter Mandi Terminal →' : 'Create Account →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
