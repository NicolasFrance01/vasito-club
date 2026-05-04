import React, { useState } from 'react';
import { useAppData } from '../AppDataContext';
import { PlusCircle, TrendingUp, Clock, Package } from 'lucide-react';
import NewOrderModal from '../components/NewOrderModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { orders } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick stats calculations
  const todaysOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'En Preparación');

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Hola, Vasito Club 👋</h1>
          <p className="text-gray">Aquí tienes un resumen de tu negocio hoy.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          Nuevo Pedido
        </button>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-accent">
            <TrendingUp size={24} color="var(--accent-color)" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Ventas de Hoy</p>
            <h3>${todaysRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-blue">
            <Clock size={24} color="var(--status-prep-text)" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Pedidos Pendientes</p>
            <h3>{pendingOrders.length}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-green">
            <Package size={24} color="var(--status-ready-text)" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Total Pedidos Hoy</p>
            <h3>{todaysOrders.length}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card recent-orders">
          <h2 className="text-xl">Pedidos Recientes</h2>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No hay pedidos todavía. ¡Empieza creando uno nuevo!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <h4>{order.customerName}</h4>
                    <p className="text-sm text-gray">{new Date(order.date).toLocaleString('es-AR')}</p>
                  </div>
                  <div className="order-status">
                    <span className={`badge badge-${order.status === 'Pendiente' ? 'pending' : order.status === 'En Preparación' ? 'prep' : 'ready'}`}>
                      {order.status}
                    </span>
                    <span className="order-total">${order.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <NewOrderModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;
