import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Topbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [time, setTime]  = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isWholesaler = user?.role === 'wholesaler';

  const shopOwnerTabs  = [
    { id: 'catalogue', label: 'Catalogue', icon: '📦' },
  ];
  const wholesalerTabs = [
    { id: 'wh-products', label: 'My Products', icon: '🏷️' },
  ];

  const tabs = isWholesaler ? wholesalerTabs : shopOwnerTabs;

  return (
    <header style={{
      height: 52, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 0,
      position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 180 }}>
        <span style={{ fontSize: 18 }}>🏪</span>
        <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-.01em' }}>KiranaConnect</span>
        <span className="badge badge-primary" style={{ fontSize: 8 }}>
          <span className="live-dot" style={{ background: 'var(--saffron)' }}></span>
          LIVE
        </span>
      </div>

      <nav style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
              border: activeTab === tab.id ? '1px solid var(--border-hi)' : '1px solid transparent',
              borderRadius: 6, padding: '5px 14px', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
              transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5,
            }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 280, justifyContent: 'flex-end' }}>
        <span className={`badge ${isWholesaler ? 'badge-violet' : 'badge-info'}`}>
          {isWholesaler ? '🏭 Wholesaler' : '🏪 ShopOwner'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 120,
                       overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.shopName}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {time.toLocaleTimeString('en-IN', { hour12: false })}
        </span>
        <button className="btn btn-ghost" onClick={logout}
          style={{ padding: '4px 10px', fontSize: 11 }}>
          Exit
        </button>
      </div>
    </header>
  );
}
