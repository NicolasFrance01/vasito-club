import React, { useState } from 'react';
import { useAppData } from '../AppDataContext';
import { PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './Stock.css';

const Stock: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [minQuantity, setMinQuantity] = useState(1);
  const { stock, updateStock, addStockItem, isLoading } = useAppData();

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    updateStock(id, newQuantity);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStockItem({ name, quantity: 0, unit, minQuantity });
    setIsAddModalOpen(false);
    setName(''); setUnit('kg'); setMinQuantity(1);
  };

  if (isLoading) return <div className="p-4">Cargando stock...</div>;

  return (
    <div className="stock-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Inventario de Insumos</h1>
          <p className="text-gray">Controla tu stock y recibe alertas cuando te falte materia prima.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle size={20} />
          Nuevo Insumo
        </button>
      </div>

      <div className="card">
        <div className="stock-list">
          <div className="stock-header">
            <div className="col-name">Insumo</div>
            <div className="col-status">Estado</div>
            <div className="col-qty">Cantidad Disponible</div>
            <div className="col-actions">Acciones</div>
          </div>
          
          {stock.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '1rem' }}>
              <p>No tienes insumos registrados. ¡Agrega uno nuevo!</p>
            </div>
          ) : (
            stock.map(item => {
              const isLow = item.quantity <= item.minQuantity;
              return (
                <div key={item.id} className={`stock-item ${isLow ? 'low-stock' : ''}`}>
                  <div className="col-name">
                    <h4>{item.name}</h4>
                    <span className="text-sm text-gray">Mínimo: {item.minQuantity} {item.unit}</span>
                  </div>
                  <div className="col-status">
                    {isLow ? (
                      <span className="badge badge-pending"><AlertTriangle size={14} /> Stock Bajo</span>
                    ) : (
                      <span className="badge badge-ready"><CheckCircle2 size={14} /> Óptimo</span>
                    )}
                  </div>
                  <div className="col-qty">
                    <span className="qty-value">{item.quantity}</span> {item.unit}
                  </div>
                  <div className="col-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Nuevo Tipo de Insumo</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddStock} className="modal-body">
              <div className="input-group">
                <label>Nombre del Insumo *</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Dulce de Leche" />
              </div>
              <div className="input-group">
                <label>Unidad de Medida *</label>
                <select className="input" value={unit} onChange={e => setUnit(e.target.value)} required>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="gr">Gramos (gr)</option>
                  <option value="lt">Litros (lt)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="un">Unidades (un)</option>
                  <option value="paquetes">Paquetes</option>
                </select>
              </div>
              <div className="input-group">
                <label>Alerta de Stock Mínimo *</label>
                <input type="number" step="0.1" min="0" className="input" value={minQuantity} onChange={e => setMinQuantity(Number(e.target.value))} required />
                <span className="text-sm text-gray mt-2">Te avisaremos cuando haya {minQuantity} {unit} o menos.</span>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Insumo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
