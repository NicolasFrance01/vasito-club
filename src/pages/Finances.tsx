import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { PlusCircle, ArrowDownCircle } from 'lucide-react';
import './Finances.css';

const Finances: React.FC = () => {
  const { finances, stock, addFinanceRecord, isLoading } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [ingredientId, setIngredientId] = useState('');
  const [quantityAdded, setQuantityAdded] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

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

      <div className="card stat-card" style={{ maxWidth: '400px' }}>
        <div className="stat-icon bg-accent">
          <ArrowDownCircle size={24} color="var(--danger-color)" />
        </div>
        <div className="stat-info">
          <p className="text-gray">Total Gastado en Insumos</p>
          <h3 style={{ color: 'var(--danger-color)' }}>${totalSpent.toLocaleString()}</h3>
        </div>
      </div>

      <div className="card mt-2">
        <h2 className="text-xl" style={{ marginBottom: '1.5rem' }}>Historial de Compras</h2>
        <div className="finances-list">
          {finances.length === 0 ? (
            <div className="empty-state">
              <p>No tienes compras registradas aún.</p>
            </div>
          ) : (
            finances.map(record => {
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
