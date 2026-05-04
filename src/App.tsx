
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Stock from './pages/Stock';
import Finances from './pages/Finances';
import CalendarView from './pages/CalendarView';

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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
