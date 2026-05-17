import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './components/AuthPage';
import Topbar from './components/Topbar';
import Catalogue from './components/Catalogue';
import Cart from './components/Cart';
import MyOrders from './components/MyOrders';
import { WholesalerOrders, WholesalerBatches, WholesalerProducts } from './components/WholesalerDashboard';

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#04040A' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🏪</div>
        <div style={{ fontFamily:'monospace', color:'#44446A', fontSize:13 }}>Restoring session…</div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/app" replace /> : children;
}

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === 'wholesaler' ? 'wh-orders' : 'catalogue'
  );
  const isWholesaler = user?.role === 'wholesaler';

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex:1, overflowY:'auto' }}>
        {!isWholesaler && activeTab === 'catalogue'  && <Catalogue />}
        {!isWholesaler && activeTab === 'cart'       && <Cart onOrderPlaced={() => setActiveTab('myorders')} />}
        {!isWholesaler && activeTab === 'myorders'   && <MyOrders />}
        {isWholesaler  && activeTab === 'wh-orders'  && <WholesalerOrders />}
        {isWholesaler  && activeTab === 'wh-batches' && <WholesalerBatches />}
        {isWholesaler  && activeTab === 'wh-products'&& <WholesalerProducts />}
      </main>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <LandingPage onGetStarted={() => navigate('/login')} onLogin={() => navigate('/login')} />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute><AuthPage /></PublicRoute>
      } />
      <Route path="/app" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
