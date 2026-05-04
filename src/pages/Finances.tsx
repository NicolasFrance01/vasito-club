import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { PlusCircle, ArrowDownCircle, ArrowUpCircle, Filter, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Finances.css';

const Finances: React.FC = () => {
  const { finances, stock, addFinanceRecord, isLoading } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [ingredientId, setIngredientId] = useState('');
  const [quantityAdded, setQuantityAdded] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientId || quantityAdded === '' || totalCost === '') return;

    await addFinanceRecord({
      id: '',
      date: new Date(date).toISOString(),
      ingredientId,
      quantityAdded: Number(quantityAdded),
      totalCost: Number(totalCost)
    });

    setIsModalOpen(false);
    setIngredientId(''); setQuantityAdded(''); setTotalCost('');
  };

  if (isLoading) return <div className="p-4">Cargando finanzas...</div>;

  const totalSpent = finances.reduce((sum, f) => sum + f.totalCost, 0);

  // Filters logic
  const now = new Date();
  const filteredFinances = finances.filter(f => {
    if (timeFilter === 'all') return true;
    const fDate = new Date(f.date);
    if (timeFilter === 'today') return fDate.toDateString() === now.toDateString();
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return fDate >= oneWeekAgo && fDate <= now;
    }
    if (timeFilter === 'month') return fDate.getMonth() === now.getMonth() && fDate.getFullYear() === now.getFullYear();
    if (timeFilter === 'custom') return fDate.toDateString() === new Date(customDate).toDateString();
    return true;
  });

  const { orders } = useAppData();
  const totalEarned = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="finances animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Finanzas y Compras</h1>
          <p className="text-gray">Registra tus gastos en insumos y mira tu historial.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          Registrar Compra
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon bg-green">
            <ArrowUpCircle size={24} color="var(--success-color)" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Total Histórico Vendido</p>
            <h3 style={{ color: 'var(--success-color)' }}>${totalEarned.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon bg-accent">
            <ArrowDownCircle size={24} color="var(--danger-color)" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Total Gastado en Insumos</p>
            <h3 style={{ color: 'var(--danger-color)' }}>${totalSpent.toLocaleString()}</h3>
          </div>
        </div>

        <Link to="/reports" className="card stat-card" style={{ cursor: 'pointer', textDecoration: 'none', background: 'var(--bg-color)', border: '1px solid var(--accent-color)' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-color)' }}>
            <BarChart3 size={24} color="white" />
          </div>
          <div className="stat-info">
            <h3 style={{ color: 'var(--accent-color)' }}>Ver Reportes Detallados</h3>
            <p className="text-gray">Gráficos de ventas y métricas avanzadas.</p>
          </div>
        </Link>
      </div>

      <div className="card mt-2">
        <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
          <h2 className="text-xl">Historial de Compras</h2>
          <div className="filters flex items-center gap-2">
            <Filter size={18} color="var(--text-secondary)" />
            <select className="input" value={timeFilter} onChange={e => setTimeFilter(e.target.value as any)}>
              <option value="all">Todo Histórico</option>
              <option value="today">Hoy</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Este Mes</option>
              <option value="custom">Fecha Específica</option>
            </select>
            {timeFilter === 'custom' && (
              <input type="date" className="input" value={customDate} onChange={e => setCustomDate(e.target.value)} />
            )}
          </div>
        </div>
        
        <div className="finances-list">
          {filteredFinances.length === 0 ? (
            <div className="empty-state">
              <p>No tienes compras registradas aún.</p>
            </div>
          ) : (
            filteredFinances.map(record => {
              const item = stock.find(s => s.id === record.ingredientId);
              return (
                <div key={record.id} className="finance-item">
                  <div className="f-date">
                    <span className="text-sm text-gray">{new Date(record.date).toLocaleDateString('es-AR')}</span>
                  </div>
                  <div className="f-desc">
                    <h4>Compra de {item?.name || 'Insumo Eliminado'}</h4>
                    <p className="text-sm text-gray">+{record.quantityAdded} {item?.unit}</p>
                  </div>
                  <div className="f-amount">
                    <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>
                      -${record.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Registrar Compra</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="input-group">
                <label>Fecha de Compra</label>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Insumo *</label>
                <select className="input" value={ingredientId} onChange={e => setIngredientId(e.target.value)} required>
                  <option value="">Seleccionar insumo...</option>
                  {stock.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (en {s.unit})</option>
                  ))}
                </select>
                {stock.length === 0 && <span className="text-sm text-gray mt-2">Atención: Primero debes crear Insumos en el módulo Stock.</span>}
              </div>
              <div className="input-group">
                <label>Cantidad Comprada *</label>
                <input type="number" step="0.01" min="0.01" className="input" value={quantityAdded} onChange={e => setQuantityAdded(Number(e.target.value))} required />
              </div>
              <div className="input-group">
                <label>Costo Total ($) *</label>
                <input type="number" step="1" min="0" className="input" value={totalCost} onChange={e => setTotalCost(Number(e.target.value))} required />
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={stock.length === 0}>Guardar Compra</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Finances;
