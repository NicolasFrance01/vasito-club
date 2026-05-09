import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Stock from './pages/Stock';
import Finances from './pages/Finances';
import CalendarView from './pages/CalendarView';
import Recipes from './pages/Recipes';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Users from './pages/Users';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-4">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/catalog" element={<ProtectedRoute><Layout><Catalog /></Layout></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute><Layout><Stock /></Layout></ProtectedRoute>} />
      <Route path="/finances" element={<ProtectedRoute><Layout><Finances /></Layout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarView /></Layout></ProtectedRoute>} />
      <Route path="/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute adminOnly><Layout><Users /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppRoutes />
  );
}

export default App;
