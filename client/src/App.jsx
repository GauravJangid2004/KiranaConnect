import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Topbar from './components/Topbar';
import Catalogue from './components/Catalogue';
import WholesalerProducts from './components/WholesalerProducts';

function AppInner() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('catalogue');

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 40 }}>🏪</div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 13 }}>
          Initializing Mandi Terminal…
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const isWholesaler = user.role === 'wholesaler';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {!isWholesaler && <Catalogue />}
        {isWholesaler && <WholesalerProducts />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
