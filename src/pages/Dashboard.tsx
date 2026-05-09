import React, { useState } from 'react';
import { useAppData } from '../AppDataContext';
import { PlusCircle, TrendingUp, Clock, Package, Edit, Trash2, User, History } from 'lucide-react';
import NewOrderModal from '../components/NewOrderModal';
import type { Order } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { orders, deleteOrder, updateOrderStatus } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | undefined>(undefined);

  // Quick stats calculations
  const todaysOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'En Elaboración' || o.status === 'En Envío');

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Hola, Vasito Club 👋</h1>
          <p className="text-gray">Aquí tienes un resumen de tu negocio hoy.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setOrderToEdit(undefined); setIsModalOpen(true); }}>
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
              {orders.slice(0, 10).map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <h4>{order.customerName}</h4>
                    <p className="text-sm text-gray">{new Date(order.date).toLocaleString('es-AR')}</p>
                    <div className="order-audit-info">
                      <div className="audit-item">
                        <User size={12} /> {order.createdByUsername || 'Sistema'}
                      </div>
                      {order.history && order.history.length > 1 && (
                        <div className="history-indicator" title={
                          order.history.map(h => `${new Date(h.date).toLocaleTimeString('es-AR')}: ${h.status} (${h.username || '?'})`).join('\n')
                        }>
                          <History size={12} /> {order.history.length} cambios
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="order-status-actions">
                    <select 
                      className={`status-select status-${order.status.toLowerCase().replace(/ /g, '-')}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Elaboración">En Elaboración</option>
                      <option value="En Envío">En Envío</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                    <span className="order-total">${order.total.toLocaleString()}</span>
                    <div className="item-actions">
                      <button 
                        className="btn btn-secondary icon-btn" 
                        title="Editar Pedido"
                        onClick={() => { setOrderToEdit(order); setIsModalOpen(true); }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-danger icon-btn" 
                        title="Eliminar Pedido"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
                            deleteOrder(order.id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <NewOrderModal onClose={() => setIsModalOpen(false)} orderToEdit={orderToEdit} />}
    </div>
  );
};

export default Dashboard;
