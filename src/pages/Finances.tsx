import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { PlusCircle, ArrowDownCircle, ArrowUpCircle, Filter, BarChart3, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Finances.css';

const Finances: React.FC = () => {
  const { finances, stock, addFinanceRecord, updateFinanceRecord, deleteFinanceRecord, isLoading } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const [ingredientId, setIngredientId] = useState('');
  const [quantityAdded, setQuantityAdded] = useState<any>('');
  const [totalCost, setTotalCost] = useState<any>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientId || quantityAdded === '' || totalCost === '') return;

    await addFinanceRecord({
      id: '',
      date: date, // Keep as YYYY-MM-DD string
      ingredientId,
      quantityAdded: Number(quantityAdded),
      totalCost: Number(totalCost)
    });

    setIsModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !ingredientId || quantityAdded === '' || totalCost === '') return;

    await updateFinanceRecord({
      ...editingRecord,
      date: date, // Keep as YYYY-MM-DD string
      ingredientId,
      quantityAdded: Number(quantityAdded),
      totalCost: Number(totalCost)
    });

    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de compra?')) {
      await deleteFinanceRecord(id);
    }
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    setIngredientId(record.ingredientId);
    setQuantityAdded(record.quantityAdded);
    setTotalCost(record.totalCost);
    setDate(new Date(record.date).toISOString().slice(0, 10));
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setIngredientId('');
    setQuantityAdded('');
    setTotalCost('');
    setDate(new Date().toISOString().slice(0, 10));
    setEditingRecord(null);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const formatQuantity = (val: number) => {
    return Number.isInteger(val) ? val.toString() : val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
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
                    <span className="text-sm text-gray">
                      {new Date(record.date).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                    </span>
                  </div>
                  <div className="f-desc">
                    <h4>Compra de {item?.name || 'Insumo Eliminado'}</h4>
                    <p className="text-sm text-gray">+{formatQuantity(record.quantityAdded)} {item?.unit}</p>
                  </div>
                  <div className="f-amount" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>
                      -{formatCurrency(record.totalCost)}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(record)} title="Editar"><Edit size={16}/></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRecord(record.id)} title="Eliminar"><Trash2 size={16}/></button>
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
                <input type="number" step="any" min="0" className="input" value={quantityAdded} onChange={e => setQuantityAdded(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Costo Total ($) *</label>
                <input type="number" step="any" min="0" className="input" value={totalCost} onChange={e => setTotalCost(e.target.value)} required />
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
      {isEditModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Editar Compra</h2>
              <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="close-btn">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-body">
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
              </div>
              <div className="input-group">
                <label>Cantidad Comprada *</label>
                <input type="number" step="any" min="0" className="input" value={quantityAdded} onChange={e => setQuantityAdded(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Costo Total ($) *</label>
                <input type="number" step="any" min="0" className="input" value={totalCost} onChange={e => setTotalCost(e.target.value)} required />
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Actualizar Compra</button>
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
