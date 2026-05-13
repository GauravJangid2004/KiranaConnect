import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Topbar from './components/Topbar';
import LandingPage from './pages/LandingPage';

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
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
          <div className="text-5xl font-black mb-3 text-orange-500">KC</div>
          <div className="text-sm font-mono text-gray-600">
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
    <div className="min-h-screen bg-gray-50">
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Welcome Section */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              isWholesaler 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {isWholesaler ? 'Wholesale Session' : 'Retail Session'}
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-black leading-tight text-gray-900">
              Secure dual-role access for KiranaConnect
            </h1>
            <p className="mt-4 max-w-3xl text-gray-600 leading-relaxed">
              This Member 1 module handles credential verification, JWT-based session continuity, and strict role isolation so shop owners and wholesalers only reach the routes meant for them.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">bcrypt Password Hashing</span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">Role Claims in JWT</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Persistent AuthContext</span>
            </div>
          </section>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl font-black text-orange-500 mb-1">₹4.2L</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Orders</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl font-black text-orange-500 mb-1">₹2.8L</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Revenue</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl font-black text-orange-500 mb-1">156</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Orders</div>
            </div>
          </div>

          {/* User Info Panel */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Authenticated</span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Welcome, {user.shopName}
            </h2>
            <p className="mt-2 text-gray-600">
              Role: {isWholesaler ? 'Wholesaler' : 'Shop Owner'} • Member 1 Access
            </p>
            <div className="mt-4 flex gap-3">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">View Dashboard</button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">Manage Orders</button>
            </div>
          </section>

          {/* Orders Table */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">#KC-001</td>
                    <td className="py-3 px-4 text-gray-900">Ram Kirana Store</td>
                    <td className="py-3 px-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Dispatched</span></td>
                    <td className="py-3 px-4 text-gray-900">₹12,500</td>
                    <td className="py-3 px-4 text-gray-900">2024-01-15</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">#KC-002</td>
                    <td className="py-3 px-4 text-gray-900">Sharma Grocery</td>
                    <td className="py-3 px-4"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">Pending</span></td>
                    <td className="py-3 px-4 text-gray-900">₹8,750</td>
                    <td className="py-3 px-4 text-gray-900">2024-01-14</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-900">#KC-003</td>
                    <td className="py-3 px-4 text-gray-900">Patel Mart</td>
                    <td className="py-3 px-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Cancelled</span></td>
                    <td className="py-3 px-4 text-gray-900">₹15,200</td>
                    <td className="py-3 px-4 text-gray-900">2024-01-13</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center p-7 rounded-3xl border border-gray-300 bg-linear-to-b from-gray-900 to-gray-800 shadow-2xl">
        <div className="text-5xl font-black tracking-tight text-white">KC</div>
        <div className="mt-3 font-mono text-sm text-gray-400">
          Restoring session...
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/app" replace /> : children;
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage onGetStarted={() => navigate('/login')} onLogin={() => navigate('/login')} />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
