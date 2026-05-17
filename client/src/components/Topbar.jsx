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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top row — brand + meta */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              KC
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-black text-gray-900">KiranaConnect</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isWholesaler ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {isWholesaler ? 'Wholesaler Access' : 'ShopOwner Access'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Role-based navigation with secure session control
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Workspace</div>
              <div className="text-sm font-semibold text-gray-900">{isWholesaler ? 'Wholesale Desk' : 'Retail Desk'}</div>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Shop</div>
              <div className="text-sm font-semibold text-gray-900">{user?.shopName || 'Active account'}</div>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live Time</div>
              <div className="text-sm font-semibold font-mono text-gray-900">{time.toLocaleTimeString('en-IN', { hour12: false })}</div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-50 border-orange-200 text-orange-900'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.hint}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
