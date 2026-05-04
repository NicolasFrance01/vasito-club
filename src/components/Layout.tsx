import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Wallet, CalendarDays, IceCream2 } from 'lucide-react';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout-container">
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo-container">
            <IceCream2 size={32} color="var(--accent-color)" />
          </div>
          <h2>Vasito Club</h2>
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
        </nav>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
