import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import AuthPage from './components/AuthPage.jsx';
import Topbar from './components/Topbar.jsx';

const SHOP_OWNER_TABS = ['catalogue', 'cart', 'myorders'];
const WHOLESALER_TABS = ['wh-orders', 'wh-batches', 'wh-products'];

function DashboardPanel({ title, body, tone = 'saffron' }) {
  const toneMap = {
    saffron: { border: 'rgba(255,107,53,.22)', glow: 'rgba(255,107,53,.12)', badge: 'badge-primary' },
    ice:     { border: 'rgba(0,229,255,.2)',   glow: 'rgba(0,229,255,.08)',  badge: 'badge-info' },
    emerald: { border: 'rgba(0,230,118,.2)',   glow: 'rgba(0,230,118,.08)', badge: 'badge-success' },
  };

  const meta = toneMap[tone];

  return (
    <div
      className="card animate-in"
      style={{
        padding: 24,
        borderColor: meta.border,
        background: `linear-gradient(180deg, ${meta.glow}, rgba(13,13,28,.98))`,
      }}
    >
      <span className={`badge ${meta.badge}`}>Member 1 Scope</span>
      <h2 style={{ marginTop: 14, fontSize: 24, fontWeight: 800, letterSpacing: '-.04em' }}>{title}</h2>
      <p style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>{body}</p>
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.05em' }}>KC</div>
          <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 18px 48px' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <DashboardPanel
            title={`Authenticated as ${isWholesaler ? 'Wholesaler' : 'Shop Owner'}`}
            body={`This branch isolates Member 1 work: dual-role login, JWT session persistence, Axios auth headers, and role-based navigation control. Logged in user: ${user.shopName}.`}
            tone={isWholesaler ? 'ice' : 'saffron'}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
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