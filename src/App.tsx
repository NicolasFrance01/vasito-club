
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Stock from './pages/Stock';
import Finances from './pages/Finances';
import CalendarView from './pages/CalendarView';
import Recipes from './pages/Recipes';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
