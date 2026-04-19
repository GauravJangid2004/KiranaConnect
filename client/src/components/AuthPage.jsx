import { useState } from 'react';
import useAuth from '../contexts/AuthContext.jsx';

const DISTRICTS = ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Sikar'];
const ROLE_OPTIONS = [
  {
    value: 'shopOwner',
    label: 'Shop Owner',
    icon: 'ST',
    blurb: 'Browse catalogues, place orders, and manage repeat purchasing.',
  },
  {
    value: 'wholesaler',
    label: 'Wholesaler',
    icon: 'WH',
    blurb: 'Control inventory, accept orders, and dispatch batches securely.',
  },
];

const FEATURE_CARDS = [
  { icon: 'JWT', label: 'Dual-Role Access', sub: 'Each login is signed with role-specific claims.' },
  { icon: 'BCR', label: 'Password Hashing', sub: 'Passwords are hashed before they ever reach storage.' },
  { icon: 'API', label: 'Persistent Session', sub: 'The frontend restores the token after refresh.' },
  { icon: 'ACL', label: 'Strict Guards', sub: 'Wholesaler and shop owner routes stay separated.' },
];

const FIELD_META = {
  name: { icon: 'NM', label: 'Full name' },
  shopName: { icon: 'SH', label: 'Shop / Business name' },
  district: { icon: 'DT', label: 'District' },
  gstNumber: { icon: 'GST', label: 'GST number' },
  phone: { icon: 'PH', label: 'Phone number' },
  password: { icon: 'PW', label: 'Password' },
};

