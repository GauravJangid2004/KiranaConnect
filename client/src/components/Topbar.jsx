import { useEffect, useMemo, useState } from 'react';
import useAuth from '../contexts/AuthContext.jsx';

const SHOP_OWNER_TABS = [
  { id: 'catalogue', label: 'Catalogue', icon: 'CT' },
  { id: 'cart', label: 'Cart', icon: 'CR' },
  { id: 'myorders', label: 'My Orders', icon: 'OR' },
];

const WHOLESALER_TABS = [
  { id: 'wh-orders', label: 'Incoming', icon: 'IN' },
  { id: 'wh-batches', label: 'Batches', icon: 'BT' },
  { id: 'wh-products', label: 'Products', icon: 'PD' },
];

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
        borderBottom: '1px solid var(--border)',
        background: 'rgba(11,11,20,.88)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(180deg, rgba(255,107,53,.18), rgba(255,107,53,.08))',
              border: '1px solid rgba(255,107,53,.24)',
              color: 'var(--saffron)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            KC
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.02em' }}>KiranaConnect</div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--text-muted)' }}>Dual-role auth branch</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                minHeight: 40,
                padding: '0 14px',
                borderRadius: 12,
                background: activeTab === tab.id ? 'rgba(255,107,53,.12)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(255,107,53,.26)' : 'var(--border)'}`,
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <span className={`badge ${isWholesaler ? 'badge-violet' : 'badge-info'}`}>
            {isWholesaler ? 'Wholesaler' : 'ShopOwner'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.shopName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {time.toLocaleTimeString('en-IN', { hour12: false })}
          </span>
          <button className="btn btn-ghost" onClick={logout} style={{ minHeight: 40, padding: '0 14px' }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
