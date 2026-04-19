import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';


const SHOP_OWNER_TABS = [
  { id: 'catalogue', label: 'Catalogue', icon: 'CP', hint: 'Browse products' },
  { id: 'cart',      label: 'Cart',      icon: 'CT', hint: 'Review selections' },
  { id: 'myorders',  label: 'My Orders', icon: 'OD', hint: 'Track requests' },
];

const WHOLESALER_TABS = [
  { id: 'wh-orders',   label: 'Incoming',  icon: 'IN', hint: 'New order flow' },
  { id: 'wh-batches',  label: 'Batches',   icon: 'BT', hint: 'Dispatch windows' },
  { id: 'wh-products', label: 'Products',  icon: 'PD', hint: 'Stock listings' },
];

function BrandMark() {
  return (
    <div style={{
      width: 50, height: 50, borderRadius: 16,
      display: 'grid', placeItems: 'center',
      background: 'linear-gradient(180deg, rgba(255,107,53,.24), rgba(255,107,53,.08))',
      border: '1px solid rgba(255,107,53,.3)',
      boxShadow: '0 16px 34px rgba(255,107,53,.14)',
      color: '#fff6f1',
      fontFamily: 'var(--font-mono)',
      fontWeight: 800, fontSize: 14, letterSpacing: '.08em', flexShrink: 0,
    }}>
      KC
    </div>
  );
}

function MetaChip({ label, value, tone = 'default' }) {
  const tones = {
    default: { background: 'rgba(17,17,29,.92)', border: 'rgba(33,33,58,.95)', valueColor: 'var(--text-primary)' },
    ice:     { background: 'rgba(0,229,255,.08)', border: 'rgba(0,229,255,.18)', valueColor: '#00E5FF' },
    saffron: { background: 'rgba(255,107,53,.08)', border: 'rgba(255,107,53,.18)', valueColor: 'var(--saffron)' },
  };
  const theme = tones[tone];
  return (
    <div style={{
      minHeight: 48, padding: '9px 13px', borderRadius: 14,
      border: `1px solid ${theme.border}`, background: theme.background,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <span style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      <span style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: theme.valueColor }}>{value}</span>
    </div>
  );
}

function TabButton({ tab, active, onClick, badge }) {
  return (
    <button className="btn" onClick={onClick} style={{
      minHeight: 58, padding: '0 16px', borderRadius: 18,
      background: active ? 'linear-gradient(180deg, rgba(255,107,53,.18), rgba(255,107,53,.06))' : 'linear-gradient(180deg, rgba(18,24,38,.92), rgba(12,16,26,.92))',
      border: `1px solid ${active ? 'rgba(255,107,53,.3)' : 'rgba(52,69,99,.72)'}`,
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      display: 'grid', gridTemplateColumns: '34px 1fr', gap: 10,
      alignItems: 'center', textAlign: 'left',
      boxShadow: active ? '0 18px 34px rgba(255,107,53,.12)' : '0 8px 20px rgba(0,0,0,.12)',
      position: 'relative',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 11,
        display: 'grid', placeItems: 'center',
        background: active ? 'rgba(255,107,53,.16)' : 'rgba(17,24,37,.92)',
        border: `1px solid ${active ? 'rgba(255,107,53,.24)' : 'rgba(52,69,99,.72)'}`,
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        color: active ? 'var(--saffron)' : 'var(--text-secondary)',
      }}>
        {tab.icon}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          {tab.label}
          {badge > 0 && (
            <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--saffron)', color: '#fff', borderRadius: 20, padding: '1px 6px' }}>
              {badge}
            </span>
          )}
        </span>
        <span style={{ fontSize: 12, color: active ? 'rgba(241,241,251,.76)' : 'var(--text-muted)' }}>{tab.hint}</span>
      </span>
    </button>
  );
}

export default function Topbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const totals = { itemCount: 0 };
  const [time, setTime]  = useState(new Date());

  const isWholesaler = user?.role === 'wholesaler';
  const tabs = useMemo(() => (isWholesaler ? WHOLESALER_TABS : SHOP_OWNER_TABS), [isWholesaler]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!tabs.some(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id);
    }
  }, [activeTab, setActiveTab, tabs]);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid rgba(52,69,99,.46)',
      background: 'rgba(8,12,20,.82)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 30px rgba(0,0,0,.16)',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '18px 18px 16px', display: 'grid', gap: 16 }}>

        {/* Top row — brand + meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrandMark />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.03em' }}>KiranaConnect</span>
                <span className={`badge ${isWholesaler ? 'badge-violet' : 'badge-info'}`}>
                  {isWholesaler ? 'Wholesaler Access' : 'ShopOwner Access'}
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                Role-based navigation with secure session control
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <MetaChip label="Workspace" value={isWholesaler ? 'Wholesale Desk' : 'Retail Desk'} tone="saffron" />
            <MetaChip label="Shop"      value={user?.shopName || 'Active account'} />
            <MetaChip label="Live Time" value={time.toLocaleTimeString('en-IN', { hour12: false })} tone="ice" />
            <button className="btn btn-ghost" onClick={logout}
              style={{ minHeight: 48, padding: '0 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>OUT</span>
              Logout
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              badge={tab.id === 'cart' ? totals?.itemCount : 0}
            />
          ))}
        </nav>

      </div>
    </header>
  );
}
