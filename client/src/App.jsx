import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Topbar from './components/Topbar';

const SHOP_OWNER_TABS = ['catalogue', 'cart', 'myorders'];
const WHOLESALER_TABS = ['wh-orders', 'wh-batches', 'wh-products'];

function DashboardPanel({ title, body, tone = 'saffron' }) {
  const toneMap = {
    saffron: { border: 'rgba(255,107,53,.24)', glow: 'rgba(255,107,53,.14)', badge: 'badge-primary' },
    ice:     { border: 'rgba(84,213,255,.22)', glow: 'rgba(84,213,255,.08)',  badge: 'badge-info' },
    emerald: { border: 'rgba(32,214,143,.22)', glow: 'rgba(32,214,143,.08)', badge: 'badge-success' },
  };

  const meta = toneMap[tone];

  return (
    <div
      className="card animate-in"
      style={{
        padding: 28,
        borderColor: meta.border,
        background: `linear-gradient(180deg, ${meta.glow}, rgba(15,20,31,.98))`,
        boxShadow: '0 22px 44px rgba(0,0,0,.18)',
      }}
    >
      <span className={`badge ${meta.badge}`}>Member 1 Scope</span>
      <h2 style={{ marginTop: 16, fontSize: 26, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.15 }}>{title}</h2>
      <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75 }}>{body}</p>
    </div>
  );
}

function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('catalogue');

  useEffect(() => {
    if (!user) return;
    const allowedTabs = user.role === 'wholesaler' ? WHOLESALER_TABS : SHOP_OWNER_TABS;
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [activeTab, user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', padding: 28, borderRadius: 24, border: '1px solid rgba(52,69,99,.42)', background: 'linear-gradient(180deg, rgba(18,24,38,.94), rgba(12,16,26,.98))', boxShadow: '0 24px 52px rgba(0,0,0,.22)' }}>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-.05em' }}>KC</div>
          <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
            Restoring session...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const isWholesaler = user.role === 'wholesaler';

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '34px 18px 56px' }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <section
            className="card animate-in"
            style={{
              padding: '28px 28px 30px',
              background: 'linear-gradient(135deg, rgba(255,107,53,.12), rgba(84,213,255,.06) 48%, rgba(18,24,38,.96) 100%)',
              borderColor: 'rgba(52,69,99,.56)',
            }}
          >
            <span className={`badge ${isWholesaler ? 'badge-violet' : 'badge-primary'}`}>
              {isWholesaler ? 'Wholesale Session' : 'Retail Session'}
            </span>
            <h1 style={{ marginTop: 18, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-.05em', lineHeight: 1.02 }}>
              Secure dual-role access for KiranaConnect
            </h1>
            <p style={{ marginTop: 16, maxWidth: 760, color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.8 }}>
              This Member 1 module handles credential verification, JWT-based session continuity, and strict role isolation so shop owners and wholesalers only reach the routes meant for them.
            </p>
            <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-success">bcrypt Password Hashing</span>
              <span className="badge badge-info">Role Claims in JWT</span>
              <span className="badge badge-primary">Persistent AuthContext</span>
            </div>
          </section>

          <DashboardPanel
            title={`Authenticated as ${isWholesaler ? 'Wholesaler' : 'Shop Owner'}`}
            body={`This branch isolates Member 1 work: dual-role login, JWT session persistence, Axios auth headers, and role-based navigation control. Logged in user: ${user.shopName}.`}
            tone={isWholesaler ? 'ice' : 'saffron'}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <DashboardPanel
              title="bcrypt + User Schema"
              body="Passwords are hashed before save, phone numbers are normalized, and the password field is hidden by default from normal queries."
              tone="emerald"
            />
            <DashboardPanel
              title="JWT + Role Guards"
              body="Tokens are signed with userId, role, and shopName. Protected backend routes reject the wrong role even if someone manually edits the frontend."
              tone="ice"
            />
            <DashboardPanel
              title="AuthContext + Axios"
              body="The client restores the stored token after refresh and re-attaches it to requests automatically so the login session persists."
              tone="saffron"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
