import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Wallet, CalendarDays, ChefHat, BarChart3 } from 'lucide-react';
import logoUrl from '../assets/logo.png';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout-container">
      <aside className="sidebar glass">
        <div className="sidebar-header" style={{ paddingBottom: '1rem' }}>
          <div className="logo-container" style={{ padding: 0, overflow: 'hidden', background: 'transparent', boxShadow: 'none' }}>
            <img src={logoUrl} alt="Vasito Club" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>Catálogo</span>
          </NavLink>
          <NavLink to="/stock" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={20} />
            <span>Stock</span>
          </NavLink>
          <NavLink to="/finances" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Wallet size={20} />
            <span>Finanzas</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} />
            <span>Calendario</span>
          </NavLink>
          <NavLink to="/recipes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ChefHat size={20} />
            <span>Recetas</span>
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Reportes</span>
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
