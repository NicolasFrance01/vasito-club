import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Wallet, CalendarDays, ChefHat, BarChart3, Menu, X } from 'lucide-react';
import logoUrl from '../assets/logo.png';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="layout-container">
      {/* Botón Hamburguesa para Móvil */}
      <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Abrir menú">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cerrar al hacer clic afuera */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      <aside className={`sidebar glass ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ paddingBottom: '1rem' }}>
          <div className="logo-container" style={{ padding: 0, overflow: 'hidden', background: 'transparent', boxShadow: 'none' }}>
            <img src={logoUrl} alt="Vasito Club" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/catalog" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>Catálogo</span>
          </NavLink>
          <NavLink to="/stock" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={20} />
            <span>Stock</span>
          </NavLink>
          <NavLink to="/finances" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Wallet size={20} />
            <span>Finanzas</span>
          </NavLink>
          <NavLink to="/calendar" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} />
            <span>Calendario</span>
          </NavLink>
          <NavLink to="/recipes" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ChefHat size={20} />
            <span>Recetas</span>
          </NavLink>
          <NavLink to="/reports" onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