function BadgeIcon({ children, tone = 'saffron' }) {
  const tones = {
    saffron: { bg: 'rgba(255,107,53,.12)', border: 'rgba(255,107,53,.24)', color: 'var(--saffron)' },
    ice: { bg: 'rgba(0,229,255,.12)', border: 'rgba(0,229,255,.22)', color: 'var(--ice)' },
    emerald: { bg: 'rgba(0,230,118,.12)', border: 'rgba(0,230,118,.22)', color: 'var(--emerald)' },
  };

  const meta = tones[tone];

  return (
    <span
      style={{
        width: 40,
        height: 40,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: '.06em',
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function InputShell({ icon, children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '42px 1fr',
        alignItems: 'center',
        gap: 10,
        padding: 6,
        borderRadius: 16,
        border: '1px solid rgba(33,33,58,.9)',
        background: 'rgba(6,6,12,.42)',
      }}
    >
      <div
        style={{
          height: 44,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(180deg, rgba(23,23,40,.95), rgba(11,11,20,.95))',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '.08em',
        }}
      >
        {icon}
      </div>
      {children}
    </div>
  );
}

export default function AuthPage() {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('shopOwner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    phone: '',
    password: '',
    name: '',
    shopName: '',
    district: 'Jaipur',
    gstNumber: '',
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10);

  const validationErrors = {
    ...(mode === 'register' && !form.name.trim() ? { name: 'Full name is required' } : {}),
    ...(mode === 'register' && !form.shopName.trim() ? { shopName: 'Shop or business name is required' } : {}),
    ...(!/^\d{10}$/.test(normalizePhone(form.phone)) ? { phone: 'Enter a valid 10-digit phone number' } : {}),
    ...(form.password.length < 8 ? { password: 'Password must be at least 8 characters' } : {}),
    ...(mode === 'register' && role === 'wholesaler' && form.gstNumber && form.gstNumber.trim().length !== 15
      ? { gstNumber: 'GST must be exactly 15 characters' }
      : {}),
  };

  const formIsValid = Object.keys(validationErrors).length === 0;

  const submit = async () => {
    setError('');
    setAuthError('');
    setTouched({
      name: true,
      shopName: true,
      district: true,
      gstNumber: true,
      phone: true,
      password: true,
    });

    if (!formIsValid) {
      setError('Please fix the highlighted fields before continuing.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(normalizePhone(form.phone), form.password);
      } else {
        await register({
          ...form,
          phone: normalizePhone(form.phone),
          gstNumber: form.gstNumber.trim().toUpperCase(),
          role,
        });
      }
    } catch (e) {
      setError(e?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 18px',
        backgroundColor: 'var(--bg-void)',
        backgroundImage:
          'radial-gradient(circle at top left, rgba(255,107,53,.16), transparent 28%), radial-gradient(circle at bottom right, rgba(0,229,255,.08), transparent 24%)',
      }}
    >
      <div
        className="animate-in"
        style={{
          width: '100%',
          maxWidth: 1140,
          display: 'flex',
          flexWrap: 'wrap',
          borderRadius: 30,
          overflow: 'hidden',
          border: '1px solid rgba(33,33,58,.95)',
          background: 'rgba(8,8,16,.84)',
          boxShadow: '0 34px 90px rgba(0,0,0,.45)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <section
          style={{
            flex: '1 1 470px',
            minWidth: 320,
            padding: '42px clamp(24px, 4vw, 46px)',
            background:
              'linear-gradient(165deg, rgba(17,17,29,.98) 0%, rgba(11,11,20,.98) 55%, rgba(7,7,14,.98) 100%)',
            borderRight: '1px solid rgba(33,33,58,.95)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BadgeIcon>KC</BadgeIcon>
              <div>
                <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.04em' }}>KiranaConnect</div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: 'var(--saffron)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Auth Gateway
                </div>
              </div>
            </div>
            <span className="badge badge-primary">
              <span className="live-dot" style={{ background: 'var(--saffron)' }} />
              Member 1
            </span>
          </div>

          <div style={{ marginTop: 34, maxWidth: 470 }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1, fontWeight: 800, letterSpacing: '-.06em' }}>
              Secure dual-role access for the marketplace.
            </h1>
            <p style={{ marginTop: 18, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
              This login flow demonstrates the exact auth ownership for your project: bcrypt password hashing, JWT-based
              sessions, role-aware middleware, and frontend session persistence with Axios.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginTop: 32 }}>
            {FEATURE_CARDS.map((feature, index) => (
              <div
                key={feature.label}
                className="card"
                style={{
                  padding: '18px 16px',
                  background: index % 2 === 0 ? 'rgba(17,17,29,.9)' : 'rgba(11,11,20,.9)',
                }}
              >
                <BadgeIcon tone={index % 2 === 0 ? 'saffron' : 'ice'}>{feature.icon}</BadgeIcon>
                <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700 }}>{feature.label}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {feature.sub}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: '18px 20px',
              borderRadius: 18,
              border: '1px solid rgba(255,107,53,.2)',
              background: 'linear-gradient(180deg, rgba(255,107,53,.08), rgba(255,107,53,.02))',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <BadgeIcon tone="emerald">ON</BadgeIcon>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.14em' }}>
                Demo Credentials
              </div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>Phone 9876543210</div>
              <div style={{ marginTop: 3, color: 'var(--text-secondary)', fontSize: 13 }}>Password password123</div>
            </div>
          </div>
        </section>

        <section
          style={{
            flex: '1 1 420px',
            minWidth: 320,
            padding: '42px clamp(22px, 4vw, 38px)',
            background: 'linear-gradient(180deg, rgba(17,17,29,.98), rgba(11,11,20,.98))',
          }}
        >
          <div style={{ maxWidth: 430, margin: '0 auto' }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
                Access Portal
              </div>
              <h2 style={{ marginTop: 10, fontSize: 28, fontWeight: 800, letterSpacing: '-.04em' }}>
                {mode === 'login' ? 'Sign in to continue' : 'Register a new account'}
              </h2>
              <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                {mode === 'login'
                  ? 'Use your registered phone number and password to restore your secure session.'
                  : 'Choose a business role and create a dual-role account for the platform.'}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
                padding: 5,
                borderRadius: 16,
                border: '1px solid rgba(33,33,58,.9)',
                background: 'rgba(6,6,12,.44)',
                marginBottom: 24,
              }}
            >
              {['login', 'register'].map((nextMode) => {
                const active = mode === nextMode;

                return (
                  <button
                    key={nextMode}
                    className="btn"
                    onClick={() => {
                      setMode(nextMode);
                      setError('');
                      setAuthError('');
                    }}
                    style={{
                      minHeight: 48,
                      borderRadius: 12,
                      justifyContent: 'flex-start',
                      padding: '0 14px',
                      background: active ? 'linear-gradient(180deg, rgba(255,107,53,.18), rgba(255,107,53,.08))' : 'transparent',
                      border: active ? '1px solid rgba(255,107,53,.26)' : '1px solid transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{nextMode === 'login' ? 'IN' : 'UP'}</span>
                    {nextMode === 'login' ? 'Sign In' : 'Register'}
                  </button>
                );
              })}
            </div>

            {mode === 'register' && (
              <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Select Role
                </div>
                {ROLE_OPTIONS.map(({ value, label, icon, blurb }) => {
                  const active = role === value;

                  return (
                    <button
                      key={value}
                      className="btn"
                      onClick={() => setRole(value)}
                      style={{
                        width: '100%',
                        minHeight: 76,
                        borderRadius: 16,
                        padding: '14px 16px',
                        justifyContent: 'space-between',
                        background: active ? 'linear-gradient(180deg, rgba(255,107,53,.12), rgba(255,107,53,.05))' : 'rgba(6,6,12,.26)',
                        border: `1px solid ${active ? 'rgba(255,107,53,.28)' : 'rgba(33,33,58,.95)'}`,
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <BadgeIcon tone={active ? 'saffron' : 'ice'}>{icon}</BadgeIcon>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{blurb}</span>
                        </span>
                      </span>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `1px solid ${active ? 'var(--saffron)' : 'var(--border-hi)'}`,
                          background: active ? 'var(--saffron)' : 'transparent',
                          boxShadow: active ? '0 0 0 4px rgba(255,107,53,.12)' : 'none',
                          flexShrink: 0,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              {mode === 'register' && (
                <>
                  <InputShell icon="NM">
                    <input
                      className="input"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                    />
                  </InputShell>
                  {touched.name && validationErrors.name && (
                    <div style={{ marginTop: -4, paddingLeft: 6, fontSize: 12, color: '#ff7a92' }}>{validationErrors.name}</div>
                  )}

                  <InputShell icon="SH">
                    <input
                      className="input"
                      placeholder="Shop / Business name"
                      value={form.shopName}
                      onChange={(e) => set('shopName', e.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, shopName: true }))}
                    />
                  </InputShell>
                  {touched.shopName && validationErrors.shopName && (
                    <div style={{ marginTop: -4, paddingLeft: 6, fontSize: 12, color: '#ff7a92' }}>{validationErrors.shopName}</div>
                  )}

                  <InputShell icon="DT">
                    <select
                      className="input"
                      value={form.district}
                      onChange={(e) => set('district', e.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, district: true }))}
                      style={{ cursor: 'pointer' }}
                    >
                      {DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </InputShell>

                  {role === 'wholesaler' && (
                    <InputShell icon="GST">
                      <input
                        className="input"
                        placeholder="GST Number (optional)"
                        value={form.gstNumber}
                        onChange={(e) => set('gstNumber', e.target.value.toUpperCase().slice(0, 15))}
                        onBlur={() => setTouched((current) => ({ ...current, gstNumber: true }))}
                      />
                    </InputShell>
                  )}
                  {touched.gstNumber && validationErrors.gstNumber && (
                    <div style={{ marginTop: -4, paddingLeft: 6, fontSize: 12, color: '#ff7a92' }}>{validationErrors.gstNumber}</div>
                  )}
                </>
              )}

              <InputShell icon="PH">
                <input
                  className="input"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => set('phone', normalizePhone(e.target.value))}
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                />
              </InputShell>
              {touched.phone && validationErrors.phone && (
                <div style={{ marginTop: -4, paddingLeft: 6, fontSize: 12, color: '#ff7a92' }}>{validationErrors.phone}</div>
              )}

              <InputShell icon="PW">
                <input
                  className="input"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                />
              </InputShell>
              {touched.password && validationErrors.password && (
                <div style={{ marginTop: -4, paddingLeft: 6, fontSize: 12, color: '#ff7a92' }}>{validationErrors.password}</div>
              )}

              {(authError || error) && (
                <div
                  style={{
                    padding: '13px 14px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,23,68,.24)',
                    background: 'linear-gradient(180deg, rgba(255,23,68,.12), rgba(255,23,68,.05))',
                    color: '#ff7a92',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginRight: 8 }}>ERR</span>
                  {error || authError}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0 4px',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                }}
              >
                <span>{mode === 'login' ? 'Use your registered number to restore access.' : 'Passwords need 8+ characters.'}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {mode === 'register' ? `${role === 'wholesaler' ? 'WH' : 'SO'} MODE` : 'AUTH READY'}
                </span>
              </div>

              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={loading || !formIsValid}
                style={{
                  minHeight: 54,
                  borderRadius: 16,
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  marginTop: 4,
                }}
              >
                <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Enter Secure Portal' : 'Create Account'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{loading ? '...' : '->'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
