import { useEffect, useMemo, useState } from 'react';
import useAuth from '../contexts/AuthContext.jsx';

const SHOP_OWNER_TABS = [
  { id: 'catalogue', label: 'Catalogue', icon: 'CP', hint: 'Browse products' },
  { id: 'cart', label: 'Cart', icon: 'CT', hint: 'Review selections' },
  { id: 'myorders', label: 'My Orders', icon: 'OD', hint: 'Track requests' },
];

const WHOLESALER_TABS = [
  { id: 'wh-orders', label: 'Incoming', icon: 'IN', hint: 'New order flow' },
  { id: 'wh-batches', label: 'Batches', icon: 'BT', hint: 'Dispatch windows' },
  { id: 'wh-products', label: 'Products', icon: 'PD', hint: 'Stock listings' },
];

function BrandMark() {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(180deg, rgba(255,107,53,.22), rgba(255,107,53,.08))',
        border: '1px solid rgba(255,107,53,.26)',
        boxShadow: '0 10px 30px rgba(255,107,53,.14)',
        color: 'var(--saffron)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: '.08em',
        flexShrink: 0,
      }}
    >
      KC
    </div>
  );
}

function MetaChip({ label, value, tone = 'default' }) {
  const tones = {
    default: {
      background: 'rgba(17,17,29,.92)',
      border: 'rgba(33,33,58,.95)',
      valueColor: 'var(--text-primary)',
    },
    ice: {
      background: 'rgba(0,229,255,.08)',
      border: 'rgba(0,229,255,.18)',
      valueColor: 'var(--ice)',
    },
    saffron: {
      background: 'rgba(255,107,53,.08)',
      border: 'rgba(255,107,53,.18)',
      valueColor: 'var(--saffron)',
    },
  };

  const theme = tones[tone];

  return (
    <div
      style={{
        minHeight: 42,
        padding: '8px 12px',
        borderRadius: 14,
        border: `1px solid ${theme.border}`,
        background: theme.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontSize: 9,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {label}
      </span>
      <span style={{ marginTop: 3, fontSize: 12, fontWeight: 700, color: theme.valueColor }}>{value}</span>
    </div>
  );
}

function TabButton({ tab, active, onClick }) {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        minHeight: 50,
        padding: '0 14px',
        borderRadius: 16,
        background: active ? 'linear-gradient(180deg, rgba(255,107,53,.18), rgba(255,107,53,.06))' : 'rgba(10,10,18,.44)',
        border: `1px solid ${active ? 'rgba(255,107,53,.28)' : 'rgba(33,33,58,.92)'}`,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        display: 'grid',
        gridTemplateColumns: '34px 1fr',
        gap: 10,
        alignItems: 'center',
        textAlign: 'left',
        boxShadow: active ? '0 14px 32px rgba(255,107,53,.1)' : 'none',
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          display: 'grid',
          placeItems: 'center',
          background: active ? 'rgba(255,107,53,.16)' : 'rgba(17,17,29,.92)',
          border: `1px solid ${active ? 'rgba(255,107,53,.24)' : 'rgba(33,33,58,.9)'}`,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          color: active ? 'var(--saffron)' : 'var(--text-secondary)',
        }}
      >
        {tab.icon}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{tab.label}</span>
        <span style={{ fontSize: 11, color: active ? 'rgba(241,241,251,.72)' : 'var(--text-muted)' }}>{tab.hint}</span>
      </span>
    </button>
  );
}

export default function Topbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());

  const isWholesaler = user?.role === 'wholesaler';
  const tabs = useMemo(() => (isWholesaler ? WHOLESALER_TABS : SHOP_OWNER_TABS), [isWholesaler]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id);
    }
  }, [activeTab, setActiveTab, tabs]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(33,33,58,.95)',
        background: 'rgba(6,6,12,.84)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '16px 18px',
          display: 'grid',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrandMark />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.03em' }}>KiranaConnect</span>
                <span className={`badge ${isWholesaler ? 'badge-violet' : 'badge-info'}`}>
                  {isWholesaler ? 'Wholesaler Access' : 'ShopOwner Access'}
                </span>
              </div>
              <div style={{ marginTop: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                Role-based navigation with secure session control
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <MetaChip label="Workspace" value={isWholesaler ? 'Wholesale Desk' : 'Retail Desk'} tone="saffron" />
            <MetaChip label="Shop" value={user?.shopName || 'Active account'} />
            <MetaChip label="Live Time" value={time.toLocaleTimeString('en-IN', { hour12: false })} tone="ice" />
            <button className="btn btn-ghost" onClick={logout} style={{ minHeight: 42, padding: '0 16px', borderRadius: 14 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>OUT</span>
              Logout
            </button>
          </div>
        </div>

        <nav
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 10,
          }}
        >
          {tabs.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </nav>
      </div>
    </header>
  );
}
